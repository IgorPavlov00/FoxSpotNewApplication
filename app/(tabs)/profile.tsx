import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    ScrollView,
    Animated,
    Dimensions,
    Platform,
    StatusBar,
    Alert,
} from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

export default function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [imageLoadError, setImageLoadError] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const avatarScale = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        if (!loading) {
            // Entrance animations
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 80,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 80,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.spring(avatarScale, {
                    toValue: 1,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [loading]);

    const fetchUserData = async () => {
        try {
            setLoading(true);

            // Get auth user
            const { data: authData, error: authError } = await supabase.auth.getUser();

            if (authError) {
                console.error('Failed to fetch auth user:', authError.message);
                return;
            }

            setUser(authData.user);

            // Get user profile from users table
            const { data: profileData, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (profileError) {
                console.error('Failed to fetch user profile:', profileError.message);
                // Create user profile if it doesn't exist
                await createUserProfile(authData.user);
            } else if (profileData) {
                setUserProfile(profileData);
            } else {
                // No profile found, create one
                console.log('No user profile found, creating one...');
                await createUserProfile(authData.user);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const createUserProfile = async (authUser) => {
        try {
            const userData = {
                id: authUser.id,
                email: authUser.email,
                full_name: authUser.user_metadata?.full_name ||
                    `${authUser.user_metadata?.first_name || ''} ${authUser.user_metadata?.last_name || ''}`.trim() ||
                    'FoxSpot User',
                username: null,
                avatar_url: authUser.user_metadata?.avatar_url || null,
                role: 'user',
                created_at: new Date().toISOString(),
            };

            const { data, error } = await supabase
                .from('users')
                .insert([userData])
                .select()
                .single();

            if (error) {
                console.error('Failed to create user profile:', error.message);
                // Set a default profile if database creation fails
                setUserProfile({
                    id: authUser.id,
                    email: authUser.email,
                    full_name: authUser.user_metadata?.full_name || 'FoxSpot User',
                    username: null,
                    avatar_url: null,
                    role: 'user',
                    created_at: new Date().toISOString(),
                });
            } else {
                setUserProfile(data);
                console.log('User profile created successfully');
            }
        } catch (error) {
            console.error('Error creating user profile:', error);
            // Fallback to auth user data
            setUserProfile({
                id: authUser.id,
                email: authUser.email,
                full_name: authUser.user_metadata?.full_name || 'FoxSpot User',
                username: null,
                avatar_url: null,
                role: 'user',
                created_at: new Date().toISOString(),
            });
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchUserData();
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        const { error } = await supabase.auth.signOut();
                        if (error) {
                            Alert.alert('Error', 'Failed to logout');
                        } else {
                            router.replace('/(auth)/LoginScreen');
                        }
                    },
                },
            ]
        );
    };

    const handleEditProfile = () => {
        // Navigate to edit profile screen
        Alert.alert('Edit Profile', 'Edit profile functionality coming soon!');
    };

    const handleUpdateProfilePicture = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                Alert.alert('Permission Required', 'Permission to access camera roll is required!');
                return;
            }

            const pickerResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!pickerResult.canceled) {
                setUploadingImage(true);
                await uploadProfilePicture(pickerResult.assets[0].uri);
            }
        } catch (error) {
            console.error('Error selecting image:', error);
            Alert.alert('Error', 'Failed to select image');
            setUploadingImage(false);
        }
    };

    const uploadProfilePicture = async (imageUri) => {
        try {
            const fileExt = imageUri.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;

            // Delete old avatar if exists
            if (userProfile?.avatar_url) {
                try {
                    const oldFileName = userProfile.avatar_url.split('/').pop();
                    await supabase.storage
                        .from('avatars')
                        .remove([oldFileName]);
                } catch (deleteError) {
                    console.log('Failed to delete old avatar (non-critical):', deleteError);
                }
            }

            // Create form data for upload
            const response = await fetch(imageUri);
            const blob = await response.blob();

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, blob, {
                    contentType: `image/${fileExt}`,
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                throw uploadError;
            }

            // Get the public URL
            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            if (!urlData.publicUrl) {
                throw new Error('Failed to get public URL');
            }

            // Update user profile with new avatar URL
            const { data: updateData, error: updateError } = await supabase
                .from('users')
                .update({
                    avatar_url: urlData.publicUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)
                .select()
                .single();

            if (updateError) {
                throw updateError;
            }

            // Update local state with the returned data
            setUserProfile(updateData);
            setImageLoadError(false);

            Alert.alert('Success', 'Profile picture updated successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert(
                'Upload Failed',
                error.message || 'Failed to update profile picture. Please try again.'
            );
        } finally {
            setUploadingImage(false);
        }
    };

    const animatePress = (animValue, toValue = 0.95) => {
        Animated.sequence([
            Animated.spring(animValue, {
                toValue,
                tension: 300,
                friction: 10,
                useNativeDriver: true,
            }),
            Animated.spring(animValue, {
                toValue: 1,
                tension: 300,
                friction: 10,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleImageError = () => {
        setImageLoadError(true);
        console.log('Image failed to load:', userProfile?.avatar_url);
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar barStyle="light-content" backgroundColor="#000000" />
                <ActivityIndicator size="large" color="#ff6b00" />
                <Text style={styles.loadingText}>Loading your profile...</Text>
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar barStyle="light-content" backgroundColor="#000000" />
                <Ionicons name="person-outline" size={64} color="#666" />
                <Text style={styles.errorText}>No user is logged in</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => router.replace('/(auth)/LoginScreen')}
                >
                    <Text style={styles.retryButtonText}>Go to Login</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const displayName = userProfile?.full_name ||
        user?.user_metadata?.full_name ||
        `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim() ||
        'FoxSpot User';

    const memberSince = userProfile?.created_at ?
        new Date(userProfile.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
        }) :
        'Recently';

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    refreshing ? (
                        <ActivityIndicator
                            color="#ff6b00"
                            style={{ marginTop: 50 }}
                        />
                    ) : undefined
                }
                onRefresh={handleRefresh}
            >
                {/* Header Section */}
                <Animated.View
                    style={[
                        styles.headerSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <LinearGradient
                        colors={['rgba(255, 107, 0, 0.1)', 'transparent']}
                        style={styles.headerGradient}
                    />

                    {/* Settings Button */}
                    <TouchableOpacity
                        style={styles.settingsButton}
                        onPress={() => animatePress(scaleAnim)}
                    >
                        <Ionicons name="settings-outline" size={24} color="#fff" />
                    </TouchableOpacity>

                    {/* Profile Picture */}
                    <Animated.View
                        style={[
                            styles.avatarContainer,
                            { transform: [{ scale: avatarScale }] }
                        ]}
                    >
                        <TouchableOpacity onPress={() => animatePress(avatarScale)}>
                            {userProfile?.avatar_url && !imageLoadError ? (
                                <Image
                                    source={{
                                        uri: userProfile.avatar_url,
                                        cache: 'force-cache'
                                    }}
                                    style={styles.avatar}
                                    onError={handleImageError}
                                    onLoad={() => setImageLoadError(false)}
                                />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarInitials}>
                                        {displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </Text>
                                </View>
                            )}
                            <TouchableOpacity
                                style={styles.cameraIcon}
                                onPress={handleUpdateProfilePicture}
                                disabled={uploadingImage}
                            >
                                {uploadingImage ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Ionicons name="camera" size={16} color="#fff" />
                                )}
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* User Info */}
                    <Text style={styles.displayName}>{displayName}</Text>
                    <Text style={styles.email}>{userProfile?.email || user.email}</Text>
                    {userProfile?.username && (
                        <Text style={styles.username}>@{userProfile.username}</Text>
                    )}
                    <Text style={styles.memberSince}>Member since {memberSince}</Text>
                </Animated.View>

                {/* Stats Section */}
                <Animated.View
                    style={[
                        styles.statsSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }]
                        }
                    ]}
                >
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>12</Text>
                        <Text style={styles.statLabel}>Events Joined</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>5</Text>
                        <Text style={styles.statLabel}>Events Created</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>8</Text>
                        <Text style={styles.statLabel}>Saved Events</Text>
                    </View>
                </Animated.View>

                {/* Profile Details */}
                <Animated.View
                    style={[
                        styles.detailsSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Text style={styles.sectionTitle}>Profile Details</Text>

                    <View style={styles.detailItem}>
                        <Ionicons name="mail-outline" size={20} color="#ff6b00" />
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Email</Text>
                            <Text style={styles.detailValue}>{userProfile?.email || user.email}</Text>
                        </View>
                    </View>

                    <View style={styles.detailItem}>
                        <Ionicons name="person-outline" size={20} color="#ff6b00" />
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Full Name</Text>
                            <Text style={styles.detailValue}>{displayName}</Text>
                        </View>
                    </View>

                    <View style={styles.detailItem}>
                        <Ionicons name="shield-outline" size={20} color="#ff6b00" />
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Role</Text>
                            <Text style={styles.detailValue}>{userProfile?.role || 'User'}</Text>
                        </View>
                    </View>

                    <View style={styles.detailItem}>
                        <Ionicons name="calendar-outline" size={20} color="#ff6b00" />
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Account ID</Text>
                            <Text style={styles.detailValue}>{user.id.slice(0, 8)}...</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Action Buttons */}
                <Animated.View
                    style={[
                        styles.actionsSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }]
                        }
                    ]}
                >
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={handleEditProfile}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="create-outline" size={20} color="#fff" />
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="log-out-outline" size={20} color="#ff4444" />
                        <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>
                </Animated.View>

                <View style={styles.bottomPadding} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
        gap: 16,
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    errorText: {
        color: '#999',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    retryButton: {
        backgroundColor: '#ff6b00',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 20,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    headerSection: {
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 24,
        paddingBottom: 32,
        position: 'relative',
    },
    headerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 200,
    },
    settingsButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        right: 24,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: 'blur(10px)',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#ff6b00',
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#ff6b00',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#ff8533',
    },
    avatarInitials: {
        fontSize: 36,
        fontWeight: '800',
        color: '#fff',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#ff6b00',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000',
    },
    displayName: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginBottom: 4,
    },
    username: {
        fontSize: 16,
        color: '#ff6b00',
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: 8,
    },
    memberSince: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    statsSection: {
        flexDirection: 'row',
        backgroundColor: '#1a1a1a',
        marginHorizontal: 24,
        borderRadius: 16,
        paddingVertical: 20,
        marginBottom: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '800',
        color: '#ff6b00',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#999',
        fontWeight: '500',
        textAlign: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#333',
        marginVertical: 8,
    },
    detailsSection: {
        backgroundColor: '#1a1a1a',
        marginHorizontal: 24,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 20,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    detailContent: {
        marginLeft: 16,
        flex: 1,
    },
    detailLabel: {
        fontSize: 14,
        color: '#999',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
        marginTop: 2,
    },
    actionsSection: {
        paddingHorizontal: 24,
        gap: 12,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ff6b00',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        elevation: 4,
        shadowColor: '#ff6b00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ff4444',
        gap: 8,
    },
    logoutButtonText: {
        color: '#ff4444',
        fontSize: 16,
        fontWeight: '600',
    },
    bottomPadding: {
        height: 120,
    },
});