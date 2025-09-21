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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from "expo-file-system";

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
    const router = useRouter();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [firstNameFocused, setFirstNameFocused] = useState(false);
    const [lastNameFocused, setLastNameFocused] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState(''); // 'success' or 'error'

    // Professional animation values
    const containerOpacity = useRef(new Animated.Value(0)).current;
    const titleTranslateY = useRef(new Animated.Value(-50)).current;
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const titleScale = useRef(new Animated.Value(0.7)).current;

    const profilePicTranslateY = useRef(new Animated.Value(30)).current;
    const profilePicOpacity = useRef(new Animated.Value(0)).current;
    const profilePicScale = useRef(new Animated.Value(0.8)).current;

    const firstNameTranslateY = useRef(new Animated.Value(30)).current;
    const firstNameOpacity = useRef(new Animated.Value(0)).current;
    const firstNameScale = useRef(new Animated.Value(1)).current;

    const lastNameTranslateY = useRef(new Animated.Value(30)).current;
    const lastNameOpacity = useRef(new Animated.Value(0)).current;
    const lastNameScale = useRef(new Animated.Value(1)).current;

    const emailTranslateY = useRef(new Animated.Value(30)).current;
    const emailOpacity = useRef(new Animated.Value(0)).current;
    const emailScale = useRef(new Animated.Value(1)).current;

    const passwordTranslateY = useRef(new Animated.Value(30)).current;
    const passwordOpacity = useRef(new Animated.Value(0)).current;
    const passwordScale = useRef(new Animated.Value(1)).current;

    const buttonTranslateY = useRef(new Animated.Value(30)).current;
    const buttonOpacity = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    const linkTranslateY = useRef(new Animated.Value(20)).current;
    const linkOpacity = useRef(new Animated.Value(0)).current;

    // Toast animation values
    const toastTranslateY = useRef(new Animated.Value(-100)).current;
    const toastOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Rapid sequential entrance animation
        const createEntranceAnimation = () => {
            return Animated.stagger(70, [
                // Container fade in
                Animated.timing(containerOpacity, {
                    toValue: 1,
                    duration: 300,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),

                // Title entrance
                Animated.parallel([
                    Animated.timing(titleOpacity, {
                        toValue: 1,
                        duration: 350,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.spring(titleTranslateY, {
                        toValue: 0,
                        tension: 200,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                    Animated.spring(titleScale, {
                        toValue: 1,
                        tension: 200,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                ]),

                // Profile picture
                Animated.parallel([
                    Animated.spring(profilePicTranslateY, {
                        toValue: 0,
                        tension: 200,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                    Animated.timing(profilePicOpacity, {
                        toValue: 1,
                        duration: 300,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.spring(profilePicScale, {
                        toValue: 1,
                        tension: 200,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                ]),

                // First name input
                Animated.parallel([
                    Animated.spring(firstNameTranslateY, {
                        toValue: 0,
                        tension: 200,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                    Animated.timing(firstNameOpacity, {
                        toValue: 1,
                        duration: 300,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                ]),

                // Last name input
                Animated.parallel([
                    Animated.spring(lastNameTranslateY, {
                        toValue: 0,
                        tension: 200,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                    Animated.timing(lastNameOpacity, {
                        toValue: 1,
                        duration: 300,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                ]),

                // Email input
                Animated.parallel([
                    Animated.spring(emailTranslateY, {
                        toValue: 0,
                        tension: 200,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                    Animated.timing(emailOpacity, {
                        toValue: 1,
                        duration: 300,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                ]),

                // Password input
                Animated.parallel([
                    Animated.spring(passwordTranslateY, {
                        toValue: 0,
                        tension: 200,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                    Animated.timing(passwordOpacity, {
                        toValue: 1,
                        duration: 200,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                ]),

                // Button
                Animated.parallel([
                    Animated.spring(buttonTranslateY, {
                        toValue: 0,
                        tension: 200,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                    Animated.timing(buttonOpacity, {
                        toValue: 1,
                        duration: 300,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                ]),

                // Link
                Animated.parallel([
                    Animated.spring(linkTranslateY, {
                        toValue: 0,
                        tension: 300,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                    Animated.timing(linkOpacity, {
                        toValue: 0.8,
                        duration: 300,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                ]),
            ]);
        };

        // Start the professional entrance sequence
        createEntranceAnimation().start();
    }, []);

    const animateInputFocus = (scaleAnim, focused) => {
        Animated.spring(scaleAnim, {
            toValue: focused ? 1.02 : 1,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };

    const animateButtonPress = (scale) => {
        Animated.spring(buttonScale, {
            toValue: scale,
            tension: 400,
            friction: 8,
            useNativeDriver: true,
        }).start();
    };

    const animateLinkPress = (opacity) => {
        Animated.timing(linkOpacity, {
            toValue: opacity,
            duration: 250,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
        }).start();
    };

    const animateProfilePicPress = () => {
        Animated.sequence([
            Animated.spring(profilePicScale, {
                toValue: 0.95,
                tension: 300,
                friction: 10,
                useNativeDriver: true,
            }),
            Animated.spring(profilePicScale, {
                toValue: 1,
                tension: 300,
                friction: 10,
                useNativeDriver: true,
            }),
        ]).start();
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

    const pickImage = async () => {
        animateProfilePicPress();

        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert('Permission Required', 'Permission to access camera roll is required!');
            return;
        }

        const pickerResult =await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1,
        });

        if (!pickerResult.canceled) {
            setProfilePicture(pickerResult.assets[0].uri);
        }
    };
    const register = async () => {
        if (!firstName || !lastName || !email || !password) {
            showToast("Please fill in all fields", "error");
            return;
        }

        if (password.length < 6) {
            showToast("Password must be at least 6 characters long", "error");
            return;
        }

        setIsLoading(true);

        try {
            // Create Supabase Auth user - trigger will automatically create users table record
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                        full_name: `${firstName} ${lastName}`,
                    },
                },
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("User creation failed");

            // ❌ REMOVE THIS ENTIRE BLOCK - Trigger handles it automatically
            /*
            const { error: insertError } = await supabase.from("users").insert({
                id: authData.user.id, // must equal auth.uid()
                first_name: firstName,
                last_name: lastName,
                full_name: `${firstName} ${lastName}`,
                email: email,
            });

            if (insertError) throw insertError;
            */

            setIsLoading(false);

            // ✅ Success toast
            showToast("🎉 Registration successful! Check your email to confirm.", "success");

            // Redirect after short delay
            setTimeout(() => {
                router.replace("/(auth)/LoginScreen");
            }, 1500);

        } catch (error) {
            setIsLoading(false);
            console.error("Registration error:", error);
            showToast(error.message || "Registration failed.", "error");
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: containerOpacity,
                },
            ]}
        >
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

            <Animated.Text
                style={[
                    styles.title,
                    {
                        opacity: titleOpacity,
                        transform: [
                            { translateY: titleTranslateY },
                            { scale: titleScale }
                        ],
                    },
                ]}
            >
                Join Fox Spot 🦊
            </Animated.Text>

            {/* Profile Picture */}
            <Animated.View
                style={[
                    styles.profilePicContainer,
                    {
                        opacity: profilePicOpacity,
                        transform: [
                            { translateY: profilePicTranslateY },
                            { scale: profilePicScale }
                        ],
                    },
                ]}
            >
                <TouchableOpacity style={styles.profilePicButton} onPress={pickImage}>
                    {profilePicture ? (
                        <Image source={{ uri: profilePicture }} style={styles.profilePic} />
                    ) : (
                        <View style={styles.profilePicPlaceholder}>
                            <Ionicons name="camera" size={32} color="#ff6b00" />
                            <Text style={styles.profilePicText}>Add Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </Animated.View>

            {/* First Name */}
            <Animated.View
                style={[
                    styles.inputContainer,
                    {
                        opacity: firstNameOpacity,
                        transform: [
                            { translateY: firstNameTranslateY },
                            { scale: firstNameScale }
                        ],
                    },
                ]}
            >
                <TextInput
                    placeholder="First Name"
                    placeholderTextColor="#666"
                    value={firstName}
                    onChangeText={setFirstName}
                    style={[
                        styles.input,
                        firstNameFocused && styles.inputFocused,
                    ]}
                    autoCapitalize="words"
                    onFocus={() => {
                        setFirstNameFocused(true);
                        animateInputFocus(firstNameScale, true);
                    }}
                    onBlur={() => {
                        setFirstNameFocused(false);
                        animateInputFocus(firstNameScale, false);
                    }}
                />
            </Animated.View>

            {/* Last Name */}
            <Animated.View
                style={[
                    styles.inputContainer,
                    {
                        opacity: lastNameOpacity,
                        transform: [
                            { translateY: lastNameTranslateY },
                            { scale: lastNameScale }
                        ],
                    },
                ]}
            >
                <TextInput
                    placeholder="Last Name"
                    placeholderTextColor="#666"
                    value={lastName}
                    onChangeText={setLastName}
                    style={[
                        styles.input,
                        lastNameFocused && styles.inputFocused,
                    ]}
                    autoCapitalize="words"
                    onFocus={() => {
                        setLastNameFocused(true);
                        animateInputFocus(lastNameScale, true);
                    }}
                    onBlur={() => {
                        setLastNameFocused(false);
                        animateInputFocus(lastNameScale, false);
                    }}
                />
            </Animated.View>

            {/* Email */}
            <Animated.View
                style={[
                    styles.inputContainer,
                    {
                        opacity: emailOpacity,
                        transform: [
                            { translateY: emailTranslateY },
                            { scale: emailScale }
                        ],
                    },
                ]}
            >
                <TextInput
                    placeholder="Email"
                    placeholderTextColor="#666"
                    value={email}
                    onChangeText={setEmail}
                    style={[
                        styles.input,
                        emailFocused && styles.inputFocused,
                    ]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => {
                        setEmailFocused(true);
                        animateInputFocus(emailScale, true);
                    }}
                    onBlur={() => {
                        setEmailFocused(false);
                        animateInputFocus(emailScale, false);
                    }}
                />
            </Animated.View>

            {/* Password */}
            <Animated.View
                style={[
                    styles.inputContainer,
                    {
                        opacity: passwordOpacity,
                        transform: [
                            { translateY: passwordTranslateY },
                            { scale: passwordScale }
                        ],
                    },
                ]}
            >
                <TextInput
                    placeholder="Password"
                    placeholderTextColor="#666"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={[
                        styles.input,
                        passwordFocused && styles.inputFocused,
                    ]}
                    onFocus={() => {
                        setPasswordFocused(true);
                        animateInputFocus(passwordScale, true);
                    }}
                    onBlur={() => {
                        setPasswordFocused(false);
                        animateInputFocus(passwordScale, false);
                    }}
                />
            </Animated.View>

            <Animated.View
                style={{
                    opacity: buttonOpacity,
                    transform: [
                        { translateY: buttonTranslateY },
                        { scale: buttonScale }
                    ],
                }}
            >
                <TouchableOpacity
                    style={[
                        styles.button,
                        isLoading && styles.buttonLoading,
                    ]}
                    onPress={register}
                    onPressIn={() => !isLoading && animateButtonPress(0.96)}
                    onPressOut={() => !isLoading && animateButtonPress(1)}
                    disabled={isLoading}
                    activeOpacity={0.9}
                >
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator color="#fff" size="small" />
                            <Text style={styles.buttonText}>Creating Account...</Text>
                        </View>
                    ) : (
                        <Text style={styles.buttonText}>Register</Text>
                    )}
                </TouchableOpacity>
            </Animated.View>

            <Animated.View
                style={{
                    opacity: linkOpacity,
                    transform: [{ translateY: linkTranslateY }]
                }}
            >
                <TouchableOpacity
                    style={styles.link}
                    onPress={() => router.push('/(auth)/LoginScreen')}
                    onPressIn={() => animateLinkPress(0.4)}
                    onPressOut={() => animateLinkPress(0.8)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.linkText}>Already have an account? Login</Text>
                </TouchableOpacity>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0c0c0c',
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 32,
        letterSpacing: 1.2,
        textShadowColor: 'rgba(255, 107, 0, 0.6)',
        textShadowOffset: { width: 0, height: 3 },
        textShadowRadius: 12,
    },
    profilePicContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    profilePicButton: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
        borderWidth: 3,
        borderColor: '#ff6b00',
        elevation: 8,
        shadowColor: '#ff6b00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    profilePic: {
        width: '100%',
        height: '100%',
    },
    profilePicPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    profilePicText: {
        color: '#ff6b00',
        fontSize: 12,
        fontWeight: '600',
    },
    inputContainer: {
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#1a1a1a',
        color: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 14,
        fontSize: 16,
        borderColor: '#333',
        borderWidth: 1.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
        fontWeight: '500',
    },
    inputFocused: {
        borderColor: '#ff6b00',
        borderWidth: 2,
        backgroundColor: '#252525',
        shadowColor: '#ff6b00',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 12,
        transform: [{ scale: 1.01 }],
    },
    button: {
        backgroundColor: '#ff6b00',
        paddingVertical: 18,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 16,
        shadowColor: '#ff6b00',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 12,
    },
    buttonLoading: {
        opacity: 0.85,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 17,
        letterSpacing: 0.5,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    link: {
        marginTop: 24,
        alignItems: 'center',
        paddingVertical: 12,
    },
    linkText: {
        color: '#888',
        fontSize: 15,
        fontWeight: '500',
    },
    // Toast styles
    toast: {
        position: 'absolute',
        top: 60,
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