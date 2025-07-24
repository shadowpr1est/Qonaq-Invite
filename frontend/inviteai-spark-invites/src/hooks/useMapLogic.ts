import { useState, useCallback } from 'react';
import { TWO_GIS_API_KEY } from '@/lib/constants';

interface LocationData {
  id: string;
  name: string;
  full_name: string;
  address_name: string;
  point: {
    lat: number;
    lon: number;
  };
  type: string;
  purpose_name?: string;
}

interface MapLogicState {
  location: string;
  coordinates: [number, number] | null;
  locationData: LocationData | null;
  isLoading: boolean;
  error: string | null;
  suggestions: LocationData[];
}

export const useMapLogic = () => {
  const [state, setState] = useState<MapLogicState>({
    location: '',
    coordinates: null,
    locationData: null,
    isLoading: false,
    error: null,
    suggestions: []
  });

  // Геокодинг адреса в координаты
  const geocodeAddress = useCallback(async (address: string): Promise<LocationData | null> => {
    if (!address.trim()) return null;

    console.log('🔍 Geocoding address:', address);
    console.log('🔑 2GIS API Key:', TWO_GIS_API_KEY ? 'Present' : 'Missing');

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const url = `https://catalog.api.2gis.com/3.0/items/geocode?q=${encodeURIComponent(address)}&fields=items.point,items.name,items.full_name,items.address_name,items.type,items.purpose_name&key=${TWO_GIS_API_KEY}`;
      console.log('🌐 Request URL:', url);

      const response = await fetch(url);
      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (data.result?.items && data.result.items.length > 0) {
        const locationData = data.result.items[0];
        console.log('✅ Found location:', locationData);
        console.log('📍 Coordinates [lon, lat]:', [locationData.point.lon, locationData.point.lat]);
        
        setState(prev => ({
          ...prev,
          locationData,
          coordinates: [locationData.point.lon, locationData.point.lat], // [lon, lat] для 2GIS
          isLoading: false
        }));
        return locationData;
      } else {
        console.log('❌ No items found in response');
        setState(prev => ({
          ...prev,
          error: 'Адрес не найден',
          isLoading: false
        }));
        return null;
      }
    } catch (error) {
      console.error('❌ Geocoding error:', error);
      setState(prev => ({
        ...prev,
        error: 'Ошибка при поиске адреса',
        isLoading: false
      }));
      return null;
    }
  }, []);

  // Поиск адресов для автодополнения
  const searchAddresses = useCallback(async (query: string): Promise<LocationData[]> => {
    if (!query.trim() || query.length < 2) {
      setState(prev => ({ ...prev, suggestions: [] }));
      return [];
    }

    try {
      const response = await fetch(
        `https://catalog.api.2gis.com/3.0/items/geocode?q=${encodeURIComponent(query)}&fields=items.point,items.name,items.full_name,items.address_name,items.type,items.purpose_name&page_size=5&key=${TWO_GIS_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.result?.items) {
        const suggestions = data.result.items;
        setState(prev => ({ ...prev, suggestions }));
        return suggestions;
      } else {
        setState(prev => ({ ...prev, suggestions: [] }));
        return [];
      }
    } catch (error) {
      console.error('Address search error:', error);
      setState(prev => ({ ...prev, suggestions: [] }));
      return [];
    }
  }, []);

  // Обратное геокодирование (координаты в адрес)
  const reverseGeocode = useCallback(async (lat: number, lon: number): Promise<LocationData | null> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch(
        `https://catalog.api.2gis.com/3.0/items/geocode?lat=${lat}&lon=${lon}&fields=items.point,items.name,items.full_name,items.address_name,items.type,items.purpose_name&key=${TWO_GIS_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.result?.items && data.result.items.length > 0) {
        const locationData = data.result.items[0];
        setState(prev => ({
          ...prev,
          locationData,
          location: locationData.full_name,
          coordinates: [lon, lat], // [lon, lat] для 2GIS
          isLoading: false
        }));
        return locationData;
      } else {
        setState(prev => ({
          ...prev,
          error: 'Адрес не найден для данных координат',
          isLoading: false
        }));
        return null;
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setState(prev => ({
        ...prev,
        error: 'Ошибка при определении адреса',
        isLoading: false
      }));
      return null;
    }
  }, []);

  // Установка локации
  const setLocation = useCallback((location: string) => {
    setState(prev => ({ ...prev, location, error: null }));
  }, []);

  // Установка координат
  const setCoordinates = useCallback((coordinates: [number, number]) => {
    setState(prev => ({ ...prev, coordinates, error: null }));
  }, []);

  // Выбор адреса из предложений
  const selectAddress = useCallback((locationData: LocationData) => {
    setState(prev => ({
      ...prev,
      location: locationData.full_name,
      coordinates: [locationData.point.lat, locationData.point.lon],
      locationData,
      suggestions: [],
      error: null
    }));
  }, []);

  // Очистка ошибки
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Очистка предложений
  const clearSuggestions = useCallback(() => {
    setState(prev => ({ ...prev, suggestions: [] }));
  }, []);

  return {
    // Состояние
    location: state.location,
    coordinates: state.coordinates,
    locationData: state.locationData,
    isLoading: state.isLoading,
    error: state.error,
    suggestions: state.suggestions,

    // Методы
    geocodeAddress,
    searchAddresses,
    reverseGeocode,
    setLocation,
    setCoordinates,
    selectAddress,
    clearError,
    clearSuggestions
  };
}; 