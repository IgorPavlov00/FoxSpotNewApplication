import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Platform,
    TextInput,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import MapViewWrapper from '@/components/MapViewWrapper';

const categories = ['Party', 'Culture', 'Meeting', 'Workshop', 'Food', 'Sport'];

export default function HomeScreen() {
    const router = useRouter();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert('Logout Failed', error.message);
        } else {
            router.replace('/(auth)/LoginScreen');
        }
    };

    return (
        <View style={styles.container}>
            {Platform.OS === 'web' ? (
                <View style={styles.mapPlaceholder}>
                    <Text style={{ color: '#888' }}>Map is not supported on web yet.</Text>
                </View>
            ) : (
                <>
                    <MapViewWrapper />
                    <View style={styles.overlay}>
                        <TextInput
                            placeholder="Search events..."
                            placeholderTextColor="#888"
                            style={styles.searchInput}
                        />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
                            {categories.map((tag) => (
                                <TouchableOpacity key={tag} style={styles.tag}>
                                    <Text style={styles.tagText}>{tag}</Text>
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
        top: 50,
        left: 15,
        right: 15,
    },
    searchInput: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 12,
        fontSize: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    tagScroll: {
        marginTop: 10,
    },
    tag: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
    },
    tagText: {
        fontWeight: '600',
    },
});
