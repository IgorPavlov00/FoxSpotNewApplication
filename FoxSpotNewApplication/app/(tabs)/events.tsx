import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ImageBackground,
    TextInput,
    Animated,
    RefreshControl,
    Dimensions,
    Platform,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function EventsScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const scrollY = useRef(new Animated.Value(0)).current;

    const categories = ['All', 'Music', 'Art', 'Food', 'Sports', 'Tech', 'Business'];

    const events = [
        {
            id: 1,
            title: 'Rooftop Jazz Night',
            image: 'https://i.pinimg.com/1200x/48/dc/6a/48dc6ae634b3bbfbc6e410c4b96e5ec4.jpg',
            date: 'Tonight',
            time: '8:00 PM',
            location: 'Sky Lounge, Downtown',
            price: '$25',
            category: 'Music',
            attendees: 247,
            featured: true,
        },
        {
            id: 2,
            title: 'Tech Startup Mixer',
            image: 'https://i.pinimg.com/736x/4a/3f/91/4a3f912388fb819851787abf34cca970.jpg',
            date: 'Tomorrow',
            time: '6:30 PM',
            location: 'Innovation Hub',
            price: 'Free',
            category: 'Tech',
            attendees: 156,
        },
        {
            id: 3,
            title: 'Modern Art Gallery Opening',
            image: 'https://i.pinimg.com/736x/48/f2/bc/48f2bc76b01393baa67fdb36450575fb.jpg',
            date: 'Dec 28',
            time: '7:00 PM',
            location: 'Contemporary Arts Center',
            price: '$15',
            category: 'Art',
            attendees: 89,
        },
        {
            id: 4,
            title: 'Food Truck Festival',
            image: 'https://images.unsplash.com/photo-1414016642750-7fdd78dc33d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            date: 'Dec 30',
            time: '12:00 PM',
            location: 'City Park',
            price: '$10',
            category: 'Food',
            attendees: 432,
        },
        {
            id: 5,
            title: 'Yoga in the Park',
            image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            date: 'Jan 2',
            time: '9:00 AM',
            location: 'Central Park',
            price: 'Free',
            category: 'Sports',
            attendees: 78,
        },
        {
            id: 6,
            title: 'Live Music & Dancing',
            image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            date: 'Jan 5',
            time: '9:00 PM',
            location: 'The Underground',
            price: '$30',
            category: 'Music',
            attendees: 201,
        },
    ];

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0.9],
        extrapolate: 'clamp',
    });

    const renderEventCard = (event, index) => {
        const cardScale = scrollY.interpolate({
            inputRange: [
                (index - 1) * 280,
                index * 280,
                (index + 1) * 280,
            ],
            outputRange: [0.95, 1, 0.95],
            extrapolate: 'clamp',
        });

        return (
            <Animated.View
                key={event.id}
                style={[
                    styles.eventCard,
                    event.featured && styles.featuredCard,
                    { transform: [{ scale: cardScale }] }
                ]}
            >
                <TouchableOpacity activeOpacity={0.9}>
                    <ImageBackground
                        source={{ uri: event.image }}
                        style={styles.eventImage}
                        imageStyle={styles.eventImageStyle}
                    >
                        {event.featured && (
                            <View style={styles.featuredBadge}>
                                <Ionicons name="star" size={14} color="#ffffff" />
                                <Text style={styles.featuredText}>Featured</Text>
                            </View>
                        )}

                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                            style={styles.imageGradient}
                        />

                        <View style={styles.eventImageContent}>
                            <View style={styles.priceTag}>
                                <Text style={styles.priceText}>{event.price}</Text>
                            </View>
                        </View>
                    </ImageBackground>

                    <View style={styles.eventInfo}>
                        <View style={styles.eventHeader}>
                            <Text style={styles.eventTitle}>{event.title}</Text>
                            <TouchableOpacity style={styles.favoriteButton}>
                                <Ionicons name="heart-outline" size={22} color="#ff6b00" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.eventDetails}>
                            <View style={styles.eventDetailRow}>
                                <Ionicons name="calendar-outline" size={16} color="#ff6b00" />
                                <Text style={styles.eventDetailText}>{event.date} • {event.time}</Text>
                            </View>

                            <View style={styles.eventDetailRow}>
                                <Ionicons name="location-outline" size={16} color="#ff6b00" />
                                <Text style={styles.eventDetailText}>{event.location}</Text>
                            </View>

                            <View style={styles.eventDetailRow}>
                                <Ionicons name="people-outline" size={16} color="#ff6b00" />
                                <Text style={styles.eventDetailText}>{event.attendees} attending</Text>
                            </View>
                        </View>

                        <View style={styles.eventFooter}>
                            <View style={styles.categoryTag}>
                                <Text style={styles.categoryText}>{event.category}</Text>
                            </View>

                            <TouchableOpacity style={styles.joinButton}>
                                <Text style={styles.joinButtonText}>Join Event</Text>
                                <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />

            {/* Header */}
            <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
                <View style={styles.headerTop}>
                    <Text style={styles.headerTitle}>Discover Events</Text>
                    <TouchableOpacity style={styles.filterButton}>
                        <Ionicons name="options-outline" size={24} color="#ff6b00" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#999999" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search events..."
                        placeholderTextColor="#999999"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Ionicons name="close-circle" size={20} color="#999999" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Categories */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesContainer}
                    contentContainerStyle={styles.categoriesContent}
                >
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.categoryButton,
                                selectedCategory === category && styles.selectedCategoryButton,
                            ]}
                            onPress={() => setSelectedCategory(category)}
                        >
                            <Text
                                style={[
                                    styles.categoryButtonText,
                                    selectedCategory === category && styles.selectedCategoryText,
                                ]}
                            >
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </Animated.View>

            {/* Events List */}
            <Animated.ScrollView
                style={styles.eventsContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#ff6b00"
                        colors={['#ff6b00']}
                    />
                }
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                <View style={styles.eventsGrid}>
                    {events.map((event, index) => renderEventCard(event, index))}
                </View>

                <View style={styles.bottomPadding} />
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    header: {
        backgroundColor: '#000000',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 107, 0, 0.1)',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#ffffff',
    },
    filterButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 107, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 0, 0.2)',
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#ffffff',
        fontWeight: '500',
    },
    categoriesContainer: {
        marginHorizontal: -20,
    },
    categoriesContent: {
        paddingHorizontal: 20,
        gap: 12,
    },
    categoryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 0, 0.2)',
    },
    selectedCategoryButton: {
        backgroundColor: '#ff6b00',
        borderColor: '#ff6b00',
    },
    categoryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#999999',
    },
    selectedCategoryText: {
        color: '#ffffff',
    },
    eventsContainer: {
        flex: 1,
    },
    eventsGrid: {
        padding: 20,
        gap: 20,
    },
    eventCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 0, 0.1)',
    },
    featuredCard: {
        borderColor: 'rgba(255, 107, 0, 0.3)',
        elevation: 12,
        shadowOpacity: 0.4,
    },
    eventImage: {
        height: 200,
        justifyContent: 'space-between',
    },
    eventImageStyle: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    featuredBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ff6b00',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        position: 'absolute',
        top: 15,
        left: 15,
        gap: 4,
    },
    featuredText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
    },
    eventImageContent: {
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    priceTag: {
        backgroundColor: 'rgba(255, 107, 0, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    priceText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
    },
    eventInfo: {
        padding: 20,
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    eventTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
        flex: 1,
        marginRight: 10,
        lineHeight: 26,
    },
    favoriteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 107, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    eventDetails: {
        gap: 8,
        marginBottom: 20,
    },
    eventDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    eventDetailText: {
        fontSize: 14,
        color: '#cccccc',
        fontWeight: '500',
    },
    eventFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryTag: {
        backgroundColor: 'rgba(255, 107, 0, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 0, 0.3)',
    },
    categoryText: {
        color: '#ff6b00',
        fontSize: 12,
        fontWeight: '600',
    },
    joinButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ff6b00',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        gap: 8,
        elevation: 4,
        shadowColor: '#ff6b00',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    joinButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
    },
    bottomPadding: {
        height: 120,
    },
});