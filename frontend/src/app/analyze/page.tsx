'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  };
  analysis_timestamp: number;
  status: string;
}

export default function AnalysisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const userProfile = localStorage.getItem('spotifyUser');
    if (!userProfile) {
      router.push('/');
      return;
    }
  }, []);

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

      const response = await fetch('http://localhost:8000/api/analysis/personality', {
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
      setAnalysisResult(result);

    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const getTraitLabel = (trait: string): string => {
    const labels = {
      openness: 'Openness to Experience',
      conscientiousness: 'Conscientiousness',
      extraversion: 'Extraversion',
      agreeableness: 'Agreeableness',
      neuroticism: 'Neuroticism'
    };
    return labels[trait as keyof typeof labels] || trait;
  };

  const getTraitDescription = (trait: string): string => {
    const descriptions = {
      openness: 'Creativity, curiosity, and openness to new experiences',
      conscientiousness: 'Organization, responsibility, and self-discipline',
      extraversion: 'Social energy, assertiveness, and outgoing nature',
      agreeableness: 'Compassion, cooperation, and trust in others',
      neuroticism: 'Emotional sensitivity and tendency toward negative emotions'
    };
    return descriptions[trait as keyof typeof descriptions] || '';
  };

  const getTraitColor = (trait: string): string => {
    const colors = {
      openness: 'bg-purple-500',
      conscientiousness: 'bg-blue-500',
      extraversion: 'bg-green-500',
      agreeableness: 'bg-yellow-500',
      neuroticism: 'bg-red-500'
    };
    return colors[trait as keyof typeof colors] || 'bg-gray-500';
  };

  const getScoreInterpretation = (score: number): string => {
    if (score > 0.7) return 'High';
    if (score > 0.5) return 'Moderate-High';
    if (score > 0.3) return 'Moderate-Low';
    return 'Low';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Personality Analysis</h1>
              <p className="text-gray-600 mt-1">Discover your personality through your music taste</p>
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

        {/* Results Section */}
        {analysisResult && (
          <div className="space-y-8">
            {/* Summary Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Your Musical Personality Profile</h2>
                  <p className="text-gray-600">
                    Analysis confidence: {Math.round(analysisResult.confidence * 100)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {analysisResult.data_summary && (
                      `Based on ${analysisResult.data_summary.total_tracks_analyzed} tracks`
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(analysisResult.analysis_timestamp * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Personality Scores */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {Object.entries(analysisResult.personality_scores).map(([trait, score]) => (
                  <div key={trait} className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-3">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-gray-200"
                        />
                        {/* Progress circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - score)}`}
                          className={getTraitColor(trait).replace('bg-', 'text-')}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">
                          {Math.round(score * 100)}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">
                      {getTraitLabel(trait)}
                    </h3>
                    <p className="text-xs text-gray-500 mb-1">
                      {getScoreInterpretation(score)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {getTraitDescription(trait)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Personality Insights</h3>
              <div className="space-y-4">
                {analysisResult.insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">What's Next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push('/data')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  📊 View Your Music Data
                </button>
                <button
                  onClick={startAnalysis}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  🔄 Re-run Analysis
                </button>
                <button
                  onClick={() => alert('Recommendations feature coming soon!')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  🎶 Get Recommendations
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
