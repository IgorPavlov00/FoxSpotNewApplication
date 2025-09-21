import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    PanResponder,
    Animated,
    Dimensions,
    ImageBackground,
    Platform,
    Easing
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRef, useEffect, useState } from 'react';

const { height, width } = Dimensions.get('window');

export default function OnboardingScreen() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    // Animation refs for entrance
    const containerOpacity = useRef(new Animated.Value(0)).current;
    const skipOpacity = useRef(new Animated.Value(0)).current;
    const contentTranslateY = useRef(new Animated.Value(50)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.5)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const headlineTranslateY = useRef(new Animated.Value(30)).current;
    const headlineOpacity = useRef(new Animated.Value(0)).current;
    const subtextTranslateY = useRef(new Animated.Value(20)).current;
    const subtextOpacity = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(0.8)).current;
    const buttonOpacity = useRef(new Animated.Value(0)).current;
    const dotsOpacity = useRef(new Animated.Value(0)).current;

    const onboardingData = [
        {
            id: 1,
            image: 'https://i.pinimg.com/1200x/c7/22/7d/c7227df9040cef3ba068a8a78de6176f.jpg',
            title: 'Welcome to FoxSpot 🦊',
            headline: 'Discover Amazing Events Near You',
            subtitle: 'From rooftop parties to art galleries, find experiences that match your interests and connect with your community'
        },
        {
            id: 2,
            image: 'https://i.pinimg.com/736x/48/f2/bc/48f2bc76b01393baa67fdb36450575fb.jpg',
            title: 'Connect & Network',
            headline: 'Meet Like-Minded People',
            subtitle: 'Join networking events, workshops, and social gatherings to expand your circle and build meaningful connections'
        },
        {
            id: 3,
            image: 'https://i.pinimg.com/1200x/48/dc/6a/48dc6ae634b3bbfbc6e410c4b96e5ec4.jpg',
            title: 'Experience More',
            headline: 'Never Miss Out Again',
            subtitle: 'Get personalized event recommendations and discover hidden gems in your city. Your next adventure awaits!'
        },
    ];

    useEffect(() => {
        // Modern entrance animation sequence
        const createEntranceAnimation = () => {
            return Animated.sequence([
                // Container and background fade in
                Animated.parallel([
                    Animated.timing(containerOpacity, {
                        toValue: 1,
                        duration: 600,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                    Animated.timing(skipOpacity, {
                        toValue: 1,
                        duration: 800,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                ]),

                // Wait a moment
                Animated.delay(300),

                // Content area slides up
                Animated.parallel([
                    Animated.spring(contentTranslateY, {
                        toValue: 0,
                        tension: 100,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                    Animated.timing(contentOpacity, {
                        toValue: 1,
                        duration: 500,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                ]),

                // Text elements cascade in
                Animated.stagger(100, [
                    // Logo/Title
                    Animated.parallel([
                        Animated.spring(logoScale, {
                            toValue: 1,
                            tension: 150,
                            friction: 8,
                            useNativeDriver: true,
                        }),
                        Animated.timing(logoOpacity, {
                            toValue: 1,
                            duration: 500,
                            easing: Easing.out(Easing.cubic),
                            useNativeDriver: true,
                        }),
                    ]),

                    // Headline
                    Animated.parallel([
                        Animated.spring(headlineTranslateY, {
                            toValue: 0,
                            tension: 120,
                            friction: 8,
                            useNativeDriver: true,
                        }),
                        Animated.timing(headlineOpacity, {
                            toValue: 1,
                            duration: 500,
                            easing: Easing.out(Easing.quad),
                            useNativeDriver: true,
                        }),
                    ]),

                    // Subtext
                    Animated.parallel([
                        Animated.spring(subtextTranslateY, {
                            toValue: 0,
                            tension: 120,
                            friction: 8,
                            useNativeDriver: true,
                        }),
                        Animated.timing(subtextOpacity, {
                            toValue: 1,
                            duration: 500,
                            easing: Easing.out(Easing.quad),
                            useNativeDriver: true,
                        }),
                    ]),

                    // Button and dots
                    Animated.parallel([
                        Animated.spring(buttonScale, {
                            toValue: 1,
                            tension: 150,
                            friction: 6,
                            useNativeDriver: true,
                        }),
                        Animated.timing(buttonOpacity, {
                            toValue: 1,
                            duration: 400,
                            easing: Easing.out(Easing.back(1.2)),
                            useNativeDriver: true,
                        }),
                        Animated.timing(dotsOpacity, {
                            toValue: 1,
                            duration: 400,
                            easing: Easing.out(Easing.quad),
                            useNativeDriver: true,
                        }),
                    ]),
                ]),
            ]);
        };

        createEntranceAnimation().start();
    }, []);

    const handleContinue = () => {
        if (currentIndex < onboardingData.length - 1) {
            // Go to next slide
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);

            Animated.spring(scrollX, {
                toValue: -nextIndex * width,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }).start();

            // Reset and replay content animations for new slide
            resetAndAnimateContent();
        } else {
            // Final slide - navigate to main app
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: -height,
                    duration: 400,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                router.replace('/(tabs)');
            });
        }
    };

    const resetAndAnimateContent = () => {
        // Reset content animations
        logoScale.setValue(0.8);
        logoOpacity.setValue(0);
        headlineTranslateY.setValue(20);
        headlineOpacity.setValue(0);
        subtextTranslateY.setValue(15);
        subtextOpacity.setValue(0);
        buttonScale.setValue(0.9);
        buttonOpacity.setValue(0);

        // Animate content in for new slide
        Animated.stagger(80, [
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    tension: 150,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 400,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.spring(headlineTranslateY, {
                    toValue: 0,
                    tension: 120,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(headlineOpacity, {
                    toValue: 1,
                    duration: 400,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.spring(subtextTranslateY, {
                    toValue: 0,
                    tension: 120,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(subtextOpacity, {
                    toValue: 1,
                    duration: 400,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.spring(buttonScale, {
                    toValue: 1,
                    tension: 150,
                    friction: 6,
                    useNativeDriver: true,
                }),
                Animated.timing(buttonOpacity, {
                    toValue: 1,
                    duration: 300,
                    easing: Easing.out(Easing.back(1.2)),
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    };

    const handleSkip = () => {
        router.push('/LoginScreen');
    };

    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: (evt, gestureState) => {
            return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
        },
        onPanResponderMove: (evt, gestureState) => {
            // Horizontal swipe
            const newValue = -currentIndex * width + gestureState.dx;
            scrollX.setValue(newValue);
        },
        onPanResponderRelease: (evt, gestureState) => {
            const threshold = width / 4;

            if (gestureState.dx > threshold && currentIndex > 0) {
                // Swipe right - go to previous
                const prevIndex = currentIndex - 1;
                setCurrentIndex(prevIndex);
                Animated.spring(scrollX, {
                    toValue: -prevIndex * width,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }).start();
                resetAndAnimateContent();
            } else if (gestureState.dx < -threshold && currentIndex < onboardingData.length - 1) {
                // Swipe left - go to next
                const nextIndex = currentIndex + 1;
                setCurrentIndex(nextIndex);
                Animated.spring(scrollX, {
                    toValue: -nextIndex * width,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }).start();
                resetAndAnimateContent();
            } else {
                // Snap back to current slide
                Animated.spring(scrollX, {
                    toValue: -currentIndex * width,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }).start();
            }
        },
    });

    // Responsive calculations
    const isSmallScreen = height < 700;
    const isTablet = width > 500;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: containerOpacity,
                    transform: [{ translateY }, { scale: opacity.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.95, 1]
                        })}]
                }
            ]}
            {...panResponder.panHandlers}
        >
            {/* Slider Container */}
            <Animated.View
                style={[
                    styles.sliderContainer,
                    { transform: [{ translateX: scrollX }] }
                ]}
            >
                {onboardingData.map((item, index) => (
                    <View key={item.id} style={styles.slide}>
                        <ImageBackground
                            source={{ uri: item.image }}
                            style={styles.backgroundImage}
                            resizeMode="cover"
                            imageStyle={{ width: '100%', height: '100%' }}
                        >
                            {/* Dark Overlay */}
                            <View style={styles.overlay} />
                        </ImageBackground>
                    </View>
                ))}
            </Animated.View>

            {/* Skip Button */}
            <Animated.View
                style={[
                    styles.skipContainer,
                    {
                        top: Platform.OS === 'ios' ? 60 : 40,
                        opacity: skipOpacity
                    }
                ]}
            >
                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkip}
                    activeOpacity={0.7}
                >
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Content Section */}
            <Animated.View
                style={[
                    styles.contentSection,
                    {
                        opacity: contentOpacity,
                        transform: [{ translateY: contentTranslateY }]
                    }
                ]}
            >
                <View style={styles.textContent}>
                    <Animated.Text
                        style={[
                            styles.title,
                            {
                                fontSize: isSmallScreen ? 18 : isTablet ? 24 : 20,
                                opacity: logoOpacity,
                                transform: [{ scale: logoScale }]
                            }
                        ]}
                    >
                        {onboardingData[currentIndex].title}
                    </Animated.Text>

                    <Animated.Text
                        style={[
                            styles.headline,
                            {
                                fontSize: isSmallScreen ? 28 : isTablet ? 36 : 32,
                                opacity: headlineOpacity,
                                transform: [{ translateY: headlineTranslateY }]
                            }
                        ]}
                    >
                        {onboardingData[currentIndex].headline}
                    </Animated.Text>

                    <Animated.Text
                        style={[
                            styles.subtext,
                            {
                                fontSize: isSmallScreen ? 16 : isTablet ? 20 : 18,
                                opacity: subtextOpacity,
                                transform: [{ translateY: subtextTranslateY }]
                            }
                        ]}
                    >
                        {onboardingData[currentIndex].subtitle}
                    </Animated.Text>
                </View>

                <View style={styles.actionSection}>
                    <Animated.View
                        style={{
                            opacity: buttonOpacity,
                            transform: [{ scale: buttonScale }]
                        }}
                    >
                        <TouchableOpacity
                            style={[styles.nextButton, {
                                paddingVertical: isSmallScreen ? 16 : 18,
                            }]}
                            onPress={handleContinue}
                            activeOpacity={0.9}
                        >
                            <Text style={[styles.nextButtonText, {
                                fontSize: isSmallScreen ? 16 : 18
                            }]}>
                                {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View
                        style={[styles.pageIndicators, { opacity: dotsOpacity }]}
                    >
                        {onboardingData.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    index === currentIndex && styles.activeDot
                                ]}
                            />
                        ))}
                    </Animated.View>
                </View>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
    },
    sliderContainer: {
        flexDirection: 'row',
        width: width * 3, // 3 slides
        height: height,
    },
    slide: {
        width: width,
        height: height,
        overflow: 'hidden',
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(12, 12, 12, 0.4)',
        width: '100%',
        height: '100%',
    },
    skipContainer: {
        position: 'absolute',
        right: 20,
        zIndex: 10,
    },
    skipButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    skipText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    contentSection: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 50 : 30,
        minHeight: height * 0.5,
        justifyContent: 'flex-end',
    },
    textContent: {
        marginBottom: 40,
    },
    title: {
        color: '#ff6b00',
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    headline: {
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 38,
    },
    subtext: {
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        lineHeight: 26,
        fontWeight: '400',
    },
    actionSection: {
        alignItems: 'center',
    },
    nextButton: {
        backgroundColor: '#ff6b00',
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 24,
        width: width - 48,
        shadowColor: '#ff6b00',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    nextButtonText: {
        color: '#fff',
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    pageIndicators: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    activeDot: {
        backgroundColor: '#ff6b00',
        width: 24,
        shadowColor: '#ff6b00',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 4,
    },
});