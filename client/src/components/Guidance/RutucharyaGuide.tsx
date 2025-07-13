import React, { useState } from 'react';
import { RUTUCHARYA_GUIDANCE } from '../../data/ayurvedic-data';
import { Season } from '../../types';
import { Leaf, Snowflake, Sun, Cloud, CloudRain, Wind } from 'lucide-react';

interface RutucharyaGuideProps {
  userDosha: any;
  currentSeason: Season;
}

const RutucharyaGuide: React.FC<RutucharyaGuideProps> = ({ userDosha, currentSeason }) => {
  const [selectedSeason, setSelectedSeason] = useState<Season>(currentSeason);
  const initialDosha = userDosha && typeof userDosha === 'string'
    ? userDosha.split('-')[0].toLowerCase()
    : 'vata'; // fallback to 'vata'

  const [selectedDosha, setSelectedDosha] = useState<'vata' | 'pitta' | 'kapha'>(
    ['vata', 'pitta', 'kapha'].includes(initialDosha) ? (initialDosha as 'vata' | 'pitta' | 'kapha') : 'vata'
  );

  const seasonInfo = {
    spring: { icon: Leaf, color: 'green', name: 'Spring', gradient: 'from-green-400 to-emerald-500' },
    summer: { icon: Sun, color: 'yellow', name: 'Summer', gradient: 'from-yellow-400 to-orange-500' },
    monsoon: { icon: CloudRain, color: 'blue', name: 'Monsoon', gradient: 'from-blue-400 to-indigo-500' },
    autumn: { icon: Wind, color: 'orange', name: 'Autumn', gradient: 'from-orange-400 to-red-500' },
    winter: { icon: Snowflake, color: 'blue', name: 'Winter', gradient: 'from-blue-500 to-purple-600' },
    'pre-winter': { icon: Cloud, color: 'gray', name: 'Pre Winter', gradient: 'from-gray-400 to-slate-500' }
  };

  const guidance = RUTUCHARYA_GUIDANCE[selectedSeason];
  const seasonConfig = seasonInfo[selectedSeason];
  const SeasonIcon = seasonConfig.icon;

  const getDoshaSpecificGuidance = () => {
    return RUTUCHARYA_GUIDANCE[selectedSeason]?.dosha_considerations?.[selectedDosha] || [];
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Seasonal Guidance (Rutucharya)</h2>
        <p className="text-gray-600">Align your lifestyle with nature's rhythms</p>
      </div>

      {/* 🔘 Dosha Selector */}
      <div className="mb-4">
        <div className="flex gap-2 mb-2">
          {['vata', 'pitta', 'kapha'].map((dosha) => (
            <button
              key={dosha}
              onClick={() => setSelectedDosha(dosha as 'vata' | 'pitta' | 'kapha')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedDosha === dosha
                ? 'bg-purple-600 text-white shadow'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {dosha.charAt(0).toUpperCase() + dosha.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* 🌦️ Season Selector */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {Object.entries(seasonInfo).map(([season, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={season}
                onClick={() => setSelectedSeason(season as Season)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${selectedSeason === season
                  ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{config.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🌿 Current Season Header */}
      <div className={`bg-gradient-to-r ${seasonConfig.gradient} p-6 rounded-xl text-white mb-6`}>
        <div className="flex items-center space-x-3 mb-3">
          <SeasonIcon className="h-8 w-8" />
          <h3 className="text-2xl font-bold">{seasonConfig.name}</h3>
          {selectedSeason === currentSeason && (
            <span className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full">Current Season</span>
          )}
        </div>
        <p className="text-green-100">
          Seasonal wisdom to balance your {selectedDosha.charAt(0).toUpperCase() + selectedDosha.slice(1)} constitution during {seasonConfig.name.toLowerCase()}
        </p>
      </div>

      {/* 🧘 Personalized Dosha Guidance */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-purple-800 mb-4">
          🧘 Personalized for Your {selectedDosha.charAt(0).toUpperCase() + selectedDosha.slice(1)} Constitution
        </h4>
        <ul className="space-y-3">
          {getDoshaSpecificGuidance().map((guidance, index) => (
            <li key={index} className="flex items-start space-x-3 text-purple-700">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
              <span>{guidance}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 🍽️ Food & Lifestyle Sections */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {/* Foods to Favor */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-green-800 mb-4">🥬 Foods to Favor</h4>
          <ul className="space-y-2">
            {guidance.foods_to_favor.map((food, index) => (
              <li key={index} className="flex items-center space-x-2 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="capitalize">{food}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Foods to Avoid */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-red-800 mb-4">🚫 Foods to Minimize</h4>
          <ul className="space-y-2">
            {guidance.foods_to_avoid.map((food, index) => (
              <li key={index} className="flex items-center space-x-2 text-red-700">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="capitalize">{food}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 💡 Lifestyle Tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-blue-800 mb-4">🌟 Lifestyle Recommendations</h4>
        <div className="grid md:grid-cols-2 gap-4">
          {guidance.lifestyle_tips.map((tip, index) => (
            <div key={index} className="flex items-start space-x-2 text-blue-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 🌤️ Transition Notice */}
      {selectedSeason === currentSeason && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-800">
            <strong>Current Season:</strong> These recommendations are specifically for the current {seasonConfig.name.toLowerCase()} season.
            Remember to gradually transition your diet and lifestyle as seasons change.
          </p>
        </div>
      )}
    </div>
  );
};

export default RutucharyaGuide;
