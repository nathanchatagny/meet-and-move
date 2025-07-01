import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://172.22.22.77:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  getUserStats: () => api.get('/auth/stats'),
};

// Events API
export const eventsAPI = {
  getEvents: () => api.get('/events'),
  getEvent: (id: string) => api.get(`/events/${id}`),
  getUserEvents: () => api.get('/events/user'),
  createEvent: (data: {
    title: string;
    description: string;
    location: string;
    date: string;
    sport: string;
    maxParticipants: number;
    image?: string;
  }) => api.post('/events', data),
  joinEvent: (id: string) => api.post(`/events/${id}/join`),
  leaveEvent: (id: string) => api.post(`/events/${id}/leave`),
  deleteEvent: (id: string) => api.delete(`/events/${id}`),
};

export default api; 