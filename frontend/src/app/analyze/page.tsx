'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PersonalityRadarChart } from '../../components/PersonalityRadarChart';
import { AudioDNAChart } from '../../components/AudioDNAChart';
import { ShareablePersonalityCard } from '../../components/ShareablePersonalityCard';
import { TraitExplanationCard } from '../../components/TraitExplanationCard';
import { WhatIfSimulator } from '../../components/WhatIfSimulator';
import { ChatWidget } from '../../components/ChatWidget';
import { SmartTooltip, AskAIButton, ContextSuggestions } from '../../components/SmartIntegrations';
import { demoAnalysisResult, isDemoMode, simulateApiDelay } from '../../data/demo-data';

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

export default function AnalyzePage() {
  const router = useRouter();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [simulatedScores, setSimulatedScores] = useState<PersonalityScores | null>(null);

  const mockEnhanceAnalysisResult = (result: AnalysisResult): AnalysisResult => {
    const personas = ['The Eclectic Adventurer', 'The Mood Curator', 'The Genre Explorer', 'The Beat Master', 'The Harmony Hunter'];
    
    const mockAudioFeatures = [
      { valence: 0.8, energy: 0.7, track_name: "Happy Song", artist_name: "Artist A" },
      { valence: 0.6, energy: 0.9, track_name: "Energetic Track", artist_name: "Artist B" },
      { valence: 0.4, energy: 0.3, track_name: "Mellow Tune", artist_name: "Artist C" },
    ];

    const mockGenreInfluences = [
      { genre: "Pop", currentPercentage: 25, traits: { openness: 0.6, conscientiousness: 0.5, extraversion: 0.8, agreeableness: 0.7, neuroticism: 0.4 } },
      { genre: "Rock", currentPercentage: 20, traits: { openness: 0.7, conscientiousness: 0.6, extraversion: 0.7, agreeableness: 0.5, neuroticism: 0.6 } },
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
    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      let result;
      
      // Check if we're in demo mode
      if (isDemoMode()) {
        await simulateApiDelay(3000);
        clearInterval(progressInterval);
        setProgress(100);
        result = demoAnalysisResult;
      } else {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8003';
        const response = await fetch(`${apiUrl}/analyze`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        clearInterval(progressInterval);
        setProgress(100);

        if (!response.ok) {
          throw new Error(`Analysis failed: ${response.statusText}`);
        }

        result = await response.json();
      }

      const enhancedResult = mockEnhanceAnalysisResult(result);
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

        {/* Error Section */}
        {error && (
          <div className="bg-red-500/10 rounded-2xl border border-red-500/20 p-8 text-center backdrop-blur-sm">
            <div className="text-6xl mb-6">
              <svg className="w-16 h-16 mx-auto text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-400 mb-4">Analysis Failed</h2>
            <p className="text-red-300 mb-6">{error}</p>
            <button
              onClick={() => setError(null)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results Section */}
        {analysisResult && (
          <div className="space-y-8">
            {/* Persona Header */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-8 text-center backdrop-blur-sm">
              <div className="text-6xl mb-4">
                <svg className="w-16 h-16 mx-auto text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                You are {analysisResult.persona || 'The Musical Explorer'}!
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="text-center">
                  <p className="text-slate-400 text-sm">Confidence Level</p>
                  <span className="ml-1 font-bold text-white">{Math.round(analysisResult.confidence * 100)}%</span>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-sm">Tracks Analyzed</p>
                  <span className="ml-1 font-bold text-white">{analysisResult.data_summary?.total_tracks_analyzed || 'N/A'}</span>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-sm">Features Processed</p>
                  <span className="ml-1 font-bold text-white">{analysisResult.data_summary?.analysis_features || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-sm">
              <div className="flex flex-wrap border-b border-white/10">
                {['overview', 'insights', 'simulator', 'share'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 font-medium transition-all duration-300 ${
                      activeTab === tab
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="p-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-white">Personality Radar</h3>
                          <div className="flex items-center gap-2">
                            <SmartTooltip
                              type="trait"
                              title="Personality Analysis"
                              content="This radar chart shows your Big Five personality traits based on your music listening patterns. Each trait reflects different aspects of your musical preferences."
                              onAskAI={() => {
                                const event = new CustomEvent('openChatWithQuestion', { 
                                  detail: { 
                                    question: "Explain how my personality radar chart works and what each trait means for my music taste", 
                                    context: "analyze" 
                                  } 
                                });
                                window.dispatchEvent(event);
                              }}
                            />
                            <AskAIButton
                              question="What do my personality scores mean and which is most important?"
                              context="analyze"
                              variant="secondary"
                              size="sm"
                            />
                          </div>
                        </div>
                        <PersonalityRadarChart scores={simulatedScores || analysisResult.personality_scores} />
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold text-white mb-4">Quick Questions</h3>
                        <ContextSuggestions 
                          context="analyze" 
                          personalityScores={analysisResult.personality_scores}
                          className="mb-6"
                        />
                        
                        <h3 className="text-xl font-bold text-white mb-4">Key Insights</h3>
                        <div className="space-y-3">
                          {analysisResult.insights.slice(0, 3).map((insight, index) => (
                            <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10">
                              <p className="text-slate-300">{insight}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Audio Features Chart */}
                    {analysisResult.audio_features && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-white">Audio DNA</h3>
                          <div className="flex items-center gap-2">
                            <SmartTooltip
                              type="feature"
                              title="Audio Features"
                              content="Your Audio DNA shows the musical characteristics of your favorite songs - like energy, happiness (valence), and danceability. These patterns reveal your personality preferences."
                              onAskAI={() => {
                                const event = new CustomEvent('openChatWithQuestion', { 
                                  detail: { 
                                    question: "Explain what my audio features mean and how they connect to my personality", 
                                    context: "analyze" 
                                  } 
                                });
                                window.dispatchEvent(event);
                              }}
                            />
                            <AskAIButton
                              question="What do these audio features say about my music taste?"
                              context="analyze"
                              variant="secondary"
                              size="sm"
                            />
                          </div>
                        </div>
                        <AudioDNAChart audioFeatures={analysisResult.audio_features || []} />
                      </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                        <p className="text-slate-400 text-sm mb-2">Highest Trait</p>
                        <p className="text-white font-bold">
                          {Object.entries(analysisResult.personality_scores)
                            .sort(([,a], [,b]) => b - a)[0][0].charAt(0).toUpperCase() + 
                           Object.entries(analysisResult.personality_scores)
                            .sort(([,a], [,b]) => b - a)[0][0].slice(1)}
                        </p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                        <p className="text-slate-400 text-sm mb-2">Genre Diversity</p>
                        <p className="text-white font-bold">
                          {analysisResult.genre_influences?.length || 0} genres
                        </p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                        <p className="text-slate-400 text-sm mb-2">Mood Range</p>
                        <p className="text-white font-bold">
                          {analysisResult.audio_features ?
                            Math.round(Math.max(...analysisResult.audio_features.map(f => f.valence)) * 100) : 'N/A'}% max happiness
                        </p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                        <p className="text-slate-400 text-sm mb-2">Energy Level</p>
                        <p className="text-white font-bold">
                          {analysisResult.audio_features ?
                            Math.round((analysisResult.audio_features.reduce((sum, f) => sum + f.energy, 0) / analysisResult.audio_features.length) * 100) : 'N/A'}% average
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Insights Tab */}
                {activeTab === 'insights' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white mb-6">Detailed Trait Analysis</h3>
                    <div className="space-y-6">
                      {generateTraitExplanations().map((explanationData, index) => (
                        <TraitExplanationCard key={index} explanation={explanationData} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Simulator Tab */}
                {activeTab === 'simulator' && analysisResult.genre_influences && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-6">What-If Simulator</h3>
                    <WhatIfSimulator
                      currentScores={analysisResult.personality_scores}
                      genreInfluences={analysisResult.genre_influences || []}
                      onScoreChange={setSimulatedScores}
                    />
                  </div>
                )}

                {/* Share Tab */}
                {activeTab === 'share' && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-6">Share Your Results</h3>
                    <ShareablePersonalityCard
                      scores={analysisResult.personality_scores}
                      persona={analysisResult.persona || 'The Musical Explorer'}
                      confidence={analysisResult.confidence}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Widget with context and personality scores */}
      {analysisResult && (
        <ChatWidget 
          personalityScores={analysisResult.personality_scores}
          context="analyze"
        />
      )}
    </div>
  );
}
