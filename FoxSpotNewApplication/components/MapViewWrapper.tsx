import React, { useState, useCallback, useRef, useEffect } from "react";
import { Platform, StyleSheet, Text, View, Image, Animated } from "react-native";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

let MapView: any, Marker: any;
if (Platform.OS !== "web") {
    MapView = require("react-native-maps").default;
    Marker = require("react-native-maps").Marker;
}

const darkMapStyle = [
    {
        featureType: "all",
        elementType: "labels",
        stylers: [{ visibility: "on" }],
    },
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
    {
        featureType: "all",
        elementType: "labels.icon",
        stylers: [{ visibility: "off" }],
    },
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
    {
        featureType: "poi.business",
        elementType: "geometry",
        stylers: [{ visibility: "on" }],
    },
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
    {
        featureType: "road.local",
        elementType: "labels.text.fill",
        stylers: [{ color: "#999999" }],
    },
    {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#000000" }, { lightness: 19 }],
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#000000" }, { lightness: 17 }],
    },
];

const getCategoryIcon = (type) => {
    const icons = {
        Music: "musical-notes",
        Art: "color-palette",
        Food: "restaurant",
        Sports: "fitness",
        Tech: "laptop",
        Business: "briefcase",
    };
    return icons[type] || "calendar";
};

const getCategoryColor = (type) => {
    const colors = {
        Music: "#ff6b00",
        Art: "#9c27b0",
        Food: "#f44336",
        Sports: "#4caf50",
        Tech: "#2196f3",
        Business: "#ff9800",
    };
    return colors[type] || "#ff6b00";
};

const MapViewWrapper = () => {
    const [events, setEvents] = useState<any[]>([]);
    const markerAnimations = useRef<any[]>([]);

    const defaultImage =
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

    const fetchEvents = async () => {
        const { data, error } = await supabase
            .from("events")
            .select("id, title, address, location, lat, lng, type, image_url");

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

        // Initialize animations for each event
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
                    latitude: 45.2671, // Novi Sad center
                    longitude: 19.8335,
                    latitudeDelta: 0.02, // Street-level zoom
                    longitudeDelta: 0.02,
                }}
                customMapStyle={darkMapStyle}
                showsUserLocation
                showsMyLocationButton
            >
                {events.map((event, index) => (
                    <Marker
                        key={event.id}
                        coordinate={{
                            latitude: Number(event.lat),
                            longitude: Number(event.lng),
                        }}
                        title={event.title}
                        description={`${event.address || ""}, ${event.location || ""}`}
                    >
                        <Animated.View
                            style={[
                                styles.customMarker,
                                {
                                    transform: [
                                        {
                                            scale: markerAnimations.current[index]?.interpolate({
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
                                    onError={(e) => console.error("Image load error:", e.nativeEvent.error)}
                                />

                            </View>
                        </Animated.View>
                    </Marker>
                ))}
            </MapView>
        </View>
    );
};

export default MapViewWrapper;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    map: {
        flex: 1,
        backgroundColor: "#000",
    },
    webFallback: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
    },
    webText: {
        color: "#888",
        fontSize: 16,
    },
    customMarker: {
        alignItems: "center",
        justifyContent: "center",
    },
    markerImageContainer: {
        width: 33,
        height: 33,
        borderRadius: 24,
        overflow: "hidden",
        backgroundColor: "#1a1a1a",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 6,
        borderWidth: 2,
        borderColor: "#fff",
    },
    markerImage: {
        width: 28,
        height: 28,
        borderRadius: 24,
    },
    iconOverlay: {
        position: "absolute",
        bottom: 3,
        right: 3,
        borderRadius: 10,
        padding: 3,
        backgroundColor: "rgba(255, 107, 0, 0.9)",
    },
});