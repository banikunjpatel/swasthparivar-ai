import React, { useState, useEffect } from 'react';
import { Leaf, Sun, CloudRain, Wind, Snowflake, Users, Clock, Home, Utensils, Heart } from 'lucide-react';
import apiClient from '../../apiCall/api';

interface FamilyRhythm {
  morningAnchor: string;
  mealtimeAnchor: string;
  eveningAnchor: string;
  whyThisWorks: string;
}

interface SeasonAndElements {
  natureThisSeason: string;
  familyBalance: string;
  familyNeeds: string;
  kitchenAction: string;
  foodsToInclude: string[];
  foodsToAvoid: string[];
  homeAction: string;
  togetherAction: string;
  whyThisWorks: string;
}

interface GuidanceData {
  season: string;
  familyRhythm: FamilyRhythm;
  seasonAndElements: SeasonAndElements;
}

interface FamilyGuidanceResponse {
  season: string;
  year: number;
  guidance: GuidanceData;
  generatedAt: string;
  fromCache: boolean;
}

const seasonConfig: Record<string, { icon: any; color: string; gradient: string; name: string }> = {
  summer: { icon: Sun, color: 'yellow', gradient: 'from-yellow-400 to-orange-500', name: 'Summer' },
  monsoon: { icon: CloudRain, color: 'blue', gradient: 'from-blue-400 to-indigo-500', name: 'Monsoon' },
  autumn: { icon: Wind, color: 'orange', gradient: 'from-orange-400 to-red-500', name: 'Autumn' },
  winter: { icon: Snowflake, color: 'blue', gradient: 'from-blue-500 to-purple-600', name: 'Winter' },
  spring: { icon: Leaf, color: 'green', gradient: 'from-green-400 to-emerald-500', name: 'Spring' },
};

const FamilyGuidance: React.FC = () => {
  const [guidance, setGuidance] = useState<FamilyGuidanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGuidance();
  }, []);

  const fetchGuidance = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user ID from localStorage
      const userId = await apiClient.getCurrentUserId();
      if (!userId) {
        setError('Please log in to view family guidance');
        setLoading(false);
        return;
      }
      
      const response = await apiClient.getFamilyGuidance(userId);
      if (response.error) {
        setError(response.error);
      } else {
        setGuidance(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching family guidance:', err);
      setError('Failed to load family guidance');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your family's seasonal guidance...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-800 mb-4">{error}</p>
          <button
            onClick={fetchGuidance}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!guidance) {
    return null;
  }

  const { season, guidance: guidanceData } = guidance;
  const config = seasonConfig[season.toLowerCase()] || seasonConfig.summer;
  const SeasonIcon = config.icon;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Leaf className="w-8 h-8 text-green-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Seasonal Family Guidance</h1>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>For your whole family</span>
          </div>
        </div>
        <p className="text-gray-600">Simple guidance for your family's balance and wellbeing</p>
      </div>

      {/* Current Season Banner */}
      <div className={`bg-gradient-to-r ${config.gradient} p-6 rounded-xl text-white shadow-lg`}>
        <div className="flex items-center space-x-3 mb-2">
          <SeasonIcon className="h-8 w-8" />
          <h2 className="text-2xl font-bold">{config.name} {guidance.year}</h2>
        </div>
        <p className="text-white/90">Personalized for your family's unique balance</p>
      </div>

      {/* Section 1: This Season's Family Rhythm */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-blue-600">1</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">This Season's Family Rhythm</h2>
        </div>
        <p className="text-gray-600 mb-6">Three simple anchors to bring balance to your days together.</p>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Morning */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-5">
            <div className="flex items-center space-x-2 mb-3">
              <Sun className="w-6 h-6 text-orange-600" />
              <h3 className="font-semibold text-gray-800">Morning</h3>
            </div>
            <p className="text-sm text-gray-700">{guidanceData.familyRhythm.morningAnchor}</p>
          </div>

          {/* Mealtime */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-center space-x-2 mb-3">
              <Utensils className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-gray-800">Mealtime</h3>
            </div>
            <p className="text-sm text-gray-700">{guidanceData.familyRhythm.mealtimeAnchor}</p>
          </div>

          {/* Evening */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-5">
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-6 h-6 text-purple-600" />
              <h3 className="font-semibold text-gray-800">Evening</h3>
            </div>
            <p className="text-sm text-gray-700">{guidanceData.familyRhythm.eveningAnchor}</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs">✓</span>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">Why this works:</p>
              <p className="text-sm text-blue-800">{guidanceData.familyRhythm.whyThisWorks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Season + Elements */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-orange-600">2</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Season + Elements</h2>
        </div>
        <p className="text-gray-600 mb-6">What nature is doing and what your family needs.</p>

        {/* Nature This Season */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
            <SeasonIcon className="w-5 h-5 text-gray-600" />
            <span>Nature This Season</span>
          </h3>
          <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{guidanceData.seasonAndElements.natureThisSeason}</p>
        </div>

        {/* Family Balance */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-600" />
            <span>Your Family's Balance</span>
          </h3>
          <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{guidanceData.seasonAndElements.familyBalance}</p>
        </div>

        {/* Family Needs */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
            <Heart className="w-5 h-5 text-gray-600" />
            <span>What Your Family Needs</span>
          </h3>
          <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{guidanceData.seasonAndElements.familyNeeds}</p>
        </div>

        {/* Kitchen Action */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
            <Utensils className="w-5 h-5 text-green-600" />
            <span>Kitchen</span>
          </h3>
          <p className="text-gray-700 mb-4">{guidanceData.seasonAndElements.kitchenAction}</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Foods to Include */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-green-800 mb-3">Include</h4>
              <div className="flex flex-wrap gap-2">
                {guidanceData.seasonAndElements.foodsToInclude.map((food, i) => (
                  <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {food}
                  </span>
                ))}
              </div>
            </div>

            {/* Foods to Avoid */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-red-800 mb-3">Avoid</h4>
              <div className="flex flex-wrap gap-2">
                {guidanceData.seasonAndElements.foodsToAvoid.map((food, i) => (
                  <span key={i} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    {food}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Home Action */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
            <Home className="w-5 h-5 text-blue-600" />
            <span>Home</span>
          </h3>
          <p className="text-gray-700 bg-blue-50 border border-blue-200 rounded-lg p-4">{guidanceData.seasonAndElements.homeAction}</p>
        </div>

        {/* Together Action */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span>Together</span>
          </h3>
          <p className="text-gray-700 bg-purple-50 border border-purple-200 rounded-lg p-4">{guidanceData.seasonAndElements.togetherAction}</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start space-x-2">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs">✓</span>
            </div>
            <div>
              <p className="text-sm font-medium text-orange-900 mb-1">Why this works:</p>
              <p className="text-sm text-orange-800">{guidanceData.seasonAndElements.whyThisWorks}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyGuidance;
