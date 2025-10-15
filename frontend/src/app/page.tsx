'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatWidget } from '../components/ChatWidget';
import { demoUserProfile, isDemoMode, simulateApiDelay } from '../data/demo-data';

interface SpotifyUser {
  display_name?: string;
  user_id: string;
  email?: string;
  followers?: number;
  profile_image?: string;
}

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      // If in demo mode, use demo user
      if (isDemoMode()) {
        setUser(demoUserProfile);
        localStorage.setItem('spotifyUser', JSON.stringify(demoUserProfile));
        return;
      }

      const userId = localStorage.getItem('spotify_user_id');
      const token = localStorage.getItem('spotify_access_token');
      
      if (userId && token) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003';
          const response = await fetch(`${apiUrl}/api/user/profile?user_id=${userId}`);
          if (response.ok) {
            const data = await response.json();
            setUser(data.profile);
            // Also store for the data page
            localStorage.setItem('spotifyUser', JSON.stringify(data.profile));
          } else {
            // Clear invalid tokens
            localStorage.removeItem('spotify_user_id');
            localStorage.removeItem('spotify_access_token');
            localStorage.removeItem('spotifyUser');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      }
    };

    checkAuth();
  }, []);

  const handleSpotifyLogin = async () => {
    console.log('🎵 Spotify login button clicked');
    setIsLoading(true);
    
    // If in demo mode, simulate login
    if (isDemoMode()) {
      await simulateApiDelay(1500);
      setUser(demoUserProfile);
      localStorage.setItem('spotifyUser', JSON.stringify(demoUserProfile));
      setIsLoading(false);
      return;
    }
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8003';
      console.log('📡 Making request to:', `${apiUrl}/api/auth/spotify/login`);
      
      const response = await fetch(`${apiUrl}/api/auth/spotify/login`);
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📡 Response data:', data);
      
      if (data.auth_url) {
        console.log('🔗 Auth URL received:', data.auth_url);
        // Store state for verification
        localStorage.setItem('spotify_auth_state', data.state);
        console.log('💾 Stored state:', data.state);
        console.log('🚀 Redirecting to Spotify...');
        
        // Redirect to Spotify authorization
        window.location.href = data.auth_url;
      } else {
        console.error('❌ No auth_url in response:', data);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const userId = localStorage.getItem('spotify_user_id');
    if (userId) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003';
        await fetch(`${apiUrl}/api/auth/logout?user_id=${userId}`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
    
    // Clear local storage
    localStorage.removeItem('spotify_user_id');
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_auth_state');
    localStorage.removeItem('spotifyUser');
    setUser(null);
  };

  const testSpotifyData = () => {
    console.log('View Data button clicked');
    const userProfile = localStorage.getItem('spotifyUser');
    const userId = localStorage.getItem('spotify_user_id');
    console.log('User profile in localStorage:', userProfile);
    console.log('User ID:', userId);
    
    if (!userProfile || !userId) {
      alert('User data not found. Please reconnect to Spotify.');
      return;
    }
    
    router.push('/data');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          {isDemoMode() && (
            <div className="mb-6 inline-flex items-center px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-sm">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Demo Mode - Try it out with sample data!
            </div>
          )}
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v9.28l-3.64-3.64L7 10l5 5 5-5-1.36-1.36L12 12.28V3z"/>
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2s-.9-2-2-2H8c-1.1 0-2 .9-2 2z"/>
              </svg>
            </div>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-6">
            Music & You
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            {isDemoMode() 
              ? "Experience personality analysis through music with our interactive demo. See how your musical taste reveals insights about your personality traits."
              : "Discover your personality through your music taste. Connect your Spotify account to get insights about yourself based on your listening habits."
            }
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {!user ? (
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/10">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Get Started
              </h2>
              <p className="text-slate-300 mb-8">
                Connect your Spotify account to analyze your music personality
              </p>
              
              <button
                onClick={handleSpotifyLogin}
                disabled={isLoading}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 inline-flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Redirecting to Spotify...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.9 10.9C14.7 9 9.35 8.8 6.3 9.75c-.5.15-1-.15-1.15-.6-.15-.5.15-1 .6-1.15 3.55-1.05 9.4-.85 13.1 1.35.45.25.6.85.35 1.3-.25.35-.85.5-1.3.25zm-.1 2.8c-.25.35-.7.5-1.05.25-2.7-1.65-6.8-2.15-9.95-1.15-.4.1-.85-.1-.95-.5-.1-.4.1-.85.5-.95 3.65-1.1 8.15-.55 11.25 1.35.3.15.45.65.2 1zm-1.2 2.75c-.2.3-.55.4-.85.2-2.35-1.45-5.3-1.75-8.8-.95-.35.1-.65-.15-.75-.45-.1-.35.15-.65.45-.75 3.8-.85 7.1-.5 9.7 1.1.35.15.4.55.25.85z"/>
                    </svg>
                    Connect with Spotify
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Welcome, {user.display_name || user.user_id}!
                </h2>
                <p className="text-slate-300">
                  Your Spotify account is connected
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zM11 7h2v6h-2V7zm0 8h2v2h-2v-2z"/>
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Listening History</h3>
                  <p className="text-slate-300 text-sm mb-4">View your recent tracks</p>
                  <button
                    onClick={testSpotifyData}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-xl transition-all duration-300"
                  >
                    View Data
                  </button>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Personality Analysis</h3>
                  <p className="text-slate-300 text-sm mb-4">Get insights about yourself</p>
                  <button
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-xl transition-all duration-300"
                    onClick={() => router.push('/analyze')}
                  >
                    Analyze
                  </button>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Recommendations</h3>
                  <p className="text-slate-300 text-sm mb-4">Discover new music</p>
                  <button
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-4 py-2 rounded-xl transition-all duration-300"
                    onClick={() => alert('Recommendations coming soon!')}
                  >
                    Discover
                  </button>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleLogout}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-xl transition-all duration-300"
                >
                  Disconnect Spotify
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Personalized Insights</h3>
              <p className="text-slate-300">
                Get detailed analysis of your personality traits based on your music preferences
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zM11 7h2v6h-2V7zm0 8h2v2h-2v-2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Data-Driven</h3>
              <p className="text-slate-300">
                Our analysis is based on scientific research linking music preferences to personality
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Privacy First</h3>
              <p className="text-slate-300">
                Your data is processed securely and never shared without your permission
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Widget - always available */}
      <ChatWidget context="home" />
    </div>
  );
}
