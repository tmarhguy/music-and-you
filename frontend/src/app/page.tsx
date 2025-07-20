'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
      const userId = localStorage.getItem('spotify_user_id');
      const token = localStorage.getItem('spotify_access_token');
      
      if (userId && token) {
        try {
          const response = await fetch(`http://localhost:8000/api/user/profile?user_id=${userId}`);
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
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/auth/spotify/login');
      const data = await response.json();
      
      if (data.auth_url) {
        // Store state for verification
        localStorage.setItem('spotify_auth_state', data.state);
        // Redirect to Spotify authorization
        window.location.href = data.auth_url;
      }
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const userId = localStorage.getItem('spotify_user_id');
    if (userId) {
      try {
        await fetch(`http://localhost:8000/api/auth/logout?user_id=${userId}`, {
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            Music & You
          </h1>
          <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
            Discover your personality through your music taste. Connect your Spotify account 
            to get insights about yourself based on your listening habits.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {!user ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center">
              <div className="text-6xl mb-6">🎵</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Get Started
              </h2>
              <p className="text-purple-200 mb-8">
                Connect your Spotify account to analyze your music personality
              </p>
              <button
                onClick={handleSpotifyLogin}
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-bold py-4 px-8 rounded-full text-lg transition-colors duration-200 inline-flex items-center gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    🎧 Connect to Spotify
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                  ✓
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Welcome, {user.display_name || user.user_id}!
                </h2>
                <p className="text-purple-200">
                  Your Spotify account is connected
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/5 rounded-xl p-6 text-center">
                  <div className="text-3xl mb-3">📊</div>
                  <h3 className="text-white font-semibold mb-2">Listening History</h3>
                  <p className="text-purple-200 text-sm mb-4">View your recent tracks</p>
                  <button
                    onClick={testSpotifyData}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    View Data
                  </button>
                </div>

                <div className="bg-white/5 rounded-xl p-6 text-center">
                  <div className="text-3xl mb-3">🧠</div>
                  <h3 className="text-white font-semibold mb-2">Personality Analysis</h3>
                  <p className="text-purple-200 text-sm mb-4">Get insights about yourself</p>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    onClick={() => router.push('/analyze')}
                  >
                    Analyze
                  </button>
                </div>

                <div className="bg-white/5 rounded-xl p-6 text-center">
                  <div className="text-3xl mb-3">🎶</div>
                  <h3 className="text-white font-semibold mb-2">Recommendations</h3>
                  <p className="text-purple-200 text-sm mb-4">Discover new music</p>
                  <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                    onClick={() => alert('Recommendations coming soon!')}
                  >
                    Discover
                  </button>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Disconnect Spotify
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-2">Personalized Insights</h3>
              <p className="text-purple-200">
                Get detailed analysis of your personality traits based on your music preferences
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold text-white mb-2">Data-Driven</h3>
              <p className="text-purple-200">
                Our analysis is based on scientific research linking music preferences to personality
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-white mb-2">Privacy First</h3>
              <p className="text-purple-200">
                Your data is processed securely and never shared without your permission
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
