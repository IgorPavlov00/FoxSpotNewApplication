import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Animated,
    ActivityIndicator,
    Dimensions,
    Easing,
    Image,
    Alert,
    ScrollView,
    StatusBar,
    Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function EditProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [imageLoadError, setImageLoadError] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Focus states
    const [firstNameFocused, setFirstNameFocused] = useState(false);
    const [lastNameFocused, setLastNameFocused] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [usernameFocused, setUsernameFocused] = useState(false);

    // Toast state
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('');

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const avatarScale = useRef(new Animated.Value(0.8)).current;

    // Toast animations
    const toastTranslateY = useRef(new Animated.Value(-100)).current;
    const toastOpacity = useRef(new Animated.Value(0)).current;

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
            if (authError) throw authError;

            setUser(authData.user);

            // Get user profile from users table
            const { data: profileData, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (!profileError && profileData) {
                setUserProfile(profileData);
                // Populate form fields
                setFirstName(profileData.first_name || '');
                setLastName(profileData.last_name || '');
                setEmail(profileData.email || authData.user.email);
                setUsername(profileData.username || '');
                setProfilePicture(profileData.avatar_url || profileData.profile_picture_url);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            showToast('Failed to load profile data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type) => {
        setToastMessage(message);
        setToastType(type);

        // Show toast animation
        Animated.parallel([
            Animated.spring(toastTranslateY, {
                toValue: 0,
                tension: 150,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(toastOpacity, {
                toValue: 1,
                duration: 300,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
        ]).start();

        // Auto-hide toast after 3 seconds
        setTimeout(() => {
            hideToast();
        }, 3000);
    };

    const hideToast = () => {
        Animated.parallel([
            Animated.spring(toastTranslateY, {
                toValue: -100,
                tension: 150,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(toastOpacity, {
                toValue: 0,
                duration: 200,
                easing: Easing.in(Easing.quad),
                useNativeDriver: true,
            }),
        ]).start(() => {
            setToastMessage('');
            setToastType('');
        });
    };

    const handleImagePicker = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                Alert.alert('Permission Required', 'Permission to access camera roll is required!');
                return;
            }

            const pickerResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
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
            showToast('Failed to select image', 'error');
        }
    };

    const uploadProfilePicture = async (imageUri) => {
        try {
            const fileExt = imageUri.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `profile-pictures/${fileName}`;

            // Upload to Supabase Storage
            const formData = new FormData();
            formData.append('file', {
                uri: imageUri,
                type: `image/${fileExt}`,
                name: fileName,
            });

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, formData, {
                    contentType: `image/${fileExt}`,
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setProfilePicture(publicUrl);
            setImageLoadError(false);
            showToast('Profile picture updated!', 'success');

        } catch (error) {
            console.error('Upload error:', error);
            showToast('Failed to upload image', 'error');
        } finally {
            setUploadingImage(false);
        }
    };

    const saveProfile = async () => {
        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        setSaving(true);

        try {
            const updatedData = {
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                full_name: `${firstName.trim()} ${lastName.trim()}`,
                email: email.trim(),
                username: username.trim() || null,
                avatar_url: profilePicture,
                profile_picture_url: profilePicture,
            };

            // Update users table
            const { error: updateError } = await supabase
                .from('users')
                .update(updatedData)
                .eq('id', user.id);

            if (updateError) throw updateError;

            // Update auth metadata if email changed
            if (email !== user.email) {
                const { error: authError } = await supabase.auth.updateUser({
                    email: email,
                    data: {
                        first_name: firstName.trim(),
                        last_name: lastName.trim(),
                        full_name: `${firstName.trim()} ${lastName.trim()}`,
                        profile_picture_url: profilePicture,
                    }
                });

                if (authError) throw authError;
            } else {
                // Update metadata without email change
                const { error: authError } = await supabase.auth.updateUser({
                    data: {
                        first_name: firstName.trim(),
                        last_name: lastName.trim(),
                        full_name: `${firstName.trim()} ${lastName.trim()}`,
                        profile_picture_url: profilePicture,
                    }
                });

                if (authError) throw authError;
            }

            showToast('Profile updated successfully!', 'success');

            // Navigate back after short delay
            setTimeout(() => {
                router.back();
            }, 1500);

        } catch (error) {
            console.error('Save error:', error);
            showToast(error.message || 'Failed to update profile', 'error');
        } finally {
            setSaving(false);
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

    const displayName = `${firstName} ${lastName}`.trim() || 'User';

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <ActivityIndicator size="large" color="#ff6b00" />
        <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
    );
    }

    return (
        <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />

        {/* Toast Notification */}
    {toastMessage ? (
            <Animated.View
                style={[
                    styles.toast,
                styles[`toast${toastType.charAt(0).toUpperCase() + toastType.slice(1)}`],
        {
            opacity: toastOpacity,
            transform: [{ translateY: toastTranslateY }],
        },
    ]}
    >
        <Text style={styles.toastText}>{toastMessage}</Text>
            </Animated.View>
    ) : null}

    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View
    style={[
            styles.header,
    {
        opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
    }
]}
>
    <TouchableOpacity
        style={styles.backButton}
    onPress={() => router.back()}
>
    <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Edit Profile</Text>

    <TouchableOpacity
    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
    onPress={saveProfile}
    disabled={saving}
        >
        {saving ? (
                <ActivityIndicator size="small" color="#fff" />
) : (
        <Text style={styles.saveButtonText}>Save</Text>
    )}
    </TouchableOpacity>
    </Animated.View>

    {/* Profile Picture Section */}
    <Animated.View
        style={[
            styles.profilePicSection,
    {
        opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
    }
]}
>
    <View style={styles.avatarContainer}>
    <TouchableOpacity onPress={handleImagePicker}>
    {profilePicture && !imageLoadError ? (
        <Image
            source={{ uri: profilePicture }}
    style={styles.avatar}
    onError={() => setImageLoadError(true)}
    />
) : (
        <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarInitials}>
            {displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </Text>
            </View>
    )}
    <View style={styles.cameraIconContainer}>
        {uploadingImage ? (
                <ActivityIndicator size="small" color="#fff" />
) : (
        <Ionicons name="camera" size={20} color="#fff" />
)}
    </View>
    </TouchableOpacity>
    </View>
    <Text style={styles.changePhotoText}>Tap to change photo</Text>
    </Animated.View>

    {/* Form Section */}
    <Animated.View
        style={[
            styles.formSection,
    {
        opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
    }
]}
>
    {/* First Name */}
    <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>First Name *</Text>
    <TextInput
    style={[
            styles.input,
        firstNameFocused && styles.inputFocused,
]}
    value={firstName}
    onChangeText={setFirstName}
    placeholder="Enter your first name"
    placeholderTextColor="#666"
    autoCapitalize="words"
    onFocus={() => setFirstNameFocused(true)}
    onBlur={() => setFirstNameFocused(false)}
    />
    </View>

    {/* Last Name */}
    <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>Last Name *</Text>
    <TextInput
    style={[
            styles.input,
        lastNameFocused && styles.inputFocused,
]}
    value={lastName}
    onChangeText={setLastName}
    placeholder="Enter your last name"
    placeholderTextColor="#666"
    autoCapitalize="words"
    onFocus={() => setLastNameFocused(true)}
    onBlur={() => setLastNameFocused(false)}
    />
    </View>

    {/* Email */}
    <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>Email *</Text>
        <TextInput
    style={[
            styles.input,
        emailFocused && styles.inputFocused,
]}
    value={email}
    onChangeText={setEmail}
    placeholder="Enter your email"
    placeholderTextColor="#666"
    keyboardType="email-address"
    autoCapitalize="none"
    onFocus={() => setEmailFocused(true)}
    onBlur={() => setEmailFocused(false)}
    />
    </View>

    {/* Username */}
    <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>Username</Text>
        <TextInput
    style={[
            styles.input,
        usernameFocused && styles.inputFocused,
]}
    value={username}
    onChangeText={setUsername}
    placeholder="Choose a username (optional)"
    placeholderTextColor="#666"
    autoCapitalize="none"
    onFocus={() => setUsernameFocused(true)}
    onBlur={() => setUsernameFocused(false)}
    />
    </View>

    <Text style={styles.requiredNote}>* Required fields</Text>
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
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        paddingHorizontal: 24,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    saveButton: {
        backgroundColor: '#ff6b00',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        minWidth: 60,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    profilePicSection: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
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
    cameraIconContainer: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#ff6b00',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#000',
    },
    changePhotoText: {
        color: '#999',
        fontSize: 14,
        fontWeight: '500',
    },
    formSection: {
        paddingHorizontal: 24,
    },
    inputGroup: {
        marginBottom: 24,
    },
    inputLabel: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#1a1a1a',
        color: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        fontSize: 16,
        borderColor: '#333',
        borderWidth: 1.5,
        fontWeight: '500',
    },
    inputFocused: {
        borderColor: '#ff6b00',
        backgroundColor: '#252525',
    },
    requiredNote: {
        color: '#666',
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 16,
    },
    bottomPadding: {
        height: 100,
    },
    // Toast styles
    toast: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        left: 24,
        right: 24,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    toastSuccess: {
        backgroundColor: '#22c55e',
        borderLeftWidth: 4,
        borderLeftColor: '#16a34a',
    },
    toastError: {
        backgroundColor: '#ef4444',
        borderLeftWidth: 4,
        borderLeftColor: '#dc2626',
    },
    toastText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});