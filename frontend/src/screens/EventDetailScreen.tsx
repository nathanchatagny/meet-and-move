import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eventsAPI } from '../services/api';
import { authAPI } from '../services/api';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  sport: string;
  maxParticipants: number;
  participants: string[];
  image?: string;
  creator: {
    _id: string;
    name: string;
  };
}

interface EventDetailScreenProps {
  navigation: any;
  route: {
    params: {
      eventId: string;
    };
  };
}

const EventDetailScreen: React.FC<EventDetailScreenProps> = ({ navigation, route }) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isParticipant, setIsParticipant] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, []);

  const fetchEventDetails = async () => {
    try {
      const response = await eventsAPI.getEvent(route.params.eventId);
      setEvent(response.data);
      
      // Check if current user is participant or creator
      try {
        const userResponse = await authAPI.getProfile();
        const userData = userResponse.data;
        console.log('User ID:', userData._id);
        console.log('Creator ID:', response.data.creator._id);
        console.log('Is Creator:', response.data.creator._id === userData._id);
        setIsParticipant(response.data.participants.includes(userData._id));
        setIsCreator(response.data.creator._id === userData._id);
      } catch (userError) {
        console.error('Error fetching user profile:', userError);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les détails de l\'événement');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    try {
      await eventsAPI.joinEvent(event!._id);
      setIsParticipant(true);
      fetchEventDetails();
      Alert.alert('Succès', 'Tu as rejoint l\'événement !');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de rejoindre l\'événement');
    }
  };

  const handleLeaveEvent = async () => {
    try {
      await eventsAPI.leaveEvent(event!._id);
      setIsParticipant(false);
      fetchEventDetails();
      Alert.alert('Succès', 'Tu as quitté l\'événement');
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible de quitter l\'événement');
    }
  };

  const handleDeleteEvent = async () => {
    Alert.alert(
      'Supprimer l\'événement',
      'Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await eventsAPI.deleteEvent(event!._id);
              Alert.alert('Succès', 'Événement supprimé avec succès', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error: any) {
              Alert.alert('Erreur', error.response?.data?.message || 'Impossible de supprimer l\'événement');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Événement non trouvé</Text>
        </View>
      </View>
    );
  }

  const participantsCount = event.participants.length;
  const isFull = participantsCount >= event.maxParticipants;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="#000000" />
          </TouchableOpacity>
          
          <View style={styles.sportBadge}>
            <Text style={styles.sportText}>{event.sport.toUpperCase()}</Text>
          </View>
        </View>

        {event.image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: event.image }} style={styles.eventImage} />
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{event.title}</Text>
          
          <View style={styles.participantsInfo}>
            <Text style={styles.participantsText}>
              {participantsCount}/{event.maxParticipants} participants
            </Text>
            {isFull && <Text style={styles.fullText}>Complet</Text>}
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="calendar-outline" size={20} color="#007AFF" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date & Heure</Text>
                <Text style={styles.detailValue}>{formatDate(event.date)}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="location-outline" size={20} color="#007AFF" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Lieu</Text>
                <Text style={styles.detailValue}>{event.location}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="person-outline" size={20} color="#007AFF" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Organisateur</Text>
                <Text style={styles.detailValue}>{event.creator.name}</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionContainer}>
            {isCreator ? (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteEvent}
              >
                <Text style={styles.deleteButtonText}>Supprimer l'événement</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  isParticipant ? styles.leaveButton : styles.joinButton,
                  isFull && !isParticipant && styles.disabledButton,
                ]}
                onPress={isParticipant ? handleLeaveEvent : handleJoinEvent}
                disabled={isFull && !isParticipant}
              >
                <Text style={styles.actionButtonText}>
                  {isParticipant ? 'Quitter l\'événement' : isFull ? 'Événement complet' : 'Rejoindre l\'événement'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
  },
  scrollContent: {
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
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
  sportBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sportText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  imageContainer: {
    marginBottom: 20,
  },
  eventImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  participantsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  participantsText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  fullText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
  detailsContainer: {
    marginBottom: 32,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  actionContainer: {
    marginBottom: 30,
  },
  joinButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  leaveButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EventDetailScreen; 