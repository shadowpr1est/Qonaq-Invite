// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
}

export interface UserProfile extends User {
  avatar?: string;
  bio?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'ru' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
  };
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

// API Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Speech Analysis Types
export interface SpeechAnalysis {
  id: string;
  userId: string;
  audioUrl: string;
  transcript: string;
  analysis: {
    fluency: number;
    pronunciation: number;
    grammar: number;
    vocabulary: number;
    overall: number;
  };
  feedback: string[];
  suggestions: string[];
  createdAt: string;
}

export interface SpeechUpload {
  audioFile: File;
  metadata?: {
    duration: number;
    language: string;
    type: 'practice' | 'test' | 'conversation';
  };
}

// Component Props Types
export interface ComponentWithChildren {
  children: React.ReactNode;
}

export interface ComponentWithClassName {
  className?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Form Types
export interface FormFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

// Theme Types
export type ThemeMode = 'light' | 'dark' | 'system';

// Navigation Types
export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
  children?: NavigationItem[];
  isExternal?: boolean;
}

// Site Generation types
export interface SiteGenerationRequest {
  event_type: string;
  theme: string;
  content_details: Record<string, any>;
  color_preferences?: string;
  style_preferences?: string;
  target_audience?: string;
}

export interface GeneratedSite {
  id: string;
  title: string;
  slug: string;
  meta_description?: string;
  event_type: string;
  theme: string;
  site_structure: Record<string, any>;
  html_content: string;
  is_published: boolean;
  view_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
}

export interface SitePreview {
  id: string;
  title: string;
  slug: string;
  meta_description?: string;
  event_type: string;
  theme: string;
  is_published: boolean;
  view_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserSitesResponse {
  sites: SitePreview[];
  total_count: number;
  published_count: number;
  draft_count: number;
}

export interface SiteUpdate {
  title?: string;
  meta_description?: string;
  is_published?: boolean;
  is_public?: boolean;
  content_details?: Record<string, any>;
  color_preferences?: string;
  style_preferences?: string;
}

export interface SiteStatistics {
  total_views: number;
  unique_views: number;
  total_shares: number;
  top_referrers: Array<Record<string, any>>;
  view_timeline: Array<Record<string, any>>;
  geographic_data: Array<Record<string, any>>;
}

// Event types for different occasions
export type EventType = 
  | 'wedding'
  | 'birthday'
  | 'anniversary'
  | 'graduation' 
  | 'corporate'
  | 'housewarming'
  | 'baby_shower'
  | 'engagement'
  | 'retirement'
  | 'holiday'
  | 'other';

// Theme styles
export type ThemeStyle = 
  | 'modern'
  | 'classic'
  | 'minimalist'
  | 'elegant'
  | 'playful'
  | 'rustic'
  | 'vintage'
  | 'bohemian'
  | 'luxury'
  | 'casual';

// Color scheme options
export type ColorScheme = 
  | 'romantic_pastels'
  | 'vibrant_celebration'
  | 'elegant_neutrals'
  | 'bold_modern'
  | 'nature_inspired'
  | 'classic_black_white'
  | 'warm_autumn'
  | 'cool_winter'
  | 'spring_fresh'
  | 'summer_bright';

// Site generation wizard steps
export interface SiteGenerationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

// Form data for site generation
export interface SiteFormData {
  // Basic info
  event_type: EventType;
  theme: ThemeStyle;
  
  // Event details
  event_title: string;
  event_date?: string;
  event_time?: string;
  venue_name?: string;
  venue_address?: string;
  
  // Content
  description: string;
  additional_info?: string;
  
  // Contact
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  
  // Design preferences
  color_preferences?: ColorScheme;
  custom_colors?: string;
  style_preferences?: string;
  target_audience?: string;
  
  // Media
  photos?: File[];
  logo?: File;
}

// Template categories for UI
export interface Template {
  id: string;
  name: string;
  event_type: EventType;
  theme: ThemeStyle;
  preview_image: string;
  color_scheme: ColorScheme;
  is_popular: boolean;
  is_premium?: boolean;
}

// Analytics event tracking
export interface AnalyticsEvent {
  event_type: string;
  event_data?: Record<string, any>;
  user_agent?: string;
  referrer?: string;
}

// Generation status for real-time updates
export interface GenerationStatus {
  step: string;
  progress: number; // 0-100
  message: string;
  estimated_time?: number; // seconds
}

// Расширенный интерфейс Site для редактирования
export interface Site {
  id: string;
  title: string;
  slug: string;
  meta_description?: string;
  event_type: EventType;
  theme: ThemeStyle;
  site_structure: Record<string, any>;
  html_content: string;
  is_published: boolean;
  view_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
  
  // Данные формы для редактирования
  content_details: {
    event_title: string;
    event_date?: string;
    event_time?: string;
    venue_name?: string;
    venue_address?: string;
    description: string;
    additional_info?: string;
    contact_name?: string;
    contact_phone?: string;
    contact_email?: string;
  };
  
  // Настройки дизайна
  color_preferences?: ColorScheme;
  style_preferences?: string;
  target_audience?: string;
  
  // Продвинутые настройки
  advanced_settings?: {
    typography_scale?: number;
    animation_intensity?: number;
    section_spacing?: number;
    border_radius?: number;
    enable_animations?: boolean;
    enable_parallax?: boolean;
    enable_dark_mode?: boolean;
  };
} 