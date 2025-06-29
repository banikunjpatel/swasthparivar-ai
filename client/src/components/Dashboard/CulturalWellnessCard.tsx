import React from 'react';
import { Sunrise, Moon, Leaf, Droplets } from 'lucide-react';
import { DoshaType, Season } from '../../types';

interface CulturalWellnessCardProps {
  userDosha: any;
  currentSeason: Season;
}

const CulturalWellnessCard: React.FC<CulturalWellnessCardProps> = ({ userDosha, currentSeason }) => {
  const getDoshaIcon = (dosha: string) => {
    switch (dosha.toLowerCase()) {
      case 'vata': return '💨';
      case 'pitta': return '🔥';
      case 'kapha': return '🌊';
      default: return '⚖️';
    }
  };

  const getSeasonalWisdom = (season: Season) => {
    const wisdom = {
      spring: { icon: '🌸', message: 'Time for renewal and gentle detox', color: 'from-green-400 to-emerald-500' },
      summer: { icon: '☀️', message: 'Stay cool and hydrated', color: 'from-yellow-400 to-orange-500' },
      monsoon: { icon: '🌧️', message: 'Boost immunity with warming spices', color: 'from-blue-400 to-indigo-500' },
      autumn: { icon: '🍂', message: 'Ground yourself with nourishing foods', color: 'from-orange-400 to-red-500' },
      winter: { icon: '❄️', message: 'Warm your body and soul', color: 'from-blue-500 to-purple-600' },
      'late-winter': { icon: '🌨️', message: 'Prepare for spring awakening', color: 'from-gray-400 to-slate-500' }
    };
    return wisdom[season];
  };

  const seasonalWisdom = getSeasonalWisdom(currentSeason);
  const primaryDosha = userDosha.split('-')[0];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header with Cultural Pattern */}
      <div className={`bg-gradient-to-r ${seasonalWisdom.color} p-6 relative`}>
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Today's Wisdom</h3>
            <div className="text-3xl">{seasonalWisdom.icon}</div>
          </div>
          <p className="text-white text-opacity-90">{seasonalWisdom.message}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Dosha Focus */}
        <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="text-3xl">{getDoshaIcon(primaryDosha)}</div>
          <div>
            <h4 className="font-semibold text-gray-800 capitalize">Your {userDosha} Constitution</h4>
            <p className="text-sm text-gray-600">
              {primaryDosha === 'vata' && 'Focus on grounding and warming practices'}
              {primaryDosha === 'pitta' && 'Embrace cooling and calming activities'}
              {primaryDosha === 'kapha' && 'Energize with stimulating practices'}
            </p>
          </div>
        </div>

        {/* Daily Rituals */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
            <Sunrise className="h-5 w-5 text-orange-500" />
            <span>Morning Rituals</span>
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">🧘‍♀️</div>
              <div className="text-xs font-medium text-gray-700">Meditation</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">🫖</div>
              <div className="text-xs font-medium text-gray-700">Herbal Tea</div>
            </div>
          </div>
        </div>

        {/* Evening Rituals */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
            <Moon className="h-5 w-5 text-purple-500" />
            <span>Evening Rituals</span>
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">🛁</div>
              <div className="text-xs font-medium text-gray-700">Warm Bath</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">📖</div>
              <div className="text-xs font-medium text-gray-700">Reflection</div>
            </div>
          </div>
        </div>

        {/* Seasonal Tip */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-start space-x-3">
            <Leaf className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-orange-800 mb-1">Seasonal Tip</h5>
              <p className="text-sm text-orange-700">
                {currentSeason === 'spring' && 'Include bitter greens and light detox practices'}
                {currentSeason === 'summer' && 'Choose cooling foods like cucumber and mint'}
                {currentSeason === 'monsoon' && 'Warm spices like ginger help boost immunity'}
                {currentSeason === 'autumn' && 'Root vegetables and warming oils support grounding'}
                {currentSeason === 'winter' && 'Hearty stews and warm oils nourish deeply'}
                {currentSeason === 'late-winter' && 'Begin lightening diet for spring transition'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CulturalWellnessCard;