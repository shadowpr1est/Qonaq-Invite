// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Google Analytics
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Google OAuth
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Google Maps API
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyB6dAt9XwbM-JNiR1D5CONgbUvT4pQAuDA';

// 2GIS API
export const TWO_GIS_API_KEY = import.meta.env.VITE_2GIS_API_KEY || '';

// Debug: Log API key status
console.log('🔑 2GIS API Key Status:', TWO_GIS_API_KEY ? 'Present' : 'Missing');


// App Information
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'InvitlyAI';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: 'invitly_ai_user',
  TOKEN: 'invitly_ai_token',
  REFRESH_TOKEN: 'invitly_ai_refresh_token',
  THEME: 'invitly_ai_theme',
  SETTINGS: 'invitly_ai_settings',
} as const;

// API Endpoints - synchronized with backend
export const API_ENDPOINTS = {
  AUTH: {
      LOGIN: '/v1/auth/login',
  REGISTER: '/v1/auth/register',
  LOGOUT: '/v1/auth/logout',
  REFRESH: '/v1/auth/refresh',
  PROFILE: '/v1/user/profile',
  },
  USER: {
    PROFILE: '/v1/user/profile',
    UPDATE_PROFILE: '/v1/user/profile',
    CHANGE_PASSWORD: '/v1/user/change-password',
  },
} as const;

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  EMAIL_REGEX: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
} as const;

// UI Constants
export const UI = {
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 300,
} as const;

// Query Keys для React Query
export const QUERY_KEYS = {
  USER: ['user'],
  USER_PROFILE: ['user', 'profile'],
} as const; 