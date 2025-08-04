import React, { useState } from 'react';

interface TraitExplanation {
  trait: string;
  score: number;
  description: string;
  musicalEvidence: string[];
  topGenres?: string[];
  topArtists?: string[];
  keyFactors: {
    factor: string;
    impact: 'positive' | 'negative';
    explanation: string;
  }[];
}

interface TraitExplanationCardProps {
  explanation: TraitExplanation;
}

export const TraitExplanationCard: React.FC<TraitExplanationCardProps> = ({ explanation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTraitColor = (trait: string) => {
    const colors: { [key: string]: string } = {
      openness: 'purple',
      conscientiousness: 'blue',
      extraversion: 'green',
      agreeableness: 'yellow',
      neuroticism: 'red',
    };
    return colors[trait.toLowerCase()] || 'gray';
  };

  const getTraitEmoji = (trait: string) => {
    const emojis: { [key: string]: string } = {
      openness: '🎨',
      conscientiousness: '📋',
      extraversion: '🎉',
      agreeableness: '🤝',
      neuroticism: '🌊',
    };
    return emojis[trait.toLowerCase()] || '🎵';
  };

  const getScoreInterpretation = (score: number) => {
    if (score > 0.7) return { label: 'Very High', color: 'green' };
    if (score > 0.55) return { label: 'High', color: 'blue' };
    if (score > 0.45) return { label: 'Moderate', color: 'yellow' };
    if (score > 0.3) return { label: 'Low', color: 'orange' };
    return { label: 'Very Low', color: 'red' };
  };

  const colorVariants = {
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-800',
      accent: 'text-purple-600',
      button: 'bg-purple-100 hover:bg-purple-200 text-purple-700',
      progress: 'bg-purple-500',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      accent: 'text-blue-600',
      button: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
      progress: 'bg-blue-500',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      accent: 'text-green-600',
      button: 'bg-green-100 hover:bg-green-200 text-green-700',
      progress: 'bg-green-500',
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      accent: 'text-yellow-600',
      button: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700',
      progress: 'bg-yellow-500',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      accent: 'text-red-600',
      button: 'bg-red-100 hover:bg-red-200 text-red-700',
      progress: 'bg-red-500',
    },
  };

  const color = getTraitColor(explanation.trait);
  const styles = colorVariants[color as keyof typeof colorVariants];
  const interpretation = getScoreInterpretation(explanation.score);

  return (
    <div className={`rounded-lg border-2 ${styles.border} ${styles.bg} p-6 transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getTraitEmoji(explanation.trait)}</span>
          <div>
            <h3 className={`text-xl font-bold ${styles.text}`}>
              {explanation.trait.charAt(0).toUpperCase() + explanation.trait.slice(1)}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${interpretation.color === 'green' ? 'text-green-600' : 
                interpretation.color === 'blue' ? 'text-blue-600' : 
                interpretation.color === 'yellow' ? 'text-yellow-600' : 
                interpretation.color === 'orange' ? 'text-orange-600' : 'text-red-600'}`}>
                {interpretation.label}
              </span>
              <span className="text-sm text-gray-600">
                ({Math.round(explanation.score * 100)}th percentile)
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden mb-1">
            <div 
              className={`h-full ${styles.progress} rounded-full transition-all duration-500`}
              style={{ width: `${explanation.score * 100}%` }}
            />
          </div>
          <span className={`text-sm font-medium ${styles.accent}`}>
            {Math.round(explanation.score * 100)}%
          </span>
        </div>
      </div>

      <p className="text-gray-700 mb-4">{explanation.description}</p>

      <div className="mb-4">
        <h4 className={`font-semibold ${styles.text} mb-2`}>Musical Evidence:</h4>
        <ul className="space-y-1">
          {explanation.musicalEvidence.slice(0, isExpanded ? undefined : 2).map((evidence, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className={`${styles.accent} mt-1`}>•</span>
              <span className="text-gray-700 text-sm">{evidence}</span>
            </li>
          ))}
        </ul>
        {explanation.musicalEvidence.length > 2 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`mt-2 text-sm ${styles.accent} hover:underline`}
          >
            {isExpanded ? 'Show less' : `Show ${explanation.musicalEvidence.length - 2} more`}
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {explanation.keyFactors.length > 0 && (
            <div>
              <h4 className={`font-semibold ${styles.text} mb-2`}>Key Contributing Factors:</h4>
              <div className="space-y-2">
                {explanation.keyFactors.map((factor, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className={factor.impact === 'positive' ? 'text-green-500' : 'text-red-500'}>
                      {factor.impact === 'positive' ? '↗️' : '↘️'}
                    </span>
                    <div className="flex-1">
                      <span className="font-medium text-gray-800">{factor.factor}</span>
                      <p className="text-sm text-gray-600">{factor.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(explanation.topGenres || explanation.topArtists) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {explanation.topGenres && (
                <div>
                  <h4 className={`font-semibold ${styles.text} mb-2`}>Top Genres for this Trait:</h4>
                  <div className="flex flex-wrap gap-1">
                    {explanation.topGenres.slice(0, 5).map((genre, index) => (
                      <span key={index} className={`px-2 py-1 ${styles.button} rounded-full text-xs`}>
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {explanation.topArtists && (
                <div>
                  <h4 className={`font-semibold ${styles.text} mb-2`}>Influential Artists:</h4>
                  <div className="flex flex-wrap gap-1">
                    {explanation.topArtists.slice(0, 4).map((artist, index) => (
                      <span key={index} className={`px-2 py-1 ${styles.button} rounded-full text-xs`}>
                        {artist}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`mt-4 px-4 py-2 ${styles.button} rounded-lg text-sm font-medium transition-colors`}
      >
        {isExpanded ? 'Show Less Details' : 'Why did we predict this?'}
      </button>
    </div>
  );
};
