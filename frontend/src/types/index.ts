// Core types for the Music and You application
import { ReactNode } from 'react';

export interface User {
  id: string;
  display_name: string;
  email?: string;
  country?: string;
  product?: 'free' | 'premium';
  followers?: {
    total: number;
  };
  images?: Array<{
    url: string;
    height?: number;
    width?: number;
  }>;
}

export interface Track {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  duration_ms: number;
  popularity: number;
  explicit: boolean;
  preview_url?: string;
  external_urls: {
    spotify?: string;
  };
}

export interface Artist {
  id: string;
  name: string;
  genres?: string[];
  popularity?: number;
  followers?: {
    total: number;
  };
  images?: Array<{
    url: string;
    height?: number;
    width?: number;
  }>;
}

export interface Album {
  id: string;
  name: string;
  artists: Artist[];
  release_date: string;
  total_tracks: number;
  images?: Array<{
    url: string;
    height?: number;
    width?: number;
  }>;
}

export interface AudioFeatures {
  id: string;
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  time_signature: number;
}

export interface ListeningHistory {
  track: Track;
  played_at: string;
  context?: {
    type: 'playlist' | 'album' | 'artist';
    uri: string;
  };
}

// Personality Types
export type BigFiveTrait = 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism';

export interface PersonalityScore {
  trait: BigFiveTrait;
  score: number;
  percentile: number;
  description: string;
  confidence: number;
}

export interface PersonalityPrediction {
  user_id: string;
  prediction_date: string;
  scores: PersonalityScore[];
  overall_confidence: number;
  features_used: string[];
  model_version: string;
  explanation?: {
    key_factors: Array<{
      factor: string;
      impact: number;
      description: string;
    }>;
  };
}

// Feature Types
export interface AcousticFeatures {
  energy_valence_quadrant: string;
  danceability_energy_ratio: number;
  acoustic_complexity: number;
  emotional_intensity: number;
  rhythmic_consistency: number;
  // ... other acoustic features
}

export interface BehavioralFeatures {
  listening_diversity: number;
  exploration_rate: number;
  popularity_preference: number;
  session_length_avg: number;
  skip_rate: number;
  repeat_rate: number;
  // ... other behavioral features
}

export interface TemporalFeatures {
  morning_listening: number;
  evening_listening: number;
  weekend_patterns: number;
  seasonal_variance: number;
  // ... other temporal features
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    request_id: string;
    processing_time_ms: number;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// Authentication Types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpires: Date | null;
  platforms: {
    spotify: boolean;
    lastfm: boolean;
    youtube_music: boolean;
  };
}

export interface AuthError {
  code: string;
  message: string;
  platform?: string;
}

// Analysis Types
export interface MusicAnalysis {
  user_id: string;
  analysis_date: string;
  total_tracks: number;
  time_range: string;
  acoustic_features: AcousticFeatures;
  behavioral_features: BehavioralFeatures;
  temporal_features: TemporalFeatures;
  top_genres: Array<{
    genre: string;
    count: number;
    percentage: number;
  }>;
  top_artists: Array<{
    artist: Artist;
    play_count: number;
    total_time_ms: number;
  }>;
  listening_patterns: {
    most_active_hours: number[];
    most_active_days: string[];
    average_session_length: number;
    total_listening_time: number;
  };
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface ErrorState {
  hasError: boolean;
  error?: Error | ApiResponse<any>;
  timestamp?: Date;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'spotify' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface CardProps extends BaseComponentProps {
  title?: string;
  description?: string;
  footer?: ReactNode;
  padding?: 'sm' | 'md' | 'lg';
}

// Form Types
export interface PersonalityQuestionnaireData {
  // TIPI (Ten Item Personality Inventory) responses
  tipi_responses: number[]; // 10 responses on 1-7 scale
  
  // Optional additional scales
  empathy_quotient?: number[];
  systemizing_quotient?: number[];
  
  // Demographic information
  age?: number;
  gender?: string;
  education?: string;
  country?: string;
  
  // Music preferences
  music_training?: boolean;
  favorite_genres?: string[];
  hours_per_day?: number;
}

// Visualization Types
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

export interface PersonalityVisualization {
  radar_chart: ChartData;
  bar_chart: ChartData;
  comparison_data?: {
    user_scores: number[];
    population_means: number[];
    trait_labels: string[];
  };
}

// Settings and Preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    analysis_complete: boolean;
    weekly_summary: boolean;
  };
  privacy: {
    share_anonymized_data: boolean;
    public_profile: boolean;
    data_retention_days: number;
  };
  analysis: {
    auto_analyze: boolean;
    analysis_frequency: 'weekly' | 'monthly' | 'manual';
    include_explicit_content: boolean;
  };
}

// Export utility types
export type WithId<T> = T & { id: string };
export type WithTimestamp<T> = T & { created_at: string; updated_at: string };
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
