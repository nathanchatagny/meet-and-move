import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eventsAPI } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

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

interface EventsScreenProps {
  navigation: any;
}

const EventsScreen: React.FC<EventsScreenProps> = ({ navigation }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      const response = await eventsAPI.getEvents();
      setEvents(response.data);
      
      // Get current user ID
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        setCurrentUserId(userData.id);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les événements');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Refresh events when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchEvents();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      await eventsAPI.joinEvent(eventId);
      fetchEvents();
      Alert.alert('Succès', 'Tu as rejoint l\'événement !');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de rejoindre l\'événement');
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    try {
      await eventsAPI.leaveEvent(eventId);
      fetchEvents();
      Alert.alert('Succès', 'Tu as quitté l\'événement');
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible de quitter l\'événement');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
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
              await eventsAPI.deleteEvent(eventId);
              fetchEvents();
              Alert.alert('Succès', 'Événement supprimé avec succès');
            } catch (error: any) {
              Alert.alert('Erreur', error.response?.data?.message || 'Impossible de supprimer l\'événement');
            }
          },
        },
      ]
    );
  };

  const renderEvent = ({ item }: { item: Event }) => {
    const isParticipant = item.participants.includes(currentUserId || '');
    const isCreator = item.creator._id === currentUserId;
    const participantsCount = item.participants.length;
    const isFull = participantsCount >= item.maxParticipants;

    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => navigation.navigate('EventDetail', { eventId: item._id })}
      >
        {item.image && (
          <Image source={{ uri: item.image }} style={styles.eventImage} />
        )}
        
        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <View style={styles.sportContainer}>
              <View style={styles.sportBadge}>
                <Text style={styles.sportText}>{item.sport.toUpperCase()}</Text>
              </View>
            </View>
            <View style={styles.participantsContainer}>
              <Text style={styles.participantsText}>
                {participantsCount}/{item.maxParticipants}
              </Text>
            </View>
          </View>

          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.eventDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color="#666666" />
              <Text style={styles.detailText}>
                {new Date(item.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={16} color="#666666" />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>
          </View>

          <View style={styles.eventFooter}>
            <Text style={styles.creatorText}>par {item.creator.name}</Text>
            
            {isCreator ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteEvent(item._id)}
              >
                <Text style={styles.deleteButtonText}>Supprimer</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isParticipant ? styles.leaveButton : styles.joinButton,
                  isFull && !isParticipant && styles.disabledButton,
                ]}
                onPress={() => {
                  if (isFull && !isParticipant) {
                    Alert.alert('Complet', 'Cet événement est déjà plein');
                    return;
                  }
                  if (isParticipant) {
                    handleLeaveEvent(item._id);
                  } else {
                    handleJoinEvent(item._id);
                  }
                }}
                disabled={isFull && !isParticipant}
              >
                <Text style={styles.actionButtonText}>
                  {isParticipant ? 'Quitter' : isFull ? 'Complet' : 'Rejoindre'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Événements</Text>
      </View>

      {events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#cccccc" />
          <Text style={styles.emptyTitle}>Aucun événement</Text>
          <Text style={styles.emptyText}>
            Il n'y a pas encore d'événements sportifs.{'\n'}
            Créez le premier événement !
          </Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => navigation.navigate('CreateEvent')}
          >
            <Text style={styles.createFirstButtonText}>Créer un événement</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.eventsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateEvent')}
      >
        <Ionicons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>
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
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  eventsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  eventContent: {
    padding: 20,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sportContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sportBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sportText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  participantsContainer: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  participantsText: {
    color: '#666666',
    fontSize: 12,
    fontWeight: '600',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  eventDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    color: '#666666',
    fontSize: 14,
    marginLeft: 8,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creatorText: {
    color: '#999999',
    fontSize: 14,
    flex: 1,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  joinButton: {
    backgroundColor: '#007AFF',
  },
  leaveButton: {
    backgroundColor: '#FF3B30',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  createFirstButton: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  createFirstButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EventsScreen; 