import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAttractions = async (destination) => {
  const response = await api.get('/attractions', {
    params: { destination }
  });
  return response.data;
};

export const resolveDestination = async (destination) => {
  const response = await api.get('/destinations/resolve', {
    params: { q: destination }
  });
  return response.data;
};

export const autocompleteDestinations = async (query) => {
  if (!query || query.trim().length < 2) return [];
  const response = await api.get('/destinations/autocomplete', {
    params: { q: query.trim() }
  });
  return response.data;
};

export const fetchDestinations = async () => {
  const response = await api.get('/destinations');
  return response.data;
};

export const fetchDestinationDetails = async (name) => {
  const response = await api.get(`/destinations/${encodeURIComponent(name)}`);
  return response.data;
};

export const fetchAttractions = async (params = {}) => {
  const response = await api.get('/attractions', { params });
  return response.data;
};

export const fetchHotels = async (destination) => {
  const response = await api.get('/hotels', { params: { destination } });
  return response.data;
};

export const fetchRestaurants = async (destination) => {
  const response = await api.get('/restaurants', { params: { destination } });
  return response.data;
};

export const getRecommendations = async (payload) => {
  const response = await api.post('/recommendations', payload);
  return response.data;
};

export const generateItinerary = async (payload) => {
  const response = await api.post('/itinerary', payload);
  return response.data;
};

export const calculateBudget = async (payload) => {
  const response = await api.post('/budget', payload);
  return response.data;
};

export const getWeather = async (destination) => {
  const response = await api.get(`/weather/${encodeURIComponent(destination)}`);
  return response.data;
};

export const optimizeRoute = async (payload) => {
  const response = await api.post('/route', payload);
  return response.data;
};

export const getAnalytics = async () => {
  const response = await api.get('/analytics');
  return response.data;
};

export const saveItinerary = async (payload) => {
  const response = await api.post('/itineraries/save', payload);
  return response.data;
};

export const getSavedItineraries = async () => {
  const response = await api.get('/itineraries');
  return response.data;
};

export default api;
