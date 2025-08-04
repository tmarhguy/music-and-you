'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Track {
  track_id: string;
  track_name: string;
  artist_name: string;
  album_name: string;
  played_at?: string;
  duration_ms?: number;
  popularity?: number;
  added_at?: string;
  preview_url?: string;
  external_urls?: string;
  explicit?: boolean;
  album_image?: string;
}

interface Artist {
  artist_id: string;
  artist_name: string;
  genres: string[];
  popularity: number;
  followers: number;
}

interface AudioFeature {
  track_id: string;
  danceability: number;
  energy: number;
  valence: number;
  acousticness: number;
  instrumentalness: number;
  speechiness: number;
  tempo: number;
}

export default function DataPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('recent');
  
  // Data states
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [audioFeatures, setAudioFeatures] = useState<AudioFeature[]>([]);
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const [likedSongsTotal, setLikedSongsTotal] = useState(0);
  
  const [timeRange, setTimeRange] = useState('medium_term'); // short_term, medium_term, long_term

  useEffect(() => {
    const userProfile = localStorage.getItem('spotifyUser');
    if (!userProfile) {
      router.push('/');
      return;
    }

    fetchUserData();
  }, [timeRange]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userProfile = JSON.parse(localStorage.getItem('spotifyUser') || '{}');
      const userId = userProfile.user_id;
      
      if (!userId) {
        throw new Error('User ID not found');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8003';

      // Fetch recent tracks
      const recentResponse = await fetch(`${apiUrl}/api/user/listening-history?user_id=${userId}&limit=50`);
      if (recentResponse.ok) {
        const recentData = await recentResponse.json();
        setRecentTracks(recentData.tracks || []);
      }

      // Fetch top tracks
      const topTracksResponse = await fetch(`${apiUrl}/api/user/top-tracks?user_id=${userId}&time_range=${timeRange}&limit=50`);
      if (topTracksResponse.ok) {
        const topTracksData = await topTracksResponse.json();
        setTopTracks(topTracksData.tracks || []);
      }

      // Fetch top artists
      const topArtistsResponse = await fetch(`${apiUrl}/api/user/top-artists?user_id=${userId}&time_range=${timeRange}&limit=20`);
      if (topArtistsResponse.ok) {
        const topArtistsData = await topArtistsResponse.json();
        setTopArtists(topArtistsData.artists || []);
      }

      // Fetch liked songs (ALL of them)
      const likedSongsResponse = await fetch(`${apiUrl}/api/user/liked-songs?user_id=${userId}`);
      if (likedSongsResponse.ok) {
        const likedSongsData = await likedSongsResponse.json();
        setLikedSongs(likedSongsData.tracks || []);
        setLikedSongsTotal(likedSongsData.total || 0);
      }

      // Fetch audio features for top tracks
      if (topTracks.length > 0) {
        const trackIds = topTracks.slice(0, 10).map(track => track.track_id).join(',');
        const audioFeaturesResponse = await fetch(`${apiUrl}/api/user/audio-features?user_id=${userId}&track_ids=${trackIds}`);
        if (audioFeaturesResponse.ok) {
          const audioFeaturesData = await audioFeaturesResponse.json();
          setAudioFeatures(audioFeaturesData.audio_features || []);
        }
      }

    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case 'short_term': return 'Last 4 weeks';
      case 'medium_term': return 'Last 6 months';
      case 'long_term': return 'All time';
      default: return 'Last 6 months';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <p className="text-slate-300">Loading your music data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
          </div>
          <p className="text-slate-300 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-6 py-2 rounded-xl transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Your Music Data</h1>
              <p className="text-slate-300 mt-1">Explore your listening habits and preferences</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="bg-white/10 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Time Range Selector */}
        <div className="mb-8">
          <div className="flex space-x-4">
            {['short_term', 'medium_term', 'long_term'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20 backdrop-blur-sm'
                }`}
              >
                {getTimeRangeLabel(range)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-white/20">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'recent', label: 'Recent Tracks', count: recentTracks.length },
                { id: 'liked-songs', label: 'Liked Songs', count: likedSongs.length },
                { id: 'top-tracks', label: 'Top Tracks', count: topTracks.length },
                { id: 'top-artists', label: 'Top Artists', count: topArtists.length },
                { id: 'audio-features', label: 'Audio Features', count: audioFeatures.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'border-emerald-400 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10">
          {/* Recent Tracks */}
          {activeTab === 'recent' && (
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Recent Tracks</h2>
              {recentTracks.length === 0 ? (
                <p className="text-slate-400">No recent tracks found.</p>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(recentTracks) && recentTracks.slice(0, 20).map((track, index) => (
                    <div key={`${track.track_id}-${index}`} className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium text-white">{track.track_name}</h3>
                        <p className="text-slate-300 text-sm">{track.artist_name}</p>
                        <p className="text-slate-400 text-xs">{track.album_name}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        {track.duration_ms && (
                          <p className="text-slate-400 text-sm">{formatDuration(track.duration_ms)}</p>
                        )}
                        {track.played_at && (
                          <p className="text-slate-500 text-xs">
                            {new Date(track.played_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Liked Songs */}
          {activeTab === 'liked-songs' && (
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">
                Liked Songs 
                {likedSongsTotal > 0 && (
                  <span className="text-sm font-normal text-slate-400 ml-2">
                    ({likedSongsTotal.toLocaleString()} total)
                  </span>
                )}
              </h2>
              {likedSongs.length === 0 ? (
                <p className="text-slate-400">No liked songs found.</p>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(likedSongs) && likedSongs.map((track, index) => (
                    <div key={`${track.track_id}-${index}`} className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      </div>
                      {track.album_image && (
                        <div className="flex-shrink-0">
                          <img 
                            src={track.album_image} 
                            alt={track.album_name}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-grow">
                        <h3 className="font-medium text-white">{track.track_name}</h3>
                        <p className="text-slate-300 text-sm">{track.artist_name}</p>
                        <p className="text-slate-400 text-xs">{track.album_name}</p>
                        {track.explicit && (
                          <span className="inline-block bg-slate-600 text-slate-300 text-xs px-2 py-1 rounded mt-1">
                            Explicit
                          </span>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        {track.duration_ms && (
                          <p className="text-slate-400 text-sm">{formatDuration(track.duration_ms)}</p>
                        )}
                        {track.added_at && (
                          <p className="text-slate-500 text-xs">
                            Added {new Date(track.added_at).toLocaleDateString()}
                          </p>
                        )}
                        {track.popularity && (
                          <p className="text-slate-500 text-xs">Popularity: {track.popularity}</p>
                        )}
                        {track.external_urls && (
                          <a 
                            href={track.external_urls} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 text-xs transition-colors duration-300"
                          >
                            Open in Spotify
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="text-center pt-4">
                    <p className="text-slate-400 text-sm">
                      {likedSongs.length === likedSongsTotal ? (
                        `All ${likedSongsTotal.toLocaleString()} liked songs loaded`
                      ) : (
                        `Showing ${likedSongs.length} of ${likedSongsTotal.toLocaleString()} liked songs`
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Top Tracks */}
          {activeTab === 'top-tracks' && (
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Top Tracks - {getTimeRangeLabel(timeRange)}</h2>
              {topTracks.length === 0 ? (
                <p className="text-slate-400">No top tracks found for this time period.</p>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(topTracks) && topTracks.slice(0, 20).map((track, index) => (
                    <div key={`${track.track_id}-${index}`} className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium text-white">{track.track_name}</h3>
                        <p className="text-slate-300 text-sm">{track.artist_name}</p>
                        <p className="text-slate-400 text-xs">{track.album_name}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        {track.duration_ms && (
                          <p className="text-slate-400 text-sm">{formatDuration(track.duration_ms)}</p>
                        )}
                        {track.popularity && (
                          <p className="text-slate-500 text-xs">Popularity: {track.popularity}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Top Artists */}
          {activeTab === 'top-artists' && (
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Top Artists - {getTimeRangeLabel(timeRange)}</h2>
              {topArtists.length === 0 ? (
                <p className="text-slate-400">No top artists found for this time period.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.isArray(topArtists) && topArtists.slice(0, 16).map((artist, index) => (
                    <div key={`${artist.artist_id}-${index}`} className="p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">{index + 1}</span>
                        </div>
                        <h3 className="font-medium text-white">{artist.artist_name}</h3>
                      </div>
                      <div className="space-y-2">
                        <p className="text-slate-300 text-sm">Popularity: {artist.popularity}</p>
                        <p className="text-slate-300 text-sm">Followers: {artist.followers?.toLocaleString()}</p>
                        {artist.genres && Array.isArray(artist.genres) && artist.genres.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {artist.genres.slice(0, 3).map((genre, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Audio Features */}
          {activeTab === 'audio-features' && (
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Audio Features Analysis</h2>
              {audioFeatures.length === 0 ? (
                <p className="text-slate-400">No audio features data available.</p>
              ) : (
                <div className="space-y-8">
                  {/* Average Features */}
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <h3 className="font-medium text-white mb-6">Average Audio Features</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        { key: 'danceability', label: 'Danceability', gradient: 'from-emerald-500 to-cyan-500' },
                        { key: 'energy', label: 'Energy', gradient: 'from-red-500 to-pink-500' },
                        { key: 'valence', label: 'Positivity', gradient: 'from-yellow-500 to-orange-500' },
                        { key: 'acousticness', label: 'Acoustic', gradient: 'from-blue-500 to-purple-500' },
                      ].map((feature) => {
                        const avgValue = audioFeatures.reduce((sum, track) => 
                          sum + (track[feature.key as keyof AudioFeature] as number), 0) / audioFeatures.length;
                        return (
                          <div key={feature.key} className="text-center">
                            <div className="mb-3">
                              <div className="w-20 h-20 mx-auto bg-white/10 rounded-2xl flex items-center justify-center">
                                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center`}>
                                  <span className="text-white font-bold text-sm">
                                    {Math.round(avgValue * 100)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-slate-300 text-sm font-medium">{feature.label}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Individual Track Features */}
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <h3 className="font-medium text-white mb-6">Individual Track Features</h3>
                    <div className="space-y-4">
                      {Array.isArray(audioFeatures) && audioFeatures.slice(0, 10).map((track, index) => {
                        const matchingTrack = topTracks.find(t => t.track_id === track.track_id);
                        return (
                          <div key={track.track_id} className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-white">
                                  {matchingTrack?.track_name || `Track ${index + 1}`}
                                </h4>
                                {matchingTrack && (
                                  <p className="text-slate-300 text-sm">{matchingTrack.artist_name}</p>
                                )}
                              </div>
                              <div className="text-slate-400 text-sm font-medium">
                                Tempo: {Math.round(track.tempo)} BPM
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/30">
                                <div className="text-emerald-300 text-xs font-medium">Dance</div>
                                <div className="text-white font-semibold">{Math.round(track.danceability * 100)}%</div>
                              </div>
                              <div className="bg-red-500/20 p-2 rounded-lg border border-red-500/30">
                                <div className="text-red-300 text-xs font-medium">Energy</div>
                                <div className="text-white font-semibold">{Math.round(track.energy * 100)}%</div>
                              </div>
                              <div className="bg-yellow-500/20 p-2 rounded-lg border border-yellow-500/30">
                                <div className="text-yellow-300 text-xs font-medium">Happy</div>
                                <div className="text-white font-semibold">{Math.round(track.valence * 100)}%</div>
                              </div>
                              <div className="bg-blue-500/20 p-2 rounded-lg border border-blue-500/30">
                                <div className="text-blue-300 text-xs font-medium">Acoustic</div>
                                <div className="text-white font-semibold">{Math.round(track.acousticness * 100)}%</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
