/**
 * Demo data for showcasing Music & You functionality without backend
 * This allows the frontend to work on GitHub Pages as a static site
 */

export interface DemoPersonalityScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface DemoUserProfile {
  user_id: string;
  display_name: string;
  email: string;
  followers: number;
  profile_image?: string;
}

export interface DemoTrack {
  track_id: string;
  track_name: string;
  artist_name: string;
  album_name: string;
  duration_ms: number;
  popularity: number;
  preview_url?: string;
  external_urls: {
    spotify: string;
  };
}

export interface DemoAudioFeatures {
  id: string;
  energy: number;
  valence: number;
  danceability: number;
  acousticness: number;
  instrumentalness: number;
  speechiness: number;
  liveness: number;
  loudness: number;
  tempo: number;
  duration_ms: number;
  time_signature: number;
  key: number;
  mode: number;
}

export interface DemoAnalysisResult {
  user_id: string;
  personality_scores: DemoPersonalityScores;
  insights: string[];
  confidence: number;
  data_summary: {
    total_tracks_analyzed: number;
    audio_features_available: number;
    analysis_features: number;
    feature_categories: {
      acoustic: number;
      temporal: number;
      behavioral: number;
      psychological: number;
    };
    temporal_ranges: {
      recent_tracks: number;
      short_term_top: number;
      medium_term_top: number;
      long_term_top: number;
      saved_tracks: number;
    };
  };
  analysis_timestamp: number;
  model_version: string;
  status: string;
}

// Demo user profile
export const demoUserProfile: DemoUserProfile = {
  user_id: "demo_user_123",
  display_name: "Demo User",
  email: "demo@music-and-you.com",
  followers: 42,
  profile_image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
};

// Demo personality scores (representing "The Empathetic Bridge-Builder" profile)
export const demoPersonalityScores: DemoPersonalityScores = {
  openness: 0.82,
  conscientiousness: 0.70,
  extraversion: 0.45,
  agreeableness: 0.80,
  neuroticism: 0.55
};

// Demo tracks representing diverse musical tastes
export const demoTracks: DemoTrack[] = [
  {
    track_id: "demo_1",
    track_name: "What's Going On",
    artist_name: "Marvin Gaye",
    album_name: "What's Going On",
    duration_ms: 232000,
    popularity: 85,
    external_urls: { spotify: "https://open.spotify.com/track/demo1" }
  },
  {
    track_id: "demo_2", 
    track_name: "Three Little Birds",
    artist_name: "Bob Marley & The Wailers",
    album_name: "Exodus",
    duration_ms: 181000,
    popularity: 88,
    external_urls: { spotify: "https://open.spotify.com/track/demo2" }
  },
  {
    track_id: "demo_3",
    track_name: "Lean on Me",
    artist_name: "Bill Withers", 
    album_name: "Still Bill",
    duration_ms: 249000,
    popularity: 82,
    external_urls: { spotify: "https://open.spotify.com/track/demo3" }
  },
  {
    track_id: "demo_4",
    track_name: "Imagine",
    artist_name: "John Lennon",
    album_name: "Imagine",
    duration_ms: 183000,
    popularity: 90,
    external_urls: { spotify: "https://open.spotify.com/track/demo4" }
  },
  {
    track_id: "demo_5",
    track_name: "Bridge Over Troubled Water",
    artist_name: "Simon & Garfunkel",
    album_name: "Bridge Over Troubled Water",
    duration_ms: 294000,
    popularity: 87,
    external_urls: { spotify: "https://open.spotify.com/track/demo5" }
  }
];

// Demo audio features corresponding to the tracks
export const demoAudioFeatures: DemoAudioFeatures[] = [
  {
    id: "demo_1",
    energy: 0.45,
    valence: 0.65,
    danceability: 0.55,
    acousticness: 0.35,
    instrumentalness: 0.02,
    speechiness: 0.03,
    liveness: 0.08,
    loudness: -12.5,
    tempo: 105.2,
    duration_ms: 232000,
    time_signature: 4,
    key: 9,
    mode: 1
  },
  {
    id: "demo_2",
    energy: 0.62,
    valence: 0.85,
    danceability: 0.75,
    acousticness: 0.45,
    instrumentalness: 0.01,
    speechiness: 0.04,
    liveness: 0.12,
    loudness: -9.8,
    tempo: 128.4,
    duration_ms: 181000,
    time_signature: 4,
    key: 2,
    mode: 1
  },
  {
    id: "demo_3",
    energy: 0.58,
    valence: 0.78,
    danceability: 0.68,
    acousticness: 0.52,
    instrumentalness: 0.01,
    speechiness: 0.03,
    liveness: 0.09,
    loudness: -11.2,
    tempo: 112.6,
    duration_ms: 249000,
    time_signature: 4,
    key: 7,
    mode: 1
  },
  {
    id: "demo_4",
    energy: 0.38,
    valence: 0.72,
    danceability: 0.42,
    acousticness: 0.68,
    instrumentalness: 0.01,
    speechiness: 0.03,
    liveness: 0.06,
    loudness: -14.3,
    tempo: 76.8,
    duration_ms: 183000,
    time_signature: 4,
    key: 0,
    mode: 1
  },
  {
    id: "demo_5",
    energy: 0.35,
    valence: 0.45,
    danceability: 0.38,
    acousticness: 0.82,
    instrumentalness: 0.02,
    speechiness: 0.03,
    liveness: 0.05,
    loudness: -16.7,
    tempo: 68.4,
    duration_ms: 294000,
    time_signature: 4,
    key: 11,
    mode: 0
  }
];

// Demo analysis result
export const demoAnalysisResult: DemoAnalysisResult = {
  user_id: "demo_user_123",
  personality_scores: demoPersonalityScores,
  insights: [
    "You are 'The Empathetic Bridge-Builder' - gravitating to emotion-forward ballads, faith & hope anthems, and cross-cultural musical connections that help you process feelings and connect with others",
    "Your Cultural Diversity Index is exceptionally high (0.85) - spanning multiple continents and genres from Ghanaian highlife to reggae, soul standards, and modern ballads, indicating strong cultural openness and heritage rootedness",
    "Your Live/Acoustic Affinity is remarkably high (0.72) - showing a strong preference for authenticity and presence over studio polish, suggesting you value genuine human connection in music",
    "You frequently inhabit the 'Calm/Positive' emotional quadrant - using music for decompression, gratitude, and evening resets with soothing uplift",
    "Your Resilience Score is high (0.68) - you demonstrate healthy emotional regulation by counterbalancing melancholic tracks with uplifting reggae, faith music, and soul standards",
    "Your Faith & Hope Index is elevated (0.45) - incorporating worship, gospel, and secular hope anthems as sources of spiritual strength and community connection",
    "Your Nostalgia Meter is strong (0.78) - with significant preference for evergreens and retrospectives, suggesting you use music to connect with family memories and cultural heritage",
    "Your Social Sing-along Index is high (0.65) - featuring communal classics that bring people together, reflecting your bridge-building nature and desire for shared musical experiences",
    "Your exceptional Openness (0.82) manifests through cross-continental genre exploration, appreciation for live/acoustic variants, and inclusion of classical & cinematic instrumentals - you're a true musical adventurer",
    "Your high Agreeableness (0.80) shines through your preference for prosocial classics, gospel/worship music, and empathy-driven relationship themes - music is your tool for human connection"
  ],
  confidence: 0.89,
  data_summary: {
    total_tracks_analyzed: 127,
    audio_features_available: 127,
    analysis_features: 35,
    feature_categories: {
      acoustic: 12,
      temporal: 8,
      behavioral: 8,
      psychological: 7
    },
    temporal_ranges: {
      recent_tracks: 50,
      short_term_top: 25,
      medium_term_top: 30,
      long_term_top: 35,
      saved_tracks: 42
    }
  },
  analysis_timestamp: Date.now(),
  model_version: "enhanced_comprehensive_v3.0",
  status: "completed"
};

// Demo chat responses for different contexts
export const demoChatResponses = {
  personality: "Your personality analysis reveals you're 'The Empathetic Bridge-Builder' - someone who uses music to connect with others and process emotions. Your high Openness (0.82) and Agreeableness (0.80) show you're both adventurous in your musical tastes and drawn to harmony and connection.",
  features: "Your music shows a beautiful balance of emotional depth and uplifting energy. You gravitate toward acoustic warmth and positive messages, with a particular love for songs that bring people together.",
  recommendations: "Based on your profile, you might enjoy artists like Tracy Chapman, Ben Harper, or Norah Jones - musicians who blend acoustic warmth with meaningful lyrics about connection and hope.",
  privacy: "Your privacy is completely protected! This demo uses sample data to showcase the functionality. In the full version, your actual Spotify data would be processed securely and never shared."
};

// Utility function to check if we're in demo mode
export const isDemoMode = (): boolean => {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || 
         typeof window !== 'undefined' && window.location.hostname.includes('github.io');
};

// Simulate API delay for realistic demo experience
export const simulateApiDelay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
