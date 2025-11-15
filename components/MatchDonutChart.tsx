import React from 'react';

interface MatchDonutChartProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

const MatchDonutChart: React.FC<MatchDonutChartProps> = ({
  percentage,
  size = 80,
  strokeWidth = 8,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // The design uses a consistent, vibrant green for the progress.
  const colorClass = 'text-green-400'; 
  // The track is a darker, desaturated version of the progress color.
  const trackColorClass = 'text-green-400/20';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="absolute" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className={trackColorClass}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`${colorClass} transition-all duration-500 ease-in-out`}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <span className={`text-lg font-bold text-gray-200`}>
        {percentage}%
      </span>
    </div>
  );
};

export default MatchDonutChart;