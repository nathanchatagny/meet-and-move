import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { eventsAPI } from '../services/api';

interface CreateEventScreenProps {
  navigation: any;
}

const CreateEventScreen: React.FC<CreateEventScreenProps> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sport, setSport] = useState('football');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showSportPicker, setShowSportPicker] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState('10');
  const [eventImage, setEventImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sports = [
    { label: 'Football', value: 'football' },
    { label: 'Basketball', value: 'basketball' },
    { label: 'Tennis', value: 'tennis' },
    { label: 'Course à pied', value: 'running' },
    { label: 'Cyclisme', value: 'cycling' },
    { label: 'Natation', value: 'swimming' },
    { label: 'Volleyball', value: 'volleyball' },
    { label: 'Badminton', value: 'badminton' },
    { label: 'Ping-pong', value: 'ping-pong' },
    { label: 'Golf', value: 'golf' },
    { label: 'Ski', value: 'skiing' },
    { label: 'Snowboard', value: 'snowboarding' },
    { label: 'Escalade', value: 'climbing' },
    { label: 'Yoga', value: 'yoga' },
    { label: 'Fitness', value: 'fitness' },
    { label: 'Boxe', value: 'boxing' },
    { label: 'Arts martiaux', value: 'martial-arts' },
    { label: 'Danse', value: 'dance' },
    { label: 'Randonnée', value: 'hiking' },
    { label: 'Surf', value: 'surfing' },
  ];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setEventImage(result.assets[0].uri);
    }
  };

  const handleCreateEvent = async () => {
    if (!title || !description || !location) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (parseInt(maxParticipants) < 2) {
      Alert.alert('Erreur', 'Il faut au moins 2 participants pour un événement');
      return;
    }

    setLoading(true);
    try {
      await eventsAPI.createEvent({
        title,
        description,
        sport,
        location,
        date: date.toISOString(),
        maxParticipants: parseInt(maxParticipants),
        image: eventImage,
      });
      Alert.alert('Succès', 'Événement créé avec succès !', [
        { text: 'OK', onPress: () => navigation.navigate('Events') }
      ]);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDate(newDate);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={28} color="#000000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Créer un événement</Text>
            <View style={{ width: 44 }} />
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Titre de l'événement</Text>
              <TextInput
                style={styles.input}
                placeholder="Donnez un titre à votre événement"
                placeholderTextColor="#999999"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Décrivez votre événement, le niveau requis, etc."
                placeholderTextColor="#999999"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Photo de l'événement (optionnel)</Text>
              <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
                {eventImage ? (
                  <Image source={{ uri: eventImage }} style={styles.eventImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera" size={32} color="#999999" />
                    <Text style={styles.imagePlaceholderText}>Ajouter une photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Sport</Text>
              <TouchableOpacity
                style={styles.sportButton}
                onPress={() => setShowSportPicker(true)}
              >
                <Text style={styles.sportButtonText}>
                  {sports.find(s => s.value === sport)?.label || 'Choisir un sport'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Lieu</Text>
              <TextInput
                style={styles.input}
                placeholder="Où se déroule l'événement ?"
                placeholderTextColor="#999999"
                value={location}
                onChangeText={setLocation}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date et heure</Text>
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {date.toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={styles.timeButtonText}>
                    {date.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nombre max de participants</Text>
              <TextInput
                style={styles.input}
                placeholder="Combien de personnes maximum ?"
                placeholderTextColor="#999999"
                value={maxParticipants}
                onChangeText={setMaxParticipants}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleCreateEvent}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Création...' : 'Créer l\'événement'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {showDatePicker && (
          <View style={Platform.OS === 'ios' ? styles.pickerContainer : undefined}>
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
              style={Platform.OS === 'ios' ? styles.datePickerIOS : undefined}
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.pickerDoneButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.pickerDoneButtonText}>Terminé</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {showTimePicker && (
          <View style={Platform.OS === 'ios' ? styles.pickerContainer : undefined}>
            <DateTimePicker
              value={date}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
              style={Platform.OS === 'ios' ? styles.timePickerIOS : undefined}
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.pickerDoneButton}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.pickerDoneButtonText}>Terminé</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {showSportPicker && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choisir un sport</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowSportPicker(false)}
                >
                  <Ionicons name="close" size={24} color="#000000" />
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={sport}
                onValueChange={(value) => {
                  setSport(value);
                  setShowSportPicker(false);
                }}
                style={styles.modalPicker}
              >
                {sports.map((sportOption) => (
                  <Picker.Item
                    key={sportOption.value}
                    label={sportOption.label}
                    value={sportOption.value}
                    color="#000000"
                  />
                ))}
              </Picker>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  imagePlaceholderText: {
    color: '#999999',
    fontSize: 16,
    marginTop: 8,
  },
  pickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  picker: {
    color: '#000000',
    backgroundColor: 'transparent',
  },
  dateButton: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  dateButtonText: {
    color: '#000000',
    fontSize: 16,
    textAlign: 'center',
  },
  datePickerIOS: {
    backgroundColor: '#ffffff',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeButton: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  timeButtonText: {
    color: '#000000',
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  sportButton: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sportButtonText: {
    color: '#000000',
    fontSize: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPicker: {
    height: 200,
    width: '100%',
  },
  timePickerIOS: {
    backgroundColor: '#ffffff',
  },
  pickerDoneButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  pickerDoneButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CreateEventScreen; 