// app/(tabs)/_layout.tsx
import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, TouchableOpacity, View, Text, Animated, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter, Redirect } from "expo-router";
import { useSegments } from "expo-router";
import { supabase } from '../../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export default function TabsLayout() {
    const router = useRouter();
    const segments = useSegments();
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<Session | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const bubbleAnim = useRef(new Animated.Value(0)).current;
    const iconScaleAnim = useRef([]).current;
    const translateYAnim = useRef([]).current;

    const tabs = [
        { route: "/", icon: "home", iconActive: "home", label: "Home" },
        { route: "/events", icon: "calendar-outline", iconActive: "calendar", label: "Events" },
        { route: "/add-event", icon: "add", iconActive: "add", label: "Create", isSpecial: true },
        { route: "/favorites", icon: "heart-outline", iconActive: "heart", label: "Saved" },
        { route: "/profile", icon: "person-outline", iconActive: "person", label: "Profile" },
    ];

    useEffect(() => {
        const fetchSession = async () => {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);
            setLoading(false);
        };
        fetchSession();
    }, []);

    // Initialize animations for each tab
    useEffect(() => {
        for (let i = 0; i < tabs.length; i++) {
            iconScaleAnim[i] = new Animated.Value(1);
            translateYAnim[i] = new Animated.Value(0);
        }
    }, []);

    useEffect(() => {
        const currentRoute = `/(tabs)/${segments[1] || "index"}`;
        const routeIndex = tabs.findIndex((tab) => tab.route === currentRoute);

        if (routeIndex !== -1 && routeIndex !== activeIndex) {
            setActiveIndex(routeIndex);
        }

        for (let i = 0; i < tabs.length; i++) {
            iconScaleAnim[i].setValue(1);
            translateYAnim[i].setValue(0);
        }

        if (routeIndex !== -1) {
            Animated.parallel([
                Animated.spring(iconScaleAnim[routeIndex], {
                    toValue: tabs[routeIndex].isSpecial ? 1.2 : 1.3,
                    tension: 150,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.spring(translateYAnim[routeIndex], {
                    toValue: tabs[routeIndex].isSpecial ? -8 : -12,
                    tension: 150,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [segments]);


    useEffect(() => {
        Animated.spring(bubbleAnim, {
            toValue: activeIndex,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
        }).start();
    }, [activeIndex]);

    const handleTabPress = (index, route) => {
        if (index !== activeIndex) {
            // Reset all animations
            for (let i = 0; i < tabs.length; i++) {
                Animated.spring(iconScaleAnim[i], {
                    toValue: 1,
                    tension: 150,
                    friction: 8,
                    useNativeDriver: true,
                }).start();
                Animated.spring(translateYAnim[i], {
                    toValue: 0,
                    tension: 150,
                    friction: 8,
                    useNativeDriver: true,
                }).start();
            }

            // Animate selected tab
            Animated.parallel([
                Animated.spring(iconScaleAnim[index], {
                    toValue: tabs[index].isSpecial ? 1.2 : 1.3,
                    tension: 150,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.spring(translateYAnim[index], {
                    toValue: tabs[index].isSpecial ? -8 : -12,
                    tension: 150,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();

            setActiveIndex(index);
            router.push(route);
        }
    };

    const getBubbleStyle = () => {
        const tabWidth = 100 / tabs.length; // Percentage width per tab
        return {
            transform: [
                {
                    translateX: bubbleAnim.interpolate({
                        inputRange: tabs.map((_, i) => i),
                        outputRange: tabs.map((_, i) => i * (100 / tabs.length) + '%'),
                    }),
                },
            ],
            width: `${tabWidth}%`,
        };
    };

    const getIconStyle = (index) => ({
        transform: [
            { scale: iconScaleAnim[index] || 1 },
            { translateY: translateYAnim[index] || 0 },
        ],
    });

    if (loading) return null;
    if (!session) return <Redirect href="/landing" />;

    return (
        <View style={styles.container}>
            <Tabs screenOptions={{ tabBarStyle: { display: "none" }, headerShown: false }} />

            <View style={styles.customNavBar}>
                {/* Animated Background Bubble */}
                <Animated.View style={[styles.activeBubble, getBubbleStyle()]} />

                {/* Tab Items */}
                {tabs.map((tab, index) => (
                    <TouchableOpacity
                        key={tab.label}
                        style={styles.navItem}
                        onPress={() => handleTabPress(index, tab.route)}
                        activeOpacity={0.8}
                    >
                        <Animated.View style={getIconStyle(index)}>
                            <View
                                style={[
                                    styles.iconContainer,
                                    tab.isSpecial && styles.specialIconContainer,
                                    activeIndex === index && styles.activeIconContainer,
                                    tab.isSpecial && activeIndex === index && styles.activeSpecialIconContainer,
                                ]}
                            >
                                <Ionicons
                                    name={activeIndex === index ? tab.iconActive : tab.icon}
                                    size={tab.isSpecial ? 26 : 22}
                                    color={
                                        activeIndex === index
                                            ? (tab.isSpecial ? "#ffffff" : "#ffffff")
                                            : "#999999"
                                    }
                                />
                            </View>
                        </Animated.View>
                        <Text
                            style={[
                                styles.navText,
                                activeIndex === index && styles.activeText,
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "transparent",
    },
    customNavBar: {
        position: "absolute",
        bottom: 0,
        left: 7,
        right: 7,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#000000",
        borderRadius:20,
        height: Platform.OS === 'ios' ? 95 : 80,
        paddingHorizontal: 8,
        paddingBottom: Platform.OS === 'ios' ? 25 : 15,
        paddingTop: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 15,
    },
    activeBubble: {
        position: "absolute",
        height: 50,
        borderRadius: 25,
        top: 8,
        zIndex: 0,
    },
    navItem: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        zIndex: 1,
    },
    iconContainer: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "#1a1a1a",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 4,
    },
    specialIconContainer: {
        backgroundColor: "#ff6b00",
        width: 48,
        height: 48,
        borderRadius: 24,
        elevation: 8,
        shadowColor: "#ff6b00",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    activeIconContainer: {
        backgroundColor: "#ff6b00",
        elevation: 6,
        shadowColor: "#ff6b00",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    activeSpecialIconContainer: {
        backgroundColor: "#ff8533",
        elevation: 12,
        shadowOpacity: 0.6,
        shadowRadius: 12,
    },
    navText: {
        fontSize: 10,
        color: "#666666",
        fontWeight: "500",
        textAlign: "center",
        letterSpacing: 0.2,
    },
    activeText: {
        fontSize: 11,
        color: "#ff6b00",
        fontWeight: "700",
    },
});