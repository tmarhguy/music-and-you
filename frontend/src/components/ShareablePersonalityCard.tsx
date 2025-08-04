import React from 'react';
import { PersonalityRadarChart } from './PersonalityRadarChart';

interface PersonalityScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

interface ShareableCardProps {
  scores: PersonalityScores;
  persona: string;
  confidence: number;
  username?: string;
}

export const ShareablePersonalityCard: React.FC<ShareableCardProps> = ({
  scores,
  persona,
  confidence,
  username = "Music Lover"
}) => {
  const getPersonaEmoji = (persona: string) => {
    const emojiMap: { [key: string]: string } = {
      'The Eclectic Adventurer': '🎭',
      'The Mood Curator': '🌈',
      'The Genre Explorer': '🗺️',
      'The Rhythm Seeker': '🎵',
      'The Melodic Dreamer': '☁️',
      'The Beat Master': '🔥',
      'The Harmony Hunter': '🎼',
      'The Sonic Wanderer': '✨',
    };
    return emojiMap[persona] || '🎧';
  };

  const downloadCard = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 800;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 800);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 800);

    // White content area
    ctx.fillStyle = 'white';
    ctx.roundRect(40, 40, 520, 720, 20);
    ctx.fill();

    // Text content
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('My Musical Personality', 300, 100);

    ctx.font = '24px Arial';
    ctx.fillText(getPersonaEmoji(persona), 300, 150);
    
    ctx.font = 'bold 28px Arial';
    ctx.fillText(persona, 300, 190);

    ctx.font = '18px Arial';
    ctx.fillStyle = '#6B7280';
    ctx.fillText(`${username}'s Music Profile`, 300, 220);
    ctx.fillText(`${Math.round(confidence * 100)}% Confidence`, 300, 245);

    // Trait scores
    const traits = [
      { name: 'Openness', value: scores.openness, color: '#8B5CF6' },
      { name: 'Conscientiousness', value: scores.conscientiousness, color: '#3B82F6' },
      { name: 'Extraversion', value: scores.extraversion, color: '#10B981' },
      { name: 'Agreeableness', value: scores.agreeableness, color: '#F59E0B' },
      { name: 'Neuroticism', value: scores.neuroticism, color: '#EF4444' },
    ];

    let yPos = 300;
    traits.forEach(trait => {
      ctx.fillStyle = '#374151';
      ctx.font = '18px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(trait.name, 80, yPos);
      
      // Progress bar
      ctx.fillStyle = '#E5E7EB';
      ctx.fillRect(250, yPos - 15, 200, 10);
      
      ctx.fillStyle = trait.color;
      ctx.fillRect(250, yPos - 15, trait.value * 200, 10);
      
      // Percentage
      ctx.fillStyle = '#6B7280';
      ctx.font = '16px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.round(trait.value * 100)}%`, 480, yPos);
      
      yPos += 60;
    });

    // Footer
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Discover your musical personality at', 300, 650);
    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('MusicAndYou.app', 300, 680);

    // Download
    const link = document.createElement('a');
    link.download = `${username}-musical-personality.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const shareText = `I'm "${persona}" according to my musical personality analysis! 🎵 My music taste reveals: ${Object.entries(scores)
    .map(([trait, value]) => `${trait}: ${Math.round(value * 100)}%`)
    .slice(0, 2)
    .join(', ')}. Discover yours at MusicAndYou.app #MusicPersonality #SpotifyAnalysis`;

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://musicandyou.app')}&summary=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText);
    // You might want to show a toast notification here
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">{getPersonaEmoji(persona)}</div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">{persona}</h3>
        <p className="text-gray-600">Your Musical Personality</p>
        <p className="text-sm text-gray-500">{Math.round(confidence * 100)}% Confidence</p>
      </div>

      <div className="mb-6">
        <PersonalityRadarChart scores={scores} size={200} />
      </div>

      <div className="space-y-3 mb-6">
        {Object.entries(scores).map(([trait, value]) => (
          <div key={trait} className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 capitalize">
              {trait.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  style={{ width: `${value * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-10 text-right">
                {Math.round(value * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <p className="text-xs text-gray-500 text-center mb-4">Share your musical personality:</p>
        <div className="flex justify-center space-x-2">
          <button
            onClick={shareOnTwitter}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-1"
          >
            <span>🐦</span>
            <span>Twitter</span>
          </button>
          <button
            onClick={shareOnLinkedIn}
            className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-1"
          >
            <span>💼</span>
            <span>LinkedIn</span>
          </button>
          <button
            onClick={downloadCard}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-1"
          >
            <span>📸</span>
            <span>Download</span>
          </button>
          <button
            onClick={copyToClipboard}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-1"
          >
            <span>📋</span>
            <span>Copy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
