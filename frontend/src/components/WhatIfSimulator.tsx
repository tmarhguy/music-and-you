import React, { useState, useEffect } from 'react';

interface GenreInfluence {
  genre: string;
  currentPercentage: number;
  traits: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
}

interface WhatIfSimulatorProps {
  currentScores: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  genreInfluences: GenreInfluence[];
  onScoreChange?: (newScores: any) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  currentScores,
  genreInfluences,
  onScoreChange
}) => {
  const [simulatedGenres, setSimulatedGenres] = useState<{ [key: string]: number }>({});
  const [predictedScores, setPredictedScores] = useState(currentScores);

  // Initialize with current percentages
  useEffect(() => {
    const initial = genreInfluences.reduce((acc, genre) => {
      acc[genre.genre] = genre.currentPercentage;
      return acc;
    }, {} as { [key: string]: number });
    setSimulatedGenres(initial);
  }, [genreInfluences]);

  // Calculate new scores based on genre adjustments
  useEffect(() => {
    const totalPercentage = Object.values(simulatedGenres).reduce((sum, val) => sum + val, 0);
    if (totalPercentage === 0) return;

    // Normalize percentages to sum to 100%
    const normalizedGenres = Object.entries(simulatedGenres).reduce((acc, [genre, percentage]) => {
      acc[genre] = (percentage / totalPercentage) * 100;
      return acc;
    }, {} as { [key: string]: number });

    // Calculate weighted average of trait influences
    const newScores = { ...currentScores };
    Object.keys(newScores).forEach(trait => {
      let weightedSum = 0;
      let totalWeight = 0;

      Object.entries(normalizedGenres).forEach(([genre, percentage]) => {
        const genreData = genreInfluences.find(g => g.genre === genre);
        if (genreData) {
          const weight = percentage / 100;
          weightedSum += genreData.traits[trait as keyof typeof genreData.traits] * weight;
          totalWeight += weight;
        }
      });

      if (totalWeight > 0) {
        // Blend with current score (70% new influence, 30% baseline)
        newScores[trait as keyof typeof newScores] = 
          (weightedSum * 0.7) + (currentScores[trait as keyof typeof currentScores] * 0.3);
      }
    });

    setPredictedScores(newScores);
    onScoreChange?.(newScores);
  }, [simulatedGenres, currentScores, genreInfluences, onScoreChange]);

  const handleGenreChange = (genre: string, value: number) => {
    setSimulatedGenres(prev => ({
      ...prev,
      [genre]: Math.max(0, Math.min(100, value))
    }));
  };

  const resetToOriginal = () => {
    const original = genreInfluences.reduce((acc, genre) => {
      acc[genre.genre] = genre.currentPercentage;
      return acc;
    }, {} as { [key: string]: number });
    setSimulatedGenres(original);
  };

  const getScoreChange = (trait: string) => {
    const current = currentScores[trait as keyof typeof currentScores];
    const predicted = predictedScores[trait as keyof typeof predictedScores];
    const change = predicted - current;
    return {
      change,
      percentage: Math.round(change * 100),
      isIncrease: change > 0.01,
      isDecrease: change < -0.01,
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">🔮 Musical Personality Simulator</h3>
        <button
          onClick={resetToOriginal}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
        >
          Reset
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        Adjust your music genre mix and see how it might change your personality scores. 
        This simulation is based on genre-personality correlations from music psychology research.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genre Sliders */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-4">Adjust Your Genre Mix:</h4>
          <div className="space-y-4">
            {genreInfluences.slice(0, 8).map((genre) => {
              const currentValue = simulatedGenres[genre.genre] || 0;
              const originalValue = genre.currentPercentage;
              const isChanged = Math.abs(currentValue - originalValue) > 1;

              return (
                <div key={genre.genre} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">
                      {genre.genre}
                    </label>
                    <div className="flex items-center space-x-2">
                      {isChanged && (
                        <span className="text-xs text-blue-600">
                          ({originalValue > currentValue ? '-' : '+'}{Math.abs(Math.round(currentValue - originalValue))}%)
                        </span>
                      )}
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {Math.round(currentValue)}%
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={currentValue}
                      onChange={(e) => handleGenreChange(genre.genre, parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    {/* Original position indicator */}
                    <div 
                      className="absolute top-0 w-1 h-2 bg-gray-400 pointer-events-none"
                      style={{ left: `${(originalValue / 50) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Predicted Changes */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-4">Predicted Personality Changes:</h4>
          <div className="space-y-3">
            {Object.keys(currentScores).map((trait) => {
              const change = getScoreChange(trait);
              const traitName = trait.charAt(0).toUpperCase() + trait.slice(1);
              
              return (
                <div key={trait} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">{traitName}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {Math.round(currentScores[trait as keyof typeof currentScores] * 100)}%
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className={`text-sm font-medium ${
                        change.isIncrease ? 'text-green-600' : 
                        change.isDecrease ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {Math.round(predictedScores[trait as keyof typeof predictedScores] * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-400 rounded-full transition-all duration-300"
                        style={{ width: `${predictedScores[trait as keyof typeof predictedScores] * 100}%` }}
                      />
                    </div>
                    {(change.isIncrease || change.isDecrease) && (
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        change.isIncrease ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {change.isIncrease ? '+' : ''}{change.percentage}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 <strong>Tip:</strong> Try increasing Jazz or Classical for higher Openness, 
              or Pop/Dance for higher Extraversion. These predictions are estimates based on 
              research correlations.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t">
        <div className="text-xs text-gray-500">
          <p>
            This simulator uses research-based correlations between musical genres and personality traits. 
            Results are estimates and may not reflect actual personality changes from listening to different music.
          </p>
        </div>
      </div>
    </div>
  );
};
