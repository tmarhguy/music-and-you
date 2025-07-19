'use client';

import React from 'react';

export default function HomePage() {
  const handleGetStarted = () => {
    console.log('Getting started...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo/Brand */}
            <div className="flex items-center justify-center mb-8">
              <div className="w-12 h-12 bg-primary-600 rounded-lg mr-4"></div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Music and You
              </h1>
            </div>

            {/* Main Headline */}
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Discover Your Personality Through{' '}
              <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Music
              </span>
            </h2>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Connect your music streaming accounts and unlock insights about your personality 
              using cutting-edge machine learning and decades of music psychology research.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={handleGetStarted}
                className="bg-green-500 hover:bg-green-600 text-white font-medium px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                🎵 Connect with Spotify
              </button>
              <button
                onClick={() => console.log('Demo clicked')}
                className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-medium px-8 py-4 text-lg rounded-lg transition-colors duration-200"
              >
                🧠 View Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="mr-2">🔒</span>
                Privacy-First
              </div>
              <div className="flex items-center">
                <span className="mr-2">👥</span>
                Research-Backed
              </div>
              <div className="flex items-center">
                <span className="mr-2">✨</span>
                Free to Use
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our research-grounded approach combines your music listening data with 
              validated personality psychology to provide meaningful insights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🎵',
                title: 'Multi-Platform Music Analysis',
                description: 'Connect your Spotify, YouTube Music, and Last.fm accounts for comprehensive analysis.',
              },
              {
                icon: '🧠',
                title: 'Big Five Personality Prediction',
                description: 'Discover your personality traits using research-backed machine learning models.',
              },
              {
                icon: '✨',
                title: 'Detailed Music Insights',
                description: 'Explore your listening patterns, favorite genres, and musical diversity metrics.',
              },
              {
                icon: '🔒',
                title: 'Privacy-First Design',
                description: 'Your data stays secure with local processing options and full user control.',
              },
              {
                icon: '👥',
                title: 'Research-Grounded',
                description: 'Built on 20+ years of music psychology research and validated approaches.',
              },
              {
                icon: '📈',
                title: 'Continuous Learning',
                description: 'Our models improve over time while respecting your privacy.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-4xl mb-4">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-primary-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Discover Your Musical Personality?
          </h3>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of users who have discovered fascinating insights about themselves 
            through their music listening habits.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-primary-600 hover:bg-gray-100 font-medium px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            🎵 Get Started Free
          </button>
        </div>
      </div>
    </div>
  );
}
