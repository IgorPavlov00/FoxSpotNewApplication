import React, { useState, useCallback, useRef } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    View,
    Image,
    Animated,
    TouchableOpacity,
    Modal,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

let MapView: any, Marker: any;
if (Platform.OS !== "web") {
    MapView = require("react-native-maps").default;
    Marker = require("react-native-maps").Marker;
}

const darkMapStyle = [
    { featureType: "all", elementType: "labels", stylers: [{ visibility: "on" }] },
    {
        featureType: "all",
        elementType: "labels.text.fill",
        stylers: [{ saturation: 36 }, { color: "#000000" }, { lightness: 40 }],
    },
    {
        featureType: "all",
        elementType: "labels.text.stroke",
        stylers: [{ visibility: "on" }, { color: "#000000" }, { lightness: 16 }],
    },
    { featureType: "all", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    {
        featureType: "administrative",
        elementType: "geometry.fill",
        stylers: [{ color: "#000000" }, { lightness: 20 }],
    },
    {
        featureType: "administrative",
        elementType: "geometry.stroke",
        stylers: [{ color: "#000000" }, { lightness: 17 }, { weight: 1.2 }],
    },
    {
        featureType: "administrative.country",
        elementType: "labels.text.fill",
        stylers: [{ color: "#e5c163" }],
    },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#c4c4c4" }],
    },
    {
        featureType: "administrative.neighborhood",
        elementType: "labels.text.fill",
        stylers: [{ color: "#e5c163" }],
    },
    {
        featureType: "landscape",
        elementType: "geometry",
        stylers: [{ color: "#000000" }, { lightness: 20 }],
    },
    {
        featureType: "poi",
        elementType: "geometry",
        stylers: [{ color: "#000000" }, { lightness: 21 }, { visibility: "on" }],
    },
    { featureType: "poi.business", elementType: "geometry", stylers: [{ visibility: "on" }] },
    {
        featureType: "road.highway",
        elementType: "geometry.fill",
        stylers: [{ color: "#ff6b00" }, { lightness: "0" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ visibility: "off" }],
    },
    {
        featureType: "road.highway",
        elementType: "labels",
        stylers: [{ visibility: "simplified" }],
    },
    {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#ffffff" }],
    },
    {
        featureType: "road.highway",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#e5c163" }],
    },
    {
        featureType: "road.arterial",
        elementType: "geometry",
        stylers: [{ color: "#000000" }, { lightness: 18 }],
    },
    {
        featureType: "road.arterial",
        elementType: "geometry.fill",
        stylers: [{ color: "#c8bfbf" }],
    },
    {
        featureType: "road.arterial",
        elementType: "labels.text.fill",
        stylers: [{ color: "#ffffff" }],
    },
    {
        featureType: "road.arterial",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#2c2c2c" }],
    },
    {
        featureType: "road.local",
        elementType: "geometry",
        stylers: [{ color: "#000000" }, { lightness: 18 }],
    },
    { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#999999" }] },
    {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#000000" }, { lightness: 19 }],
    },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }, { lightness: 17 }] },
];
const normalizeCategory = (cat: string) => {
    const map: Record<string, string> = {
        sports: "sport",
        sport: "sport",
        party: "party",
        culture: "culture",
        meeting: "meeting",
        workshop: "workshop",
        food: "food",
        music: "party", // if you want music events to show up under "Party"
        art: "culture",
        business: "meeting",
        tech: "workshop",
    };
    return map[cat.toLowerCase()] || cat.toLowerCase();
};

const MapViewWrapper = ({
                            selectedCategory,
                            searchQuery,
                        }: {
    selectedCategory: string | null;
    searchQuery: string;
}) => {
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const markerAnimations = useRef<any[]>([]);

    const defaultImage =
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

    const fetchEvents = async () => {
        const { data, error } = await supabase
            .from("events")
            .select("id, title, address, location, lat, lng, type, image_url, description");

        if (error) {
            console.error("Error fetching events:", error);
            return;
        }

        const validEvents = (data ?? []).filter(
            (e) =>
                e.lat != null &&
                e.lng != null &&
                !isNaN(e.lat) &&
                !isNaN(e.lng) &&
                e.lat >= -90 &&
                e.lat <= 90 &&
                e.lng >= -180 &&
                e.lng <= 180
        );

        setEvents(validEvents);

        markerAnimations.current = validEvents.map(() => new Animated.Value(0));
        markerAnimations.current.forEach((anim) => {
            Animated.timing(anim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();
        });
    };

    useFocusEffect(
        useCallback(() => {
            fetchEvents();
        }, [])
    );

    // ✅ Apply category + search filter
    const filteredEvents = events.filter((event) => {
        const matchesCategory =
            !selectedCategory ||
            normalizeCategory(event.type) === normalizeCategory(selectedCategory);
        const matchesSearch =
            !searchQuery ||
            event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.address.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
    });


    if (Platform.OS === "web") {
        return (
            <View style={styles.webFallback}>
                <Text style={styles.webText}>Map is only available on mobile</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 45.2671,
                    longitude: 19.8335,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                }}
                customMapStyle={darkMapStyle}
                showsUserLocation
                showsMyLocationButton
            >
                {filteredEvents.map((event, index) => (
                    <Marker
                        key={event.id}
                        coordinate={{
                            latitude: Number(event.lat),
                            longitude: Number(event.lng),
                        }}
                        onPress={() => setSelectedEvent(event)}
                    >
                        <Animated.View
                            style={[
                                styles.customMarker,
                                {
                                    transform: [
                                        {
                                            scale:
                                                markerAnimations.current[index]?.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0.8, 1],
                                                }) || 1,
                                        },
                                    ],
                                },
                            ]}
                        >
                            <View style={styles.markerImageContainer}>
                                <Image
                                    source={{ uri: event.image_url || defaultImage }}
                                    style={styles.markerImage}
                                    resizeMode="cover"
                                />
                            </View>
                        </Animated.View>
                    </Marker>
                ))}
            </MapView>

            {/* Event Card Modal */}
            {selectedEvent && (
                <Modal
                    visible={true}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setSelectedEvent(null)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.eventCard}>
                            <Image
                                source={{ uri: selectedEvent.image_url || defaultImage }}
                                style={styles.eventImage}
                            />

                            <View style={styles.eventContent}>
                                <Text style={styles.eventCategory}>
                                    {selectedEvent.type?.toUpperCase()}
                                </Text>
                                <Text style={styles.eventTitle}>{selectedEvent.title}</Text>
                                <Text style={styles.eventLocation}>
                                    📍 {selectedEvent.address}, {selectedEvent.location}
                                </Text>
                                <Text style={styles.eventDate}>🗓 May 29 • 10:00 PM</Text>
                                <Text style={styles.aboutText}>
                                    {selectedEvent.description || "No description provided."}
                                </Text>

                                <TouchableOpacity style={styles.bookButton}>
                                    <Text style={styles.bookButtonText}>Book Now</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Close button */}
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setSelectedEvent(null)}
                            >
                                <Ionicons name="close" size={22} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
};

export default MapViewWrapper;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    map: { flex: 1, backgroundColor: "#000" },
    webFallback: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
    webText: { color: "#888", fontSize: 16 },
    customMarker: { alignItems: "center", justifyContent: "center" },
    markerImageContainer: {
        width: 33,
        height: 33,
        borderRadius: 24,
        overflow: "hidden",
        backgroundColor: "#1a1a1a",
        borderWidth: 2,
        borderColor: "#fff",
    },
    markerImage: { width: 28, height: 28, borderRadius: 24 },
    modalOverlay: { flex: 1, justifyContent: "flex-end" },
    eventCard: {
        backgroundColor: "#1a1a1a",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: "hidden",
        maxHeight: "75%",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 15,
        paddingBottom: 20,
    },
    eventImage: { width: "100%", height: 200 },
    eventContent: { padding: 15 },
    eventCategory: { color: "#ff6b00", fontWeight: "700", marginBottom: 6, fontSize: 13 },
    eventTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
    eventLocation: { fontSize: 14, color: "#bbb", marginTop: 6 },
    eventDate: { fontSize: 14, color: "#bbb", marginTop: 4 },
    aboutText: { marginTop: 12, color: "#ccc", fontSize: 14, lineHeight: 20 },
    bookButton: {
        marginTop: 18,
        backgroundColor: "#ff6b00",
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: "center",
    },
    bookButtonText: { color: "#fff", fontSize: 16, fontWeight: "700", textTransform: "uppercase" },
    closeButton: {
        position: "absolute",
        top: 12,
        right: 12,
        backgroundColor: "rgba(0,0,0,0.6)",
        borderRadius: 20,
        padding: 8,
    },
});
