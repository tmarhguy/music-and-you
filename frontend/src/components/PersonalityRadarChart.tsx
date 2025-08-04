import React from 'react';

interface PersonalityScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

interface RadarChartProps {
  scores: PersonalityScores;
  size?: number;
}

export const PersonalityRadarChart: React.FC<RadarChartProps> = ({ scores, size = 300 }) => {
  const traits = [
    { key: 'openness', label: 'Openness', color: '#8B5CF6', angle: 0 },
    { key: 'conscientiousness', label: 'Conscientiousness', color: '#3B82F6', angle: 72 },
    { key: 'extraversion', label: 'Extraversion', color: '#10B981', angle: 144 },
    { key: 'agreeableness', label: 'Agreeableness', color: '#F59E0B', angle: 216 },
    { key: 'neuroticism', label: 'Neuroticism', color: '#EF4444', angle: 288 },
  ];

  const center = size / 2;
  const maxRadius = size / 2 - 40;

  // Convert polar coordinates to cartesian
  const getPoint = (angle: number, value: number) => {
    const radian = (angle - 90) * (Math.PI / 180);
    const radius = (value * maxRadius) / 100;
    return {
      x: center + radius * Math.cos(radian),
      y: center + radius * Math.sin(radian),
    };
  };

  // Create path for the polygon
  const createPolygonPath = () => {
    const points = traits.map(trait => {
      const value = scores[trait.key as keyof PersonalityScores] * 100;
      return getPoint(trait.angle, value);
    });
    
    return `M ${points[0].x} ${points[0].y} ` + 
           points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') + 
           ' Z';
  };

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="drop-shadow-sm">
        {/* Background circles */}
        {[20, 40, 60, 80, 100].map(value => (
          <circle
            key={value}
            cx={center}
            cy={center}
            r={(value * maxRadius) / 100}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="1"
            opacity={0.5}
          />
        ))}

        {/* Axis lines */}
        {traits.map(trait => {
          const endPoint = getPoint(trait.angle, 100);
          return (
            <line
              key={trait.key}
              x1={center}
              y1={center}
              x2={endPoint.x}
              y2={endPoint.y}
              stroke="#E5E7EB"
              strokeWidth="1"
              opacity={0.5}
            />
          );
        })}

        {/* Data polygon */}
        <path
          d={createPolygonPath()}
          fill="url(#personalityGradient)"
          stroke="#6366F1"
          strokeWidth="2"
          opacity={0.7}
        />

        {/* Data points */}
        {traits.map(trait => {
          const value = scores[trait.key as keyof PersonalityScores] * 100;
          const point = getPoint(trait.angle, value);
          return (
            <circle
              key={`${trait.key}-point`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={trait.color}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}

        {/* Labels */}
        {traits.map(trait => {
          const labelPoint = getPoint(trait.angle, 110);
          const value = Math.round(scores[trait.key as keyof PersonalityScores] * 100);
          return (
            <g key={`${trait.key}-label`}>
              <text
                x={labelPoint.x}
                y={labelPoint.y - 8}
                textAnchor="middle"
                className="text-xs font-medium fill-gray-700"
              >
                {trait.label}
              </text>
              <text
                x={labelPoint.x}
                y={labelPoint.y + 8}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {value}%
              </text>
            </g>
          );
        })}

        {/* Gradient definition */}
        <defs>
          <radialGradient id="personalityGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};
