import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';

export default function AddEventScreen({ navigation }: any) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const lat = 44.7866;
    const lng = 20.4489;

    const handleAddEvent = async () => {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        if (!userId) {
            Alert.alert('Error', 'User not authenticated');
            return;
        }

        const { error } = await supabase.from('events').insert([
            {
                title,
                description,
                type,
                lat,
                lng,
                date: date.toISOString(),
                created_by: userId,
            },
        ]);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Success', 'Event added!');
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Add New Event</Text>

            <TextInput
                placeholder="Title"
                placeholderTextColor="#999"
                style={styles.input}
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                placeholder="Description"
                placeholderTextColor="#999"
                style={styles.input}
                value={description}
                onChangeText={setDescription}
            />
            <TextInput
                placeholder="Type (e.g. party)"
                placeholderTextColor="#999"
                style={styles.input}
                value={type}
                onChangeText={setType}
            />

            <TouchableOpacity style={styles.buttonSecondary} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.buttonText}>Select Date</Text>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="datetime"
                    display="default"
                    onChange={(_, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) setDate(selectedDate);
                    }}
                />
            )}

            <TouchableOpacity style={styles.buttonPrimary} onPress={handleAddEvent}>
                <Text style={styles.buttonText}>Add Event</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0d0d0d',
        padding: 24,
        justifyContent: 'center',
    },
    heading: {
        fontSize: 24,
        color: '#fff',
        marginBottom: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        padding: 14,
        marginBottom: 15,
        color: 'white',
        borderWidth: 1,
        borderColor: '#333',
    },
    buttonPrimary: {
        backgroundColor: '#ff6600',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonSecondary: {
        backgroundColor: '#1e90ff',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
});
