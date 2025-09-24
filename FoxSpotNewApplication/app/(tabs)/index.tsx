import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Platform,
    TextInput,
    ScrollView,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import MapViewWrapper from '@/components/MapViewWrapper';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const categories = [
    { name: 'Party', icon: 'musical-notes', color: '#ff6b6b' },
    { name: 'Culture', icon: 'library', color: '#4ecdc4' },
    { name: 'Meeting', icon: 'people', color: '#45b7d1' },
    { name: 'Workshop', icon: 'construct', color: '#96ceb4' },
    { name: 'Food', icon: 'restaurant', color: '#feca57' },
    { name: 'Sport', icon: 'fitness', color: '#ff9ff3' }
];

export default function HomeScreen() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert('Logout Failed', error.message);
        } else {
            router.replace('/(auth)/LoginScreen');
        }
    };

    const handleCategoryPress = (categoryName: string) => {
        setSelectedCategory(selectedCategory === categoryName ? null : categoryName);
    };

    const clearSearch = () => {
        setSearchQuery('');
    };

    return (
        <View style={styles.container}>
            {Platform.OS === 'web' ? (
                <View style={styles.mapPlaceholder}>
                    <Text style={{ color: '#888' }}>Map is not supported on web yet.</Text>
                </View>
            ) : (
                <>
                    <MapViewWrapper selectedCategory={selectedCategory}
                                    searchQuery={searchQuery} />
                    <View style={styles.overlay}>
                        {/* Enhanced Search Input */}
                        <View style={styles.searchWrapper}>
                            <BlurView intensity={20} style={styles.searchContainer}>
                                <View style={styles.searchInputWrapper}>
                                    <Ionicons
                                        name="search"
                                        size={20}
                                        color="#666"
                                        style={styles.searchIcon}
                                    />
                                    <TextInput
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        placeholder="Search events nearby..."
                                        placeholderTextColor="#999"
                                        style={styles.searchInput}
                                        returnKeyType="search"
                                    />
                                    {searchQuery.length > 0 && (
                                        <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                                            <Ionicons name="close-circle" size={20} color="#999" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </BlurView>
                        </View>

                        {/* Enhanced Categories */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.categoryScroll}
                            contentContainerStyle={styles.categoryContainer}
                        >
                            {categories.map((category, index) => (
                                <TouchableOpacity
                                    key={category.name}
                                    style={[
                                        styles.categoryButton,
                                        selectedCategory === category.name && [
                                            styles.selectedCategory,
                                            { backgroundColor: category.color }
                                        ]
                                    ]}
                                    onPress={() => handleCategoryPress(category.name)}
                                    activeOpacity={0.8}
                                >
                                    <BlurView
                                        intensity={selectedCategory === category.name ? 0 : 15}
                                        style={[
                                            styles.categoryContent,
                                            selectedCategory === category.name && styles.selectedCategoryContent
                                        ]}
                                    >
                                        <View style={[
                                            styles.iconContainer,
                                            selectedCategory === category.name && {
                                                backgroundColor: 'rgba(255, 255, 255, 0.2)'
                                            }
                                        ]}>
                                            <Ionicons
                                                name={category.icon as any}
                                                size={18}
                                                color={selectedCategory === category.name ? '#fff' : category.color}
                                            />
                                        </View>
                                        <Text style={[
                                            styles.categoryText,
                                            selectedCategory === category.name && styles.selectedCategoryText
                                        ]}>
                                            {category.name}
                                        </Text>
                                    </BlurView>

                                    {/* Ripple effect */}
                                    {selectedCategory === category.name && (
                                        <View style={[styles.rippleEffect, { backgroundColor: category.color }]} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    mapPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fafafa',
    },
    overlay: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 45,
        left: 0,
        right: 0,
    },

    // Enhanced Search Styles
    searchWrapper: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    searchContainer: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        paddingVertical: 0,
    },
    clearButton: {
        marginLeft: 8,
        padding: 4,
    },

    // Enhanced Category Styles
    categoryScroll: {
        marginBottom: 20,
    },
    categoryContainer: {
        paddingHorizontal: 16,
    },
    categoryButton: {
        marginRight: 12,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        minWidth: 90,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    selectedCategory: {
        elevation: 8,
        shadowOpacity: 0.2,
        shadowRadius: 12,
        transform: [{ scale: 1.05 }],
    },
    categoryContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    selectedCategoryContent: {
        backgroundColor: 'transparent',
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    iconContainer: {
        width: 18,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        letterSpacing: 0.3,
    },
    selectedCategoryText: {
        color: '#fff',
        fontWeight: '700',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    rippleEffect: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 20,
        opacity: 0.1,
    },
});