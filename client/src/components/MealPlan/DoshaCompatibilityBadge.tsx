import React from 'react';
import { DoshaBalance, DoshaType } from '../../types';

interface DoshaCompatibilityBadgeProps {
  recipeBalance: DoshaBalance;
  userDosha: DoshaType;
  size?: 'sm' | 'md' | 'lg';
}

const DoshaCompatibilityBadge: React.FC<DoshaCompatibilityBadgeProps> = ({ 
  recipeBalance, 
  userDosha, 
  size = 'md' 
}) => {
  const primaryDosha = userDosha.split('-')[0] as keyof DoshaBalance;
  const compatibility = recipeBalance[primaryDosha];
  
  const getCompatibilityLevel = (score: number) => {
    if (score >= 80) return { level: 'excellent', color: 'green', icon: '🌟' };
    if (score >= 60) return { level: 'good', color: 'blue', icon: '👍' };
    if (score >= 40) return { level: 'moderate', color: 'yellow', icon: '⚖️' };
    return { level: 'low', color: 'orange', icon: '⚠️' };
  };

  const getDoshaIcon = (dosha: string) => {
    switch (dosha.toLowerCase()) {
      case 'vata': return '💨';
      case 'pitta': return '🔥';
      case 'kapha': return '🌊';
      default: return '⚖️';
    }
  };

  const compat = getCompatibilityLevel(compatibility);
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`inline-flex items-center space-x-1 rounded-full font-medium ${sizeClasses[size]} ${
        compat.color === 'green' ? 'bg-green-100 text-green-700 border border-green-200' :
        compat.color === 'blue' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
        compat.color === 'yellow' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
        'bg-orange-100 text-orange-700 border border-orange-200'
      }`}>
        <span>{getDoshaIcon(primaryDosha)}</span>
        <span className="capitalize">{compat.level}</span>
        <span>{compat.icon}</span>
      </div>
      
      {size !== 'sm' && (
        <div className="text-xs text-gray-500">
          {compatibility}% match
        </div>
      )}
    </div>
  );
};

export default DoshaCompatibilityBadge;