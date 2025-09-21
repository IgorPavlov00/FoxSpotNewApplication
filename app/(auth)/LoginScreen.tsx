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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState(''); // 'success' or 'error'

    // Professional animation values
    const containerOpacity = useRef(new Animated.Value(0)).current;
    const titleTranslateY = useRef(new Animated.Value(-50)).current;
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const titleScale = useRef(new Animated.Value(0.7)).current;

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
            return Animated.stagger(80, [
                // Container fade in
                Animated.timing(containerOpacity, {
                    toValue: 1,
                    duration: 200,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),

                // Title entrance
                Animated.parallel([
                    Animated.timing(titleOpacity, {
                        toValue: 1,
                        duration: 250,
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
                        duration: 200,
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
                        duration: 200,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                ]),

                // Link
                Animated.parallel([
                    Animated.spring(linkTranslateY, {
                        toValue: 0,
                        tension: 200,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                    Animated.timing(linkOpacity, {
                        toValue: 0.8,
                        duration: 200,
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
            duration: 150,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
        }).start();
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

    const login = async () => {
        if (!email || !password) {
            Animated.sequence([
                Animated.spring(buttonScale, { toValue: 0.98, tension: 300, friction: 10, useNativeDriver: true }),
                Animated.spring(buttonScale, { toValue: 1.02, tension: 300, friction: 10, useNativeDriver: true }),
                Animated.spring(buttonScale, { toValue: 1, tension: 300, friction: 10, useNativeDriver: true }),
            ]).start();
            showToast('Please fill in all fields', 'error'); // ✅ show toast
            return;
        }

        setIsLoading(true);
        Animated.spring(buttonScale, {
            toValue: 0.96,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
        }).start();

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setIsLoading(false);

        if (!error) {
            showToast('Login successful!', 'success'); // ✅ success toast

            Animated.sequence([
                Animated.spring(buttonScale, {
                    toValue: 1.04,
                    tension: 200,
                    friction: 6,
                    useNativeDriver: true,
                }),
                Animated.spring(buttonScale, {
                    toValue: 1,
                    tension: 300,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.parallel([
                    Animated.timing(containerOpacity, {
                        toValue: 0,
                        duration: 300,
                        easing: Easing.in(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.spring(titleScale, {
                        toValue: 0.9,
                        tension: 150,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start(() => {
                router.replace('/landing');
            });
        } else {
            showToast(error.message, 'error'); // ✅ error toast
            Animated.sequence([
                Animated.spring(buttonScale, { toValue: 1.02, tension: 300, friction: 8, useNativeDriver: true }),
                Animated.spring(buttonScale, { toValue: 0.98, tension: 300, friction: 8, useNativeDriver: true }),
                Animated.spring(buttonScale, { toValue: 1, tension: 300, friction: 8, useNativeDriver: true }),
            ]).start();
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
                Fox Spot 🦊
            </Animated.Text>

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
                    onPress={login}
                    onPressIn={() => !isLoading && animateButtonPress(0.96)}
                    onPressOut={() => !isLoading && animateButtonPress(1)}
                    disabled={isLoading}
                    activeOpacity={0.9}
                >
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator color="#fff" size="small" />
                            <Text style={styles.buttonText}>Signing in...</Text>
                        </View>
                    ) : (
                        <Text style={styles.buttonText}>Login</Text>
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
                    onPress={() => router.push('/RegisterScreen')}
                    onPressIn={() => animateLinkPress(0.4)}
                    onPressOut={() => animateLinkPress(0.8)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.linkText}>Don't have an account? Register</Text>
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
        fontSize: 36,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 48,
        letterSpacing: 1.2,
        textShadowColor: 'rgba(255, 107, 0, 0.6)',
        textShadowOffset: { width: 0, height: 3 },
        textShadowRadius: 12,
    },
    inputContainer: {
        marginBottom: 18,
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
        marginTop: 28,
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