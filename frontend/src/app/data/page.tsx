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

      // Fetch recent tracks
      const recentResponse = await fetch(`http://localhost:8000/api/user/listening-history?user_id=${userId}&limit=50`);
      if (recentResponse.ok) {
        const recentData = await recentResponse.json();
        setRecentTracks(recentData.tracks || []);
      }

      // Fetch top tracks
      const topTracksResponse = await fetch(`http://localhost:8000/api/user/top-tracks?user_id=${userId}&time_range=${timeRange}&limit=50`);
      if (topTracksResponse.ok) {
        const topTracksData = await topTracksResponse.json();
        setTopTracks(topTracksData.tracks || []);
      }

      // Fetch top artists
      const topArtistsResponse = await fetch(`http://localhost:8000/api/user/top-artists?user_id=${userId}&time_range=${timeRange}&limit=20`);
      if (topArtistsResponse.ok) {
        const topArtistsData = await topArtistsResponse.json();
        setTopArtists(topArtistsData.artists || []);
      }

      // Fetch liked songs (ALL of them)
      const likedSongsResponse = await fetch(`http://localhost:8000/api/user/liked-songs?user_id=${userId}`);
      if (likedSongsResponse.ok) {
        const likedSongsData = await likedSongsResponse.json();
        setLikedSongs(likedSongsData.tracks || []);
        setLikedSongsTotal(likedSongsData.total || 0);
      }

      // Fetch audio features for top tracks
      if (topTracks.length > 0) {
        const trackIds = topTracks.slice(0, 10).map(track => track.track_id).join(',');
        const audioFeaturesResponse = await fetch(`http://localhost:8000/api/user/audio-features?user_id=${userId}&track_ids=${trackIds}`);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your music data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Music Data</h1>
              <p className="text-gray-600 mt-1">Explore your listening habits and preferences</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
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
                className={`px-4 py-2 rounded-lg font-medium ${
                  timeRange === range
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {getTimeRangeLabel(range)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
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
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {/* Recent Tracks */}
          {activeTab === 'recent' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Tracks</h2>
              {recentTracks.length === 0 ? (
                <p className="text-gray-500">No recent tracks found.</p>
              ) : (
                <div className="space-y-4">
                  {recentTracks.slice(0, 20).map((track, index) => (
                    <div key={`${track.track_id}-${index}`} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-medium text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium text-gray-900">{track.track_name}</h3>
                        <p className="text-gray-600 text-sm">{track.artist_name}</p>
                        <p className="text-gray-500 text-xs">{track.album_name}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        {track.duration_ms && (
                          <p className="text-gray-500 text-sm">{formatDuration(track.duration_ms)}</p>
                        )}
                        {track.played_at && (
                          <p className="text-gray-400 text-xs">
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
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Liked Songs 
                {likedSongsTotal > 0 && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({likedSongsTotal.toLocaleString()} total)
                  </span>
                )}
              </h2>
              {likedSongs.length === 0 ? (
                <p className="text-gray-500">No liked songs found.</p>
              ) : (
                <div className="space-y-4">
                  {likedSongs.map((track, index) => (
                    <div key={`${track.track_id}-${index}`} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-medium text-sm">❤️</span>
                      </div>
                      {track.album_image && (
                        <div className="flex-shrink-0">
                          <img 
                            src={track.album_image} 
                            alt={track.album_name}
                            className="w-12 h-12 rounded-md object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-grow">
                        <h3 className="font-medium text-gray-900">{track.track_name}</h3>
                        <p className="text-gray-600 text-sm">{track.artist_name}</p>
                        <p className="text-gray-500 text-xs">{track.album_name}</p>
                        {track.explicit && (
                          <span className="inline-block bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded mt-1">
                            Explicit
                          </span>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        {track.duration_ms && (
                          <p className="text-gray-500 text-sm">{formatDuration(track.duration_ms)}</p>
                        )}
                        {track.added_at && (
                          <p className="text-gray-400 text-xs">
                            Added {new Date(track.added_at).toLocaleDateString()}
                          </p>
                        )}
                        {track.popularity && (
                          <p className="text-gray-400 text-xs">Popularity: {track.popularity}</p>
                        )}
                        {track.external_urls && (
                          <a 
                            href={track.external_urls} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-700 text-xs"
                          >
                            Open in Spotify
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="text-center pt-4">
                    <p className="text-gray-500 text-sm">
                      {likedSongs.length === likedSongsTotal ? (
                        `All ${likedSongsTotal.toLocaleString()} liked songs loaded 🎵`
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
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Top Tracks - {getTimeRangeLabel(timeRange)}</h2>
              {topTracks.length === 0 ? (
                <p className="text-gray-500">No top tracks found for this time period.</p>
              ) : (
                <div className="space-y-4">
                  {topTracks.slice(0, 20).map((track, index) => (
                    <div key={`${track.track_id}-${index}`} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium text-gray-900">{track.track_name}</h3>
                        <p className="text-gray-600 text-sm">{track.artist_name}</p>
                        <p className="text-gray-500 text-xs">{track.album_name}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        {track.duration_ms && (
                          <p className="text-gray-500 text-sm">{formatDuration(track.duration_ms)}</p>
                        )}
                        {track.popularity && (
                          <p className="text-gray-400 text-xs">Popularity: {track.popularity}</p>
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
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Top Artists - {getTimeRangeLabel(timeRange)}</h2>
              {topArtists.length === 0 ? (
                <p className="text-gray-500">No top artists found for this time period.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topArtists.slice(0, 16).map((artist, index) => (
                    <div key={`${artist.artist_id}-${index}`} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-medium text-sm">{index + 1}</span>
                        </div>
                        <h3 className="font-medium text-gray-900">{artist.artist_name}</h3>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-600 text-sm">Popularity: {artist.popularity}</p>
                        <p className="text-gray-600 text-sm">Followers: {artist.followers?.toLocaleString()}</p>
                        {artist.genres && artist.genres.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {artist.genres.slice(0, 3).map((genre, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
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
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Audio Features Analysis</h2>
              {audioFeatures.length === 0 ? (
                <p className="text-gray-500">No audio features data available.</p>
              ) : (
                <div className="space-y-6">
                  {/* Average Features */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Average Audio Features</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { key: 'danceability', label: 'Danceability', color: 'bg-green-500' },
                        { key: 'energy', label: 'Energy', color: 'bg-red-500' },
                        { key: 'valence', label: 'Positivity', color: 'bg-yellow-500' },
                        { key: 'acousticness', label: 'Acoustic', color: 'bg-blue-500' },
                      ].map((feature) => {
                        const avgValue = audioFeatures.reduce((sum, track) => 
                          sum + (track[feature.key as keyof AudioFeature] as number), 0) / audioFeatures.length;
                        return (
                          <div key={feature.key} className="text-center">
                            <div className="mb-2">
                              <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                                <div className={`w-12 h-12 ${feature.color} rounded-full flex items-center justify-center`}>
                                  <span className="text-white font-semibold text-sm">
                                    {Math.round(avgValue * 100)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm font-medium">{feature.label}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Individual Track Features */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Individual Track Features</h3>
                    <div className="space-y-3">
                      {audioFeatures.slice(0, 10).map((track, index) => {
                        const matchingTrack = topTracks.find(t => t.track_id === track.track_id);
                        return (
                          <div key={track.track_id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {matchingTrack?.track_name || `Track ${index + 1}`}
                                </h4>
                                {matchingTrack && (
                                  <p className="text-gray-600 text-sm">{matchingTrack.artist_name}</p>
                                )}
                              </div>
                              <div className="text-gray-500 text-sm">
                                Tempo: {Math.round(track.tempo)} BPM
                              </div>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-xs">
                              <div>Dance: {Math.round(track.danceability * 100)}%</div>
                              <div>Energy: {Math.round(track.energy * 100)}%</div>
                              <div>Happy: {Math.round(track.valence * 100)}%</div>
                              <div>Acoustic: {Math.round(track.acousticness * 100)}%</div>
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
