'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PersonalityRadarChart } from '../../components/PersonalityRadarChart';
import { AudioDNAChart } from '../../components/AudioDNAChart';
import { ShareablePersonalityCard } from '../../components/ShareablePersonalityCard';
import { TraitExplanationCard } from '../../components/TraitExplanationCard';
import { WhatIfSimulator } from '../../components/WhatIfSimulator';

interface PersonalityScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

interface AnalysisResult {
  user_id: string;
  personality_scores: PersonalityScores;
  insights: string[];
  confidence: number;
  data_summary?: {
    total_tracks_analyzed: number;
    audio_features_available: number;
    analysis_features: number;
    feature_categories?: {
      acoustic: number;
      temporal: number;
      behavioral: number;
      advanced: number;
    };
  };
  analysis_timestamp: number;
  model_version?: string;
  status: string;
  // Enhanced data for new features
  persona?: string;
  musical_evidence?: {
    [key: string]: string[];
  };
  audio_features?: {
    valence: number;
    energy: number;
    track_name: string;
    artist_name: string;
  }[];
  genre_influences?: {
    genre: string;
    currentPercentage: number;
    traits: PersonalityScores;
  }[];
}

export default function AnalysisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'simulator' | 'share'>('overview');
  const [simulatedScores, setSimulatedScores] = useState<PersonalityScores | null>(null);

  useEffect(() => {
    const userProfile = localStorage.getItem('spotifyUser');
    if (!userProfile) {
      router.push('/');
      return;
    }
  }, []);

  // Generate enhanced mock data for demo purposes
  const generateEnhancedData = (result: AnalysisResult): AnalysisResult => {
    const personas = [
      'The Eclectic Adventurer',
      'The Mood Curator', 
      'The Genre Explorer',
      'The Rhythm Seeker',
      'The Melodic Dreamer',
      'The Beat Master',
      'The Harmony Hunter',
      'The Sonic Wanderer'
    ];

    const mockAudioFeatures = [
      { valence: 0.8, energy: 0.9, track_name: "Good 4 U", artist_name: "Olivia Rodrigo" },
      { valence: 0.3, energy: 0.4, track_name: "Someone You Loved", artist_name: "Lewis Capaldi" },
      { valence: 0.7, energy: 0.8, track_name: "Levitating", artist_name: "Dua Lipa" },
      { valence: 0.2, energy: 0.2, track_name: "Mad World", artist_name: "Gary Jules" },
      { valence: 0.9, energy: 0.6, track_name: "Sunflower", artist_name: "Post Malone" },
      { valence: 0.5, energy: 0.7, track_name: "Bohemian Rhapsody", artist_name: "Queen" },
      { valence: 0.4, energy: 0.3, track_name: "Hallelujah", artist_name: "Leonard Cohen" },
      { valence: 0.8, energy: 0.5, track_name: "Here Comes the Sun", artist_name: "The Beatles" },
    ];

    const mockGenreInfluences = [
      { genre: "Pop", currentPercentage: 35, traits: { openness: 0.6, conscientiousness: 0.7, extraversion: 0.8, agreeableness: 0.7, neuroticism: 0.4 } },
      { genre: "Rock", currentPercentage: 20, traits: { openness: 0.7, conscientiousness: 0.5, extraversion: 0.7, agreeableness: 0.5, neuroticism: 0.6 } },
      { genre: "Hip Hop", currentPercentage: 15, traits: { openness: 0.6, conscientiousness: 0.6, extraversion: 0.9, agreeableness: 0.5, neuroticism: 0.5 } },
      { genre: "Classical", currentPercentage: 10, traits: { openness: 0.9, conscientiousness: 0.8, extraversion: 0.3, agreeableness: 0.7, neuroticism: 0.3 } },
      { genre: "Jazz", currentPercentage: 8, traits: { openness: 0.95, conscientiousness: 0.7, extraversion: 0.6, agreeableness: 0.8, neuroticism: 0.4 } },
      { genre: "Electronic", currentPercentage: 7, traits: { openness: 0.8, conscientiousness: 0.5, extraversion: 0.8, agreeableness: 0.5, neuroticism: 0.5 } },
      { genre: "Folk", currentPercentage: 5, traits: { openness: 0.8, conscientiousness: 0.6, extraversion: 0.4, agreeableness: 0.9, neuroticism: 0.4 } },
    ];

    const getPersona = (scores: PersonalityScores) => {
      if (scores.openness > 0.7 && scores.extraversion > 0.6) return 'The Eclectic Adventurer';
      if (scores.agreeableness > 0.7) return 'The Harmony Hunter';
      if (scores.conscientiousness > 0.7) return 'The Mood Curator';
      if (scores.extraversion > 0.7) return 'The Beat Master';
      if (scores.openness > 0.6) return 'The Genre Explorer';
      return personas[Math.floor(Math.random() * personas.length)];
    };

    return {
      ...result,
      persona: getPersona(result.personality_scores),
      audio_features: mockAudioFeatures,
      genre_influences: mockGenreInfluences,
      musical_evidence: {
        openness: [
          "You listen to 15+ different genres regularly",
          "42% of your music contains complex musical structures",
          "You discover new artists 3x more than average",
          "Your jazz and classical listening suggests intellectual curiosity"
        ],
        conscientiousness: [
          "You have consistent listening patterns throughout the week",
          "67% of your music has structured, organized compositions",
          "You rarely skip songs once started",
          "Your playlist organization shows methodical preferences"
        ],
        extraversion: [
          "78% of your top tracks are high-energy and danceable",
          "You prefer music with strong, driving beats",
          "Your listening peaks during social hours (6-10 PM)",
          "You gravitate toward celebratory, uplifting themes"
        ],
        agreeableness: [
          "You favor warm, melodic music over aggressive sounds",
          "84% of your tracks have positive emotional valence",
          "You enjoy collaborative and harmony-rich compositions",
          "Your music often features themes of love and connection"
        ],
        neuroticism: [
          "Your music mood varies significantly day-to-day",
          "You use music for emotional regulation during stress",
          "25% of your listening includes melancholic or introspective tracks",
          "You have distinct 'comfort playlists' for difficult emotions"
        ]
      }
    };
  };

  const startAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);
      
      const userProfile = JSON.parse(localStorage.getItem('spotifyUser') || '{}');
      const userId = userProfile.user_id;
      
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8003';
      const response = await fetch(`${apiUrl}/api/analysis/personality`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Analysis failed');
      }

      const result = await response.json();
      const enhancedResult = generateEnhancedData(result);
      setAnalysisResult(enhancedResult);

    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const generateTraitExplanations = () => {
    if (!analysisResult) return [];

    return Object.entries(analysisResult.personality_scores).map(([trait, score]) => {
      const evidence = analysisResult.musical_evidence?.[trait] || [];
      const traitDescriptions: { [key: string]: string } = {
        openness: "Your openness to experience reflects your willingness to explore new musical territories and appreciate complex, unconventional sounds.",
        conscientiousness: "Your conscientiousness shows in your organized listening habits and preference for structured, well-crafted musical compositions.",
        extraversion: "Your extraversion is evident in your preference for energetic, social music that makes you want to move and connect with others.",
        agreeableness: "Your agreeableness manifests in your love for harmonious, warm music that creates positive emotional connections.",
        neuroticism: "Your emotional sensitivity shows through how you use music to navigate and regulate your emotional experiences."
      };

      const keyFactors = [
        { factor: "Genre Diversity", impact: (trait === 'openness' ? 'positive' : 'negative') as 'positive' | 'negative', explanation: "Your variety of musical genres strongly influences this trait" },
        { factor: "Tempo Preference", impact: (trait === 'extraversion' ? 'positive' : 'negative') as 'positive' | 'negative', explanation: "Your preferred song tempos correlate with this personality aspect" },
        { factor: "Listening Consistency", impact: (trait === 'conscientiousness' ? 'positive' : 'negative') as 'positive' | 'negative', explanation: "Your regular listening patterns reflect this trait" },
      ];

      return {
        trait,
        score,
        description: traitDescriptions[trait] || "This trait reflects specific aspects of your musical personality.",
        musicalEvidence: evidence,
        topGenres: analysisResult.genre_influences?.slice(0, 3).map(g => g.genre) || [],
        topArtists: ["Artist 1", "Artist 2", "Artist 3"], // Would come from real data
        keyFactors: keyFactors.slice(0, 2)
      };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/5 border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Personality Analysis</h1>
              <p className="text-slate-300 mt-1">Discover your personality through your music taste</p>
            </div>
                        <button
              onClick={() => router.push('/')}
              className="bg-white/10 text-white px-6 py-2 rounded-xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/20"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Start Analysis Section */}
        {!analysisResult && !loading && (
          <div className="bg-white/5 rounded-2xl border border-white/10 p-8 text-center backdrop-blur-sm">
            <div className="text-6xl mb-6">
              <svg className="w-16 h-16 mx-auto text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Discover Your Musical Personality?
            </h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Our advanced analysis will examine your music listening patterns, preferences, and behaviors 
              to predict your Big Five personality traits. This analysis is based on scientific research 
              linking music preferences to personality characteristics.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              {['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'].map((trait, index) => (
                <div key={trait} className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="text-2xl mb-2">
                    <svg className="w-8 h-8 mx-auto text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h3 className="font-medium text-white text-sm">{trait}</h3>
                </div>
              ))}
            </div>
            <button
              onClick={startAnalysis}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 shadow-lg shadow-purple-500/25"
            >
              <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
              Start Analysis
            </button>
          </div>
        )}

        {/* Loading Section */}
        {loading && (
          <div className="bg-white/5 rounded-2xl border border-white/10 p-8 text-center backdrop-blur-sm">
            <div className="text-6xl mb-6">
              <svg className="w-16 h-16 mx-auto text-purple-400 animate-spin" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Analyzing Your Musical Personality...
            </h2>
            <div className="max-w-md mx-auto mb-6">
              <div className="bg-white/10 rounded-full h-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-slate-300 mt-2">{progress}% complete</p>
            </div>
            <div className="space-y-2 text-slate-300">
              <p>Analyzing your music library...</p>
              <p>Processing audio features...</p>
              <p>Computing personality insights...</p>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Start Analysis Section */}
        {!analysisResult && !loading && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">🧠</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Discover Your Musical Personality?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Our advanced analysis will examine your music listening patterns, preferences, and behaviors 
              to predict your Big Five personality traits. This analysis is based on scientific research 
              linking music preferences to personality characteristics.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              {['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'].map((trait, index) => (
                <div key={trait} className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl mb-2">
                    {['🎨', '📋', '🎉', '🤝', '🌊'][index]}
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm">{trait}</h3>
                </div>
              ))}
            </div>
            <button
              onClick={startAnalysis}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
            >
              🎵 Start Analysis
            </button>
          </div>
        )}

        {/* Loading Section */}
        {loading && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Analyzing Your Musical Personality...
            </h2>
            <div className="max-w-md mx-auto mb-6">
              <div className="bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-gray-600 mt-2">{Math.round(progress)}% Complete</p>
            </div>
            <div className="text-gray-600 space-y-2">
              {progress < 30 && <p>📊 Collecting your music data...</p>}
              {progress >= 30 && progress < 60 && <p>🎵 Analyzing audio features...</p>}
              {progress >= 60 && progress < 90 && <p>🧠 Processing personality indicators...</p>}
              {progress >= 90 && <p>✨ Finalizing your results...</p>}
            </div>
          </div>
        )}

        {/* Error Section */}
        {error && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Analysis Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-x-4">
              <button
                onClick={startAnalysis}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/')}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Results Section */}
        {analysisResult && (
          <div className="space-y-8">
            {/* Header with Persona */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">
                {analysisResult.persona === 'The Eclectic Adventurer' ? '🎭' :
                 analysisResult.persona === 'The Mood Curator' ? '🌈' :
                 analysisResult.persona === 'The Genre Explorer' ? '🗺️' :
                 analysisResult.persona === 'The Beat Master' ? '🔥' : '🎧'}
              </div>
              <h1 className="text-3xl font-bold mb-2">
                You are {analysisResult.persona || 'The Musical Explorer'}!
              </h1>
              <p className="text-xl opacity-90 mb-4">
                Your unique musical personality revealed through AI analysis
              </p>
              <div className="flex justify-center items-center space-x-6 text-sm">
                <div>
                  <span className="opacity-75">Analysis Confidence:</span>
                  <span className="ml-1 font-bold">{Math.round(analysisResult.confidence * 100)}%</span>
                </div>
                <div>
                  <span className="opacity-75">Tracks Analyzed:</span>
                  <span className="ml-1 font-bold">{analysisResult.data_summary?.total_tracks_analyzed || 'N/A'}</span>
                </div>
                <div>
                  <span className="opacity-75">Features Extracted:</span>
                  <span className="ml-1 font-bold">{analysisResult.data_summary?.analysis_features || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {[
                    { id: 'overview', name: 'Overview', icon: '📊' },
                    { id: 'details', name: 'Detailed Analysis', icon: '🔍' },
                    { id: 'simulator', name: 'What-If Simulator', icon: '🔮' },
                    { id: 'share', name: 'Share Results', icon: '📤' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`${
                        activeTab === tab.id
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Your Personality Profile</h3>
                        <PersonalityRadarChart scores={simulatedScores || analysisResult.personality_scores} />
                        {simulatedScores && (
                          <p className="text-sm text-blue-600 mt-2">
                            🔮 Showing simulated results - switch to other tabs to see original
                          </p>
                        )}
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-3">Key Insights:</h4>
                        <ul className="space-y-2">
                          {analysisResult.insights.slice(0, 4).map((insight, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-purple-600 mt-1">•</span>
                              <span className="text-gray-700 text-sm">{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Audio DNA Chart */}
                      {analysisResult.audio_features && (
                        <AudioDNAChart audioFeatures={analysisResult.audio_features} />
                      )}

                      {/* Quick Stats */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-3">Your Musical DNA:</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Highest Trait:</span>
                            <div className="font-medium">
                              {Object.entries(analysisResult.personality_scores)
                                .sort(([,a], [,b]) => b - a)[0][0]
                                .charAt(0).toUpperCase() + 
                                Object.entries(analysisResult.personality_scores)
                                .sort(([,a], [,b]) => b - a)[0][0].slice(1)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Music Diversity:</span>
                            <div className="font-medium">
                              {analysisResult.genre_influences?.length || 0} genres
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Emotional Range:</span>
                            <div className="font-medium">
                              {analysisResult.audio_features ? 
                                Math.round(Math.max(...analysisResult.audio_features.map(f => f.valence)) * 100) : 'N/A'}% max happiness
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Energy Level:</span>
                            <div className="font-medium">
                              {analysisResult.audio_features ? 
                                Math.round((analysisResult.audio_features.reduce((sum, f) => sum + f.energy, 0) / analysisResult.audio_features.length) * 100) : 'N/A'}% average
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Detailed Analysis Tab */}
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Deep Dive into Your Musical Personality</h3>
                      <p className="text-gray-600">
                        Understand exactly how your music choices shaped each personality trait prediction
                      </p>
                    </div>
                    
                    <div className="space-y-6">
                      {generateTraitExplanations().map((explanation, index) => (
                        <TraitExplanationCard key={index} explanation={explanation} />
                      ))}
                    </div>
                  </div>
                )}

                {/* What-If Simulator Tab */}
                {activeTab === 'simulator' && analysisResult.genre_influences && (
                  <div>
                    <WhatIfSimulator
                      currentScores={analysisResult.personality_scores}
                      genreInfluences={analysisResult.genre_influences}
                      onScoreChange={setSimulatedScores}
                    />
                  </div>
                )}

                {/* Share Results Tab */}
                {activeTab === 'share' && (
                  <div className="max-w-lg mx-auto">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Share Your Musical Personality</h3>
                      <p className="text-gray-600">
                        Let your friends discover what your music says about you!
                      </p>
                    </div>
                    
                    <ShareablePersonalityCard
                      scores={analysisResult.personality_scores}
                      persona={analysisResult.persona || 'The Musical Explorer'}
                      confidence={analysisResult.confidence}
                      username={JSON.parse(localStorage.getItem('spotifyUser') || '{}').display_name || 'Music Lover'}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => router.push('/data')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                📊 Explore Your Data
              </button>
              <button
                onClick={startAnalysis}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                🔄 Re-analyze
              </button>
              <button
                onClick={() => router.push('/')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                🏠 Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
