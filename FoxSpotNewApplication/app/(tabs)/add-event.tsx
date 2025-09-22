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
    ImageBackground,
    FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "@/lib/supabase";
import { useNavigation } from "expo-router";

const { width } = Dimensions.get("window");

export default function AddEventScreen() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [type, setType] = useState("Music");
    const [image, setImage] = useState<string | null>(null);

    const [date, setDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const scrollY = useRef(new Animated.Value(0)).current;

    const categories = ["Music", "Art", "Food", "Sports", "Tech", "Business"];

    // Static Serbian places
    const places = [
        "Beograd",
        "Novi Sad",
        "Niš",
        "Kragujevac",
        "Subotica",
        "Zrenjanin",
        "Čačak",
        "Kraljevo",
        "Smederevo",
        "Pančevo",
        "Novi Pazar",
        "Šabac",
        "Leskovac",
        "Valjevo",
        "Vranje",
    ];

    const defaultImage =
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!title.trim()) newErrors.title = "Event title is required";
        if (!location.trim()) newErrors.location = "Location is required";
        if (!date) newErrors.date = "Date is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const navigation = useNavigation();

    const handleSave = async () => {
        if (!validateForm()) {
            Alert.alert("Error", "Please fill all required fields");
            return;
        }

        const {
            data: { user },
        } = await supabase.auth.getUser();

        const { error } = await supabase.from("events").insert({
            title,
            description,
            type,
            date: date!.toISOString(),
            image_url: image,
            created_by: user?.id,
            location,
        });

        if (error) {
            console.error(error);
            Alert.alert("Error", error.message);
        } else {
            navigation.navigate("events" as never, { refresh: true } as never);
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

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            {/* Header */}
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
                {/* Preview */}
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
                            <TouchableOpacity
                                style={styles.changeImageButton}
                                onPress={pickImage}
                            >
                                <Ionicons name="camera" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </ImageBackground>

                    <View style={styles.previewInfo}>
                        <Text style={styles.previewTitle}>
                            {title || "Your Event Title"}
                        </Text>
                        <Text style={styles.previewDetailText}>
                            {date
                                ? `${date.toDateString()} • ${date.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}`
                                : "Event Date & Time"}
                        </Text>
                        <Text style={styles.previewDetailText}>
                            {location || "Event Location"}
                        </Text>
                        <Text style={styles.previewDetailText}>{type}</Text>
                    </View>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {/* Title */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Event Title *</Text>
                        <View
                            style={[
                                styles.inputContainer,
                                errors.title ? styles.inputError : null,
                            ]}
                        >
                            <Ionicons
                                name="calendar"
                                size={20}
                                color="#ff6b00"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter event title"
                                placeholderTextColor="#666"
                                value={title}
                                onChangeText={(text) => {
                                    setTitle(text);
                                    clearError("title");
                                }}
                            />
                        </View>
                        {errors.title && (
                            <Text style={styles.errorText}>{errors.title}</Text>
                        )}
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons
                                name="document-text-outline"
                                size={20}
                                color="#ff6b00"
                                style={styles.inputIcon}
                            />
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

                    {/* Location Autocomplete */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Location *</Text>
                        <View
                            style={[
                                styles.inputContainer,
                                errors.location ? styles.inputError : null,
                            ]}
                        >
                            <Ionicons
                                name="location-outline"
                                size={20}
                                color="#ff6b00"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Type a city"
                                placeholderTextColor="#666"
                                value={location}
                                onChangeText={(text) => {
                                    setLocation(text);
                                    setShowSuggestions(true);
                                    clearError("location");
                                }}
                            />
                        </View>
                        {errors.location && (
                            <Text style={styles.errorText}>{errors.location}</Text>
                        )}

                        {showSuggestions && location.length > 0 && (
                            <FlatList
                                data={filteredPlaces}
                                keyExtractor={(item) => item}
                                style={styles.suggestionsList}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.suggestionItem}
                                        onPress={() => {
                                            setLocation(item);
                                            setShowSuggestions(false);
                                        }}
                                    >
                                        <Text style={styles.suggestionText}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                    </View>

                    {/* Date + Time */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Event Date *</Text>
                            <TouchableOpacity
                                style={[
                                    styles.inputContainer,
                                    errors.date ? styles.inputError : null,
                                ]}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Ionicons
                                    name="calendar-outline"
                                    size={20}
                                    color="#ff6b00"
                                    style={styles.inputIcon}
                                />
                                <Text style={styles.input}>
                                    {date ? date.toDateString() : "Pick Date"}
                                </Text>
                            </TouchableOpacity>
                            {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
                        </View>

                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Event Time *</Text>
                            <TouchableOpacity
                                style={styles.inputContainer}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <Ionicons
                                    name="time-outline"
                                    size={20}
                                    color="#ff6b00"
                                    style={styles.inputIcon}
                                />
                                <Text style={styles.input}>
                                    {date
                                        ? date.toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })
                                        : "Pick Time"}
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

                    {/* Categories */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.categoryContainer}>
                                {categories.map((category) => (
                                    <TouchableOpacity
                                        key={category}
                                        style={[
                                            styles.categoryButton,
                                            type === category && styles.categoryButtonSelected,
                                        ]}
                                        onPress={() => setType(category)}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryText,
                                                type === category && styles.categoryTextSelected,
                                            ]}
                                        >
                                            {category}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Save */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.createButton} onPress={handleSave}>
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
    inputError: { borderColor: "#ff4444" },
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
    createButtonText: { color: "#fff", fontWeight: "700" },
    bottomPadding: { height: 100 },
});
