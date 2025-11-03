import React from 'react';
import { Season } from '../../types';

interface SeasonalTagProps {
  season: Season;
  isCurrentSeason?: boolean;
  size?: 'sm' | 'md';
}

const SeasonalTag: React.FC<SeasonalTagProps> = ({ season, isCurrentSeason = false, size = 'md' }) => {
  const seasonConfig = {
    spring: { icon: '🌸', color: 'green', name: 'Spring' },
    summer: { icon: '☀️', color: 'yellow', name: 'Summer' },
    monsoon: { icon: '🌧️', color: 'blue', name: 'Monsoon' },
    autumn: { icon: '🍂', color: 'orange', name: 'Autumn' },
    winter: { icon: '❄️', color: 'blue', name: 'Winter' },
    'pre-winter': { icon: '🌨️', color: 'gray', name: 'Pre Winter' }
  };

  const config = seasonConfig[season];
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <div className={`inline-flex items-center space-x-1 rounded-full font-medium ${sizeClasses} ${isCurrentSeason
      ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-md'
      : config.color === 'green' ? 'bg-green-100 text-green-700' :
        config.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
          config.color === 'blue' ? 'bg-blue-100 text-blue-700' :
            config.color === 'orange' ? 'bg-orange-100 text-orange-700' :
              'bg-gray-100 text-gray-700'
      }`}>
      <span>{config.icon}</span>
      <span>{config.name}</span>
      {isCurrentSeason && <span className="text-xs">✨</span>}
    </div>
  );
};

export default SeasonalTag;