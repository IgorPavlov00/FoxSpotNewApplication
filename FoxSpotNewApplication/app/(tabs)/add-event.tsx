import React, { useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StatusBar,
    Alert,
    Platform,
    Animated,
    Dimensions,
    Image,
    ImageBackground
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { supabase } from "@/lib/supabase";
import { useNavigation } from "expo-router";

let MapView: any, Marker: any;
if (Platform.OS !== "web") {
    const M = require("react-native-maps");
    MapView = M.default;
    Marker = M.Marker;
}

const { width } = Dimensions.get("window");

const darkMapStyle = [
    { featureType: "all", elementType: "labels.text.fill", stylers: [{ saturation: 36 }, { color: "#000000" }, { lightness: 40 }] },
    { featureType: "all", elementType: "labels.text.stroke", stylers: [{ visibility: "on" }, { color: "#000000" }, { lightness: 16 }] },
    { featureType: "all", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { featureType: "administrative", elementType: "geometry.fill", stylers: [{ color: "#000000" }, { lightness: 20 }] },
    { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#000000" }, { lightness: 20 }] },
    { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#ff6b00" }, { lightness: "0" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }, { lightness: 17 }] },
];

const getCategoryIcon = (type: string) => {
    const icons: Record<string, string> = {
        Music: "musical-notes",
        Art: "color-palette",
        Food: "restaurant",
        Sports: "fitness",
        Tech: "laptop",
        Business: "briefcase",
    };
    return icons[type] || "calendar";
};

const getCategoryColor = (type: string) => {
    const colors: Record<string, string> = {
        Music: "#ff6b00",
        Art: "#9c27b0",
        Food: "#f44336",
        Sports: "#4caf50",
        Tech: "#2196f3",
        Business: "#ff9800",
    };
    return colors[type] || "#ff6b00";
};

export default function AddEventScreen() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [address, setAddress] = useState("");
    const [coordinates, setCoordinates] = useState<{ latitude: number | null; longitude: number | null }>({ latitude: null, longitude: null });
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
    const [type, setType] = useState("Music");
    const [image, setImage] = useState<string | null>(null);
    const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
    const [date, setDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const scrollY = useRef(new Animated.Value(0)).current;

    const categories = ["Music", "Art", "Food", "Sports", "Tech", "Business"];
    const places = [
        "Beograd", "Novi Sad", "Niš", "Kragujevac", "Subotica", "Zrenjanin",
        "Čačak", "Kraljevo", "Smederevo", "Pančevo", "Novi Pazar",
        "Šabac", "Leskovac", "Valjevo", "Vranje",
    ];
    const sampleAddresses: Record<string, string[]> = {
        Beograd: ["Knez Mihailova 1, Beograd", "Terazije 10, Beograd", "Skadarska 5, Beograd", "Kalemegdan, Beograd", "Ada Ciganlija, Beograd"],
        "Novi Sad": ["Zmaj Jovina 1, Novi Sad", "Dunavska 10, Novi Sad", "Trg Slobode 5, Novi Sad", "Petrovaradin Tvrđava, Novi Sad", "Štrand, Novi Sad"],
        "Niš": ["Obrenovićeva 1, Niš", "Trg Kralja Milana, Niš", "Niška Tvrđava, Niš"],
    };
    const defaultImage =
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=60";

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });
        if (!result.canceled) setImage(result.assets[0].uri);
    };

    const getCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission denied", "Allow location to use this feature.");
                return;
            }
            setIsGeocodingLoading(true);
            const loc = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = loc.coords;
            setCoordinates({ latitude, longitude });
            const rev = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (rev.length > 0) {
                const a = rev[0];
                const full = `${a.street || ""} ${a.streetNumber || ""}, ${a.city || a.subregion || ""}`.trim();
                setAddress(full);
                setLocation(a.city || a.subregion || "");
            }
            clearError("address");
        } catch (e) {
            Alert.alert("Error", "Could not get current location.");
        } finally {
            setIsGeocodingLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!title.trim()) newErrors.title = "Event title is required";
        if (!location.trim()) newErrors.location = "City is required";
        if (!address.trim()) newErrors.address = "Street address is required";
        if (!date) newErrors.date = "Date is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors((prev) => {
                const n = { ...prev };
                delete n[field];
                return n;
            });
        }
    };

    const navigation = useNavigation();

    const geocodeAddress = async (address: string, location: string) => {
        if (!address.trim() || !location.trim()) {
            throw new Error("Enter both city and street address.");
        }
        setIsGeocodingLoading(true);
        try {
            const q = `${address}, ${location}, Serbia`;
            const url =
                `https://nominatim.openstreetmap.org/search?` +
                `format=json&addressdetails=1&limit=1&countrycodes=rs&accept-language=sr&q=${encodeURIComponent(q)}`;
            const res = await fetch(url, {
                headers: {
                    "User-Agent": "FoxSpot/1.0 (contact: example@foxspot.app)",
                },
            });
            const json = await res.json();
            console.log("Geocoding URL:", url);
            console.log("Geocoding response:", json);
            if (Array.isArray(json) && json.length > 0) {
                const { lat, lon } = json[0];
                const latNum = parseFloat(lat);
                const lonNum = parseFloat(lon);
                if (Number.isFinite(latNum) && Number.isFinite(lonNum)) {
                    return { latitude: latNum, longitude: lonNum };
                }
                throw new Error("Geocoder returned invalid coordinates.");
            }
            throw new Error("Address not found. Try a more specific address (street + number).");
        } catch (e) {
            throw e;
        } finally {
            setIsGeocodingLoading(false);
        }
    };

    const handleSave = async () => {
        if (!validateForm()) {
            Alert.alert("Error", "Please fill all required fields.");
            return;
        }

        try {
            const coords = await geocodeAddress(address, location);
            setCoordinates(coords);

            const {
                data: { user },
            } = await supabase.auth.getUser();

            const payload: any = {
                title,
                description,
                type,
                date: date!.toISOString(),
                image_url: image,
                created_by: user?.id,
                location,
                address,
                lat: coords.latitude,
                lng: coords.longitude,
            };

            console.log("Saving event:", payload);

            const { error } = await supabase.from("events").insert(payload);
            if (error) {
                console.error("Supabase error:", error);
                Alert.alert("Error", error.message);
                return;
            }

            Alert.alert(
                "Success! 🎉",
                `Event "${title}" created.\n📍 ${address || location}\n🧭 ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
            );

            navigation.navigate("events" as never, { refresh: true } as never);

            setTitle("");
            setDescription("");
            setLocation("");
            setAddress("");
            setCoordinates({ latitude: null, longitude: null });
            setDate(null);
            setImage(null);
            setType("Music");
            setShowSuggestions(false);
            setShowAddressSuggestions(false);
        } catch (e: any) {
            console.error("Error creating event:", e);
            Alert.alert("Error", e.message || "Could not create event. Please try again.");
        }
    };

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0.9],
        extrapolate: "clamp",
    });

    const filteredPlaces = places.filter((p) =>
        p.toLowerCase().includes(location.toLowerCase())
    );

    const filteredAddresses =
        location && sampleAddresses[location]
            ? sampleAddresses[location].filter((a) =>
                a.toLowerCase().includes(address.toLowerCase())
            )
            : [];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create Event 🦊</Text>
                    <TouchableOpacity style={styles.helpButton}>
                        <Ionicons name="help-circle-outline" size={24} color="#ff6b00" />
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <Animated.ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                <View style={styles.previewCard}>
                    <ImageBackground
                        source={{ uri: image || defaultImage }}
                        style={styles.previewImage}
                        imageStyle={styles.previewImageStyle}
                    >
                        <LinearGradient
                            colors={["transparent", "rgba(0,0,0,0.8)"]}
                            style={styles.imageGradient}
                        />
                        <View style={styles.previewContent}>
                            <View style={styles.previewBadge}>
                                <Ionicons name="eye" size={14} color="#fff" />
                                <Text style={styles.previewBadgeText}>Preview</Text>
                            </View>
                            <TouchableOpacity style={styles.changeImageButton} onPress={pickImage}>
                                <Ionicons name="camera" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </ImageBackground>

                    <View style={styles.previewInfo}>
                        <Text style={styles.previewTitle}>{title || "Your Event Title"}</Text>
                        <Text style={styles.previewDetailText}>
                            {date
                                ? `${date.toDateString()} • ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                                : "Event Date & Time"}
                        </Text>
                        <Text style={styles.previewDetailText}>
                            {address || location || "Event Location"}
                        </Text>
                        <Text style={styles.previewDetailText}>{type}</Text>
                        {coordinates.latitude && coordinates.longitude && (
                            <View style={styles.coordinatesContainer}>
                                <Ionicons name="location" size={14} color="#ff6b00" />
                                <Text style={styles.coordinatesText}>
                                    {coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {coordinates.latitude && coordinates.longitude && Platform.OS !== "web" && (
                    <View style={styles.mapPreviewCard}>
                        <View style={styles.mapHeader}>
                            <Text style={styles.mapTitle}>Event Location Preview</Text>
                            <View style={styles.coordinatesDisplay}>
                                <Ionicons name="location" size={16} color="#ff6b00" />
                                <Text style={styles.coordinatesDisplayText}>
                                    {coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.mapContainer}>
                            <MapView
                                style={styles.mapPreview}
                                customMapStyle={darkMapStyle}
                                region={{
                                    latitude: coordinates.latitude,
                                    longitude: coordinates.longitude,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                                scrollEnabled={false}
                                zoomEnabled={false}
                                rotateEnabled={false}
                                pitchEnabled={false}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: coordinates.latitude,
                                        longitude: coordinates.longitude,
                                    }}
                                    title={title || "New Event"}
                                    description={address || location}
                                >
                                    <View style={styles.markerImageContainer}>
                                        <Image
                                            source={{ uri: image || defaultImage }}
                                            style={styles.markerImage}
                                            resizeMode="cover"
                                            onError={(e) => console.error("Image load error:", e.nativeEvent.error)}
                                        />
                                        <View style={[styles.iconOverlay, { backgroundColor: getCategoryColor(type) }]}>
                                            <Ionicons name={getCategoryIcon(type)} size={14} color="#fff" />
                                        </View>
                                    </View>
                                </Marker>
                            </MapView>

                            <View style={styles.mapOverlay}>
                                <View style={styles.mapEventInfo}>
                                    <Text style={styles.mapEventTitle} numberOfLines={1}>
                                        {title || "New Event"}
                                    </Text>
                                    <Text style={styles.mapEventLocation} numberOfLines={1}>
                                        📍 {address || location}
                                    </Text>
                                    <View style={styles.mapCategoryTag}>
                                        <Text
                                            style={[
                                                styles.mapCategoryText,
                                                { color: getCategoryColor(type) },
                                            ]}
                                        >
                                            {type}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Event Title *</Text>
                        <View style={[styles.inputContainer, errors.title && styles.inputError]}>
                            <Ionicons name="calendar" size={20} color="#ff6b00" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter event title"
                                placeholderTextColor="#666"
                                value={title}
                                onChangeText={(t) => {
                                    setTitle(t);
                                    clearError("title");
                                }}
                            />
                        </View>
                        {!!errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="document-text-outline" size={20} color="#ff6b00" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Describe your event"
                                placeholderTextColor="#666"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>City *</Text>
                        <View style={[styles.inputContainer, errors.location && styles.inputError]}>
                            <Ionicons name="location-outline" size={20} color="#ff6b00" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Type a city"
                                placeholderTextColor="#666"
                                value={location}
                                onChangeText={(text) => {
                                    setLocation(text);
                                    setShowSuggestions(true);
                                    clearError("location");
                                    setAddress("");
                                    setCoordinates({ latitude: null, longitude: null });
                                }}
                            />
                        </View>
                        {!!errors.location && <Text style={styles.errorText}>{errors.location}</Text>}

                        {showSuggestions && location.length > 0 && (
                            <ScrollView
                                style={styles.suggestionsList}
                                nestedScrollEnabled={true}
                                showsVerticalScrollIndicator={false}
                            >
                                {filteredPlaces.map((item) => (
                                    <TouchableOpacity
                                        key={item}
                                        style={styles.suggestionItem}
                                        onPress={() => {
                                            setLocation(item);
                                            setShowSuggestions(false);
                                            setAddress("");
                                            setCoordinates({ latitude: null, longitude: null });
                                        }}
                                    >
                                        <Text style={styles.suggestionText}>{item}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Street Address *</Text>
                        <View style={[styles.inputContainer, errors.address && styles.inputError]}>
                            <Ionicons name="home-outline" size={20} color="#ff6b00" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter street address"
                                placeholderTextColor="#666"
                                value={address}
                                onChangeText={(text) => {
                                    setAddress(text);
                                    setShowAddressSuggestions(true);
                                    clearError("address");
                                    setCoordinates({ latitude: null, longitude: null });
                                }}
                            />
                        </View>
                        {!!errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

                        {showAddressSuggestions && address.length > 0 && filteredAddresses.length > 0 && (
                            <ScrollView
                                style={styles.suggestionsList}
                                nestedScrollEnabled={true}
                                showsVerticalScrollIndicator={false}
                            >
                                {filteredAddresses.map((item) => (
                                    <TouchableOpacity
                                        key={item}
                                        style={styles.suggestionItem}
                                        onPress={() => {
                                            setAddress(item);
                                            setShowAddressSuggestions(false);
                                        }}
                                    >
                                        <Text style={styles.suggestionText}>{item}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}

                        {/*<View style={styles.locationActions}>*/}
                        {/*    <TouchableOpacity*/}
                        {/*        style={[styles.locationButton, styles.currentLocationButton]}*/}
                        {/*        onPress={getCurrentLocation}*/}
                        {/*        disabled={isGeocodingLoading}*/}
                        {/*    >*/}
                        {/*        <Ionicons name="locate" size={16} color="#fff" />*/}
                        {/*        <Text style={styles.locationButtonText}>Current Location</Text>*/}
                        {/*    </TouchableOpacity>*/}
                        {/*</View>*/}
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Event Date *</Text>
                            <TouchableOpacity
                                style={[styles.inputContainer, errors.date && styles.inputError]}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Ionicons name="calendar-outline" size={20} color="#ff6b00" style={styles.inputIcon} />
                                <Text style={styles.input}>{date ? date.toDateString() : "Pick Date"}</Text>
                            </TouchableOpacity>
                            {!!errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
                        </View>

                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Event Time *</Text>
                            <TouchableOpacity style={styles.inputContainer} onPress={() => setShowTimePicker(true)}>
                                <Ionicons name="time-outline" size={20} color="#ff6b00" style={styles.inputIcon} />
                                <Text style={styles.input}>
                                    {date ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Pick Time"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {showDatePicker && (
                        <DateTimePicker
                            value={date || new Date()}
                            mode="date"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={(e, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) {
                                    setDate(selectedDate);
                                    clearError("date");
                                }
                            }}
                        />
                    )}

                    {showTimePicker && (
                        <DateTimePicker
                            value={date || new Date()}
                            mode="time"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={(e, selectedTime) => {
                                setShowTimePicker(false);
                                if (selectedTime && date) {
                                    const newDate = new Date(date);
                                    newDate.setHours(selectedTime.getHours());
                                    newDate.setMinutes(selectedTime.getMinutes());
                                    setDate(newDate);
                                }
                            }}
                        />
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.categoryContainer}>
                                {categories.map((c) => (
                                    <TouchableOpacity
                                        key={c}
                                        style={[styles.categoryButton, type === c && styles.categoryButtonSelected]}
                                        onPress={() => setType(c)}
                                    >
                                        <Text style={[styles.categoryText, type === c && styles.categoryTextSelected]}>{c}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.createButton, isGeocodingLoading && styles.createButtonDisabled]}
                            onPress={handleSave}
                            disabled={isGeocodingLoading}
                        >
                            <Text style={styles.createButtonText}>Create Event</Text>
                            <Ionicons name="arrow-forward" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.bottomPadding} />
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    header: {
        backgroundColor: "#000",
        paddingTop: Platform.OS === "ios" ? 60 : 40,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTop: { flexDirection: "row", justifyContent: "space-between" },
    headerTitle: { fontSize: 28, fontWeight: "800", color: "#fff" },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255, 107, 0, 0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    helpButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255, 107, 0, 0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContainer: { flex: 1 },
    previewCard: {
        margin: 20,
        backgroundColor: "#1a1a1a",
        borderRadius: 20,
        overflow: "hidden",
    },
    previewImage: { height: 180, justifyContent: "space-between" },
    previewImageStyle: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    imageGradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: "50%" },
    previewContent: { flexDirection: "row", justifyContent: "space-between" },
    previewBadge: { flexDirection: "row", alignItems: "center" },
    previewBadgeText: { color: "#fff" },
    changeImageButton: { backgroundColor: "#ff6b00", padding: 6, borderRadius: 20 },
    previewInfo: { padding: 20 },
    previewTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
    previewDetailText: { color: "#ccc", marginTop: 4 },
    coordinatesContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        backgroundColor: "rgba(255, 107, 0, 0.1)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: "flex-start"
    },
    coordinatesText: {
        color: "#ff6b00",
        fontSize: 12,
        marginLeft: 4,
        fontFamily: "monospace"
    },
    mapPreviewCard: {
        margin: 20,
        backgroundColor: "#1a1a1a",
        borderRadius: 20,
        overflow: "hidden",
    },
    mapHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
    },
    mapTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
    coordinatesDisplay: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 107, 0, 0.1)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    coordinatesDisplayText: {
        color: "#ff6b00",
        fontSize: 12,
        marginLeft: 4,
        fontFamily: "monospace",
    },
    mapContainer: { height: 180, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, overflow: "hidden" },
    mapPreview: { flex: 1 },
    mapOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: 10,
    },
    mapEventInfo: { flexDirection: "column", gap: 4 },
    mapEventTitle: { color: "#fff", fontSize: 14, fontWeight: "600" },
    mapEventLocation: { color: "#ccc", fontSize: 12 },
    mapCategoryTag: {
        alignSelf: "flex-start",
        backgroundColor: "rgba(255, 107, 0, 0.2)",
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    mapCategoryText: { fontSize: 12, fontWeight: "600" },
    markerImageContainer: {
        width: 48,
        height: 48,
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
        width: 48,
        height: 48,
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
    form: { paddingHorizontal: 20 },
    inputGroup: { marginBottom: 20 },
    label: { color: "#fff", fontSize: 16, marginBottom: 8 },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1a1a1a",
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    inputError: { borderColor: "#ff4444", borderWidth: 1 },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, color: "#fff" },
    textArea: { height: 80, textAlignVertical: "top" },
    errorText: { color: "#ff4444", marginTop: 5 },
    suggestionsList: {
        backgroundColor: "#1a1a1a",
        borderRadius: 10,
        marginTop: 5,
        maxHeight: 120,
    },
    suggestionItem: { padding: 12 },
    suggestionText: { color: "#fff" },
    locationActions: {
        flexDirection: "row",
        marginTop: 10,
        gap: 10
    },
    locationButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ff6b00",
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 5,
    },
    currentLocationButton: {
        backgroundColor: "#28a745",
    },
    locationButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600"
    },
    row: { flexDirection: "row", gap: 15 },
    halfWidth: { flex: 1 },
    categoryContainer: { flexDirection: "row", gap: 12 },
    categoryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: "#1a1a1a",
        borderWidth: 1,
        borderColor: "rgba(255, 107, 0, 0.2)",
    },
    categoryButtonSelected: { backgroundColor: "#ff6b00", borderColor: "#ff6b00" },
    categoryText: { fontSize: 14, color: "#999" },
    categoryTextSelected: { color: "#fff" },
    buttonContainer: { marginTop: 10 },
    createButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ff6b00",
        paddingVertical: 16,
        borderRadius: 25,
    },
    createButtonDisabled: {
        backgroundColor: "#666",
        opacity: 0.5,
    },
    createButtonText: { color: "#fff", fontWeight: "700" },
    bottomPadding: { height: 100 },
});