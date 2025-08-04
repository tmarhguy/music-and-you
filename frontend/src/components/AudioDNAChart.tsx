import React from 'react';

interface AudioFeature {
  valence: number;
  energy: number;
  track_name: string;
  artist_name: string;
  count?: number;
}

interface AudioDNAProps {
  audioFeatures: AudioFeature[];
  width?: number;
  height?: number;
}

export const AudioDNAChart: React.FC<AudioDNAProps> = ({ 
  audioFeatures, 
  width = 400, 
  height = 300 
}) => {
  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Create density zones
  const zones = [
    { name: 'Chill Zone', x: 0, y: 0, width: 50, height: 50, color: '#3B82F6', opacity: 0.1 },
    { name: 'Sad & Mellow', x: 0, y: 50, width: 50, height: 50, color: '#6366F1', opacity: 0.1 },
    { name: 'Happy & Calm', x: 50, y: 0, width: 50, height: 50, color: '#10B981', opacity: 0.1 },
    { name: 'High Energy', x: 50, y: 50, width: 50, height: 50, color: '#F59E0B', opacity: 0.1 },
  ];

  // Calculate point positions
  const getPointPosition = (valence: number, energy: number) => ({
    x: margin.left + (valence * chartWidth),
    y: margin.top + (chartHeight - energy * chartHeight),
  });

  // Group similar points for better visualization
  const groupedPoints = audioFeatures.reduce((acc, feature) => {
    const key = `${Math.round(feature.valence * 20)}-${Math.round(feature.energy * 20)}`;
    if (!acc[key]) {
      acc[key] = { ...feature, count: 0 };
    }
    acc[key].count = (acc[key].count || 0) + 1;
    return acc;
  }, {} as Record<string, AudioFeature>);

  const points = Object.values(groupedPoints);

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Audio DNA</h3>
      <p className="text-sm text-gray-600 mb-4 text-center max-w-md">
        Each dot represents your music plotted by mood (happiness vs energy). 
        Clusters show where you spend most of your listening time.
      </p>
      
      <svg width={width} height={height} className="border border-gray-200 rounded-lg bg-gray-50">
        {/* Background zones */}
        {zones.map((zone, index) => (
          <rect
            key={index}
            x={margin.left + (zone.x / 100) * chartWidth}
            y={margin.top + (zone.y / 100) * chartHeight}
            width={(zone.width / 100) * chartWidth}
            height={(zone.height / 100) * chartHeight}
            fill={zone.color}
            opacity={zone.opacity}
          />
        ))}

        {/* Zone labels */}
        <text x={margin.left + chartWidth * 0.25} y={margin.top + 15} 
              textAnchor="middle" className="text-xs fill-gray-600 font-medium">
          😌 Chill Zone
        </text>
        <text x={margin.left + chartWidth * 0.75} y={margin.top + 15} 
              textAnchor="middle" className="text-xs fill-gray-600 font-medium">
          😊 Happy & Calm
        </text>
        <text x={margin.left + chartWidth * 0.25} y={height - 25} 
              textAnchor="middle" className="text-xs fill-gray-600 font-medium">
          😢 Sad & Mellow
        </text>
        <text x={margin.left + chartWidth * 0.75} y={height - 25} 
              textAnchor="middle" className="text-xs fill-gray-600 font-medium">
          🎉 High Energy
        </text>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(ratio => (
          <g key={ratio}>
            <line
              x1={margin.left + ratio * chartWidth}
              y1={margin.top}
              x2={margin.left + ratio * chartWidth}
              y2={margin.top + chartHeight}
              stroke="#E5E7EB"
              strokeWidth="1"
              strokeDasharray="2,2"
              opacity={0.5}
            />
            <line
              x1={margin.left}
              y1={margin.top + ratio * chartHeight}
              x2={margin.left + chartWidth}
              y2={margin.top + ratio * chartHeight}
              stroke="#E5E7EB"
              strokeWidth="1"
              strokeDasharray="2,2"
              opacity={0.5}
            />
          </g>
        ))}

        {/* Data points */}
        {points.map((feature, index) => {
          const pos = getPointPosition(feature.valence, feature.energy);
          const radius = Math.min(12, 3 + Math.sqrt((feature.count || 1) * 2));
          return (
            <g key={index}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={radius}
                fill="#6366F1"
                opacity={0.6}
                className="hover:opacity-100 cursor-pointer"
              >
                <title>{`${feature.track_name} by ${feature.artist_name}\nValence: ${Math.round(feature.valence * 100)}%, Energy: ${Math.round(feature.energy * 100)}%${feature.count ? `\n${feature.count} similar tracks` : ''}`}</title>
              </circle>
              {(feature.count || 0) > 5 && (
                <text
                  x={pos.x}
                  y={pos.y + 2}
                  textAnchor="middle"
                  className="text-xs fill-white font-bold pointer-events-none"
                >
                  {feature.count}
                </text>
              )}
            </g>
          );
        })}

        {/* Axes */}
        <line
          x1={margin.left}
          y1={margin.top + chartHeight}
          x2={margin.left + chartWidth}
          y2={margin.top + chartHeight}
          stroke="#374151"
          strokeWidth="2"
        />
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={margin.top + chartHeight}
          stroke="#374151"
          strokeWidth="2"
        />

        {/* Axis labels */}
        <text
          x={margin.left + chartWidth / 2}
          y={height - 5}
          textAnchor="middle"
          className="text-sm fill-gray-700 font-medium"
        >
          Happiness (Valence) →
        </text>
        <text
          x={15}
          y={margin.top + chartHeight / 2}
          textAnchor="middle"
          className="text-sm fill-gray-700 font-medium"
          transform={`rotate(-90, 15, ${margin.top + chartHeight / 2})`}
        >
          ← Energy
        </text>
      </svg>
    </div>
  );
};
