import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, LoadingState, ErrorState } from '@/types';
import apiClient from '@/lib/api';

interface AuthStore extends AuthState {
  // State
  loading: LoadingState;
  error: ErrorState;
  
  // Actions
  loginWithSpotify: () => Promise<void>;
  handleAuthCallback: (code: string, state: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: LoadingState) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      tokenExpires: null,
      platforms: {
        spotify: false,
        lastfm: false,
        youtube_music: false,
      },
      loading: { isLoading: false },
      error: { hasError: false },

      // Actions
      loginWithSpotify: async () => {
        try {
          set({ 
            loading: { isLoading: true, message: 'Redirecting to Spotify...' },
            error: { hasError: false }
          });

          const response = await apiClient.getSpotifyAuthUrl();
          if (response.success && response.data) {
            window.location.href = response.data.auth_url;
          } else {
            throw new Error(response.error?.message || 'Failed to get auth URL');
          }
        } catch (error) {
          set({
            loading: { isLoading: false },
            error: {
              hasError: true,
              error: error as Error,
              timestamp: new Date(),
            },
          });
        }
      },

      handleAuthCallback: async (code: string, state: string) => {
        try {
          set({ 
            loading: { isLoading: true, message: 'Completing authentication...' },
            error: { hasError: false }
          });

          const response = await apiClient.handleSpotifyCallback(code, state);
          if (response.success && response.data) {
            set({
              isAuthenticated: true,
              user: response.data.user,
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
              tokenExpires: response.data.tokenExpires ? new Date(response.data.tokenExpires) : null,
              platforms: response.data.platforms,
              loading: { isLoading: false },
            });
          } else {
            throw new Error(response.error?.message || 'Authentication failed');
          }
        } catch (error) {
          set({
            loading: { isLoading: false },
            error: {
              hasError: true,
              error: error as Error,
              timestamp: new Date(),
            },
          });
        }
      },

      logout: async () => {
        try {
          set({ loading: { isLoading: true, message: 'Logging out...' } });
          
          await apiClient.logout();
          
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
            tokenExpires: null,
            platforms: {
              spotify: false,
              lastfm: false,
              youtube_music: false,
            },
            loading: { isLoading: false },
            error: { hasError: false },
          });
        } catch (error) {
          // Even if API call fails, clear local state
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
            tokenExpires: null,
            platforms: {
              spotify: false,
              lastfm: false,
              youtube_music: false,
            },
            loading: { isLoading: false },
            error: {
              hasError: true,
              error: error as Error,
              timestamp: new Date(),
            },
          });
        }
      },

      refreshUser: async () => {
        try {
          const response = await apiClient.getCurrentUser();
          if (response.success && response.data) {
            set({ user: response.data });
          }
        } catch (error) {
          console.error('Failed to refresh user:', error);
          // Don't set error state for silent refresh failures
        }
      },

      clearError: () => {
        set({ error: { hasError: false } });
      },

      setLoading: (loading: LoadingState) => {
        set({ loading });
      },
    }),
    {
      name: 'music-and-you-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        tokenExpires: state.tokenExpires,
        platforms: state.platforms,
      }),
    }
  )
);

// Music analysis store
interface AnalysisStore {
  // State
  currentAnalysis: any | null;
  analysisHistory: any[];
  loading: LoadingState;
  error: ErrorState;

  // Actions
  startAnalysis: (timeRange?: string) => Promise<void>;
  getLatestAnalysis: () => Promise<void>;
  clearAnalysis: () => void;
  setLoading: (loading: LoadingState) => void;
  clearError: () => void;
}

export const useAnalysisStore = create<AnalysisStore>((set, get) => ({
  // Initial state
  currentAnalysis: null,
  analysisHistory: [],
  loading: { isLoading: false },
  error: { hasError: false },

  // Actions
  startAnalysis: async (timeRange = 'medium_term') => {
    try {
      set({ 
        loading: { isLoading: true, message: 'Starting music analysis...' },
        error: { hasError: false }
      });

      const response = await apiClient.startMusicAnalysis(timeRange);
      if (response.success && response.data) {
        // Poll for completion
        const pollStatus = async (analysisId: string) => {
          const statusResponse = await apiClient.getAnalysisStatus(analysisId);
          if (statusResponse.success && statusResponse.data) {
            const { status, progress, message } = statusResponse.data;
            
            set({ 
              loading: { 
                isLoading: status !== 'completed' && status !== 'failed',
                message: message || `Analysis ${status}...`,
                progress
              }
            });

            if (status === 'completed') {
              // Get the completed analysis
              const analysisResponse = await apiClient.getMusicAnalysis(analysisId);
              if (analysisResponse.success && analysisResponse.data) {
                set({
                  currentAnalysis: analysisResponse.data,
                  loading: { isLoading: false },
                });
              }
            } else if (status === 'failed') {
              throw new Error(message || 'Analysis failed');
            } else {
              // Continue polling
              setTimeout(() => pollStatus(analysisId), 2000);
            }
          }
        };

        await pollStatus(response.data.analysis_id);
      } else {
        throw new Error(response.error?.message || 'Failed to start analysis');
      }
    } catch (error) {
      set({
        loading: { isLoading: false },
        error: {
          hasError: true,
          error: error as Error,
          timestamp: new Date(),
        },
      });
    }
  },

  getLatestAnalysis: async () => {
    try {
      set({ loading: { isLoading: true, message: 'Loading analysis...' } });
      
      const response = await apiClient.getMusicAnalysis();
      if (response.success && response.data) {
        set({
          currentAnalysis: response.data,
          loading: { isLoading: false },
        });
      } else {
        throw new Error(response.error?.message || 'Failed to load analysis');
      }
    } catch (error) {
      set({
        loading: { isLoading: false },
        error: {
          hasError: true,
          error: error as Error,
          timestamp: new Date(),
        },
      });
    }
  },

  clearAnalysis: () => {
    set({ currentAnalysis: null, error: { hasError: false } });
  },

  setLoading: (loading: LoadingState) => {
    set({ loading });
  },

  clearError: () => {
    set({ error: { hasError: false } });
  },
}));

// Personality prediction store
interface PersonalityStore {
  // State
  currentPrediction: any | null;
  predictionHistory: any[];
  questionnaire: any | null;
  loading: LoadingState;
  error: ErrorState;

  // Actions
  submitQuestionnaire: (data: any) => Promise<void>;
  getPrediction: (questionnaireId?: string) => Promise<void>;
  getAllPredictions: () => Promise<void>;
  clearPrediction: () => void;
  setLoading: (loading: LoadingState) => void;
  clearError: () => void;
}

export const usePersonalityStore = create<PersonalityStore>((set, get) => ({
  // Initial state
  currentPrediction: null,
  predictionHistory: [],
  questionnaire: null,
  loading: { isLoading: false },
  error: { hasError: false },

  // Actions
  submitQuestionnaire: async (data: any) => {
    try {
      set({ 
        loading: { isLoading: true, message: 'Submitting questionnaire...' },
        error: { hasError: false }
      });

      const response = await apiClient.submitPersonalityQuestionnaire(data);
      if (response.success && response.data) {
        set({
          questionnaire: { ...data, id: response.data.questionnaire_id },
          loading: { isLoading: false },
        });
        
        // Automatically get the prediction
        await get().getPrediction(response.data.questionnaire_id);
      } else {
        throw new Error(response.error?.message || 'Failed to submit questionnaire');
      }
    } catch (error) {
      set({
        loading: { isLoading: false },
        error: {
          hasError: true,
          error: error as Error,
          timestamp: new Date(),
        },
      });
    }
  },

  getPrediction: async (questionnaireId?: string) => {
    try {
      set({ 
        loading: { isLoading: true, message: 'Generating personality prediction...' },
        error: { hasError: false }
      });
      
      const response = await apiClient.getPersonalityPrediction(questionnaireId);
      if (response.success && response.data) {
        set({
          currentPrediction: response.data,
          loading: { isLoading: false },
        });
      } else {
        throw new Error(response.error?.message || 'Failed to get prediction');
      }
    } catch (error) {
      set({
        loading: { isLoading: false },
        error: {
          hasError: true,
          error: error as Error,
          timestamp: new Date(),
        },
      });
    }
  },

  getAllPredictions: async () => {
    try {
      set({ loading: { isLoading: true, message: 'Loading prediction history...' } });
      
      const response = await apiClient.getAllPersonalityPredictions();
      if (response.success && response.data) {
        set({
          predictionHistory: response.data,
          loading: { isLoading: false },
        });
      } else {
        throw new Error(response.error?.message || 'Failed to load predictions');
      }
    } catch (error) {
      set({
        loading: { isLoading: false },
        error: {
          hasError: true,
          error: error as Error,
          timestamp: new Date(),
        },
      });
    }
  },

  clearPrediction: () => {
    set({ currentPrediction: null, error: { hasError: false } });
  },

  setLoading: (loading: LoadingState) => {
    set({ loading });
  },

  clearError: () => {
    set({ error: { hasError: false } });
  },
}));
