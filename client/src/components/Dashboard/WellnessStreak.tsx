import React from 'react';
import { Calendar, Flame, Target, Award } from 'lucide-react';

interface WellnessStreakProps {
  currentStreak: number;
  longestStreak: number;
  weeklyGoal: number;
  completedThisWeek: number;
}

const WellnessStreak: React.FC<WellnessStreakProps> = ({
  currentStreak,
  longestStreak,
  weeklyGoal,
  completedThisWeek
}) => {
  const streakDays = Array.from({ length: 7 }, (_, i) => {
    const isCompleted = i < completedThisWeek;
    const isToday = i === new Date().getDay();
    return { isCompleted, isToday };
  });

  const progressPercentage = (completedThisWeek / weeklyGoal) * 100;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Wellness Streak</h3>
        <div className="flex items-center space-x-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <span className="text-2xl font-bold text-orange-600">{currentStreak}</span>
          <span className="text-sm text-gray-600">days</span>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">This Week</span>
          <span className="text-sm text-gray-600">{completedThisWeek}/{weeklyGoal}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Daily Streak Visualization */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700">Daily Progress</span>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-500">This Week</span>
          </div>
        </div>
        <div className="flex space-x-2">
          {streakDays.map((day, index) => (
            <div
              key={index}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                day.isCompleted
                  ? 'bg-gradient-to-br from-green-500 to-teal-500 text-white shadow-md'
                  : day.isToday
                  ? 'bg-blue-100 text-blue-600 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {day.isCompleted ? '✓' : index + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <Flame className="h-4 w-4 text-white" />
          </div>
          <div className="text-lg font-bold text-orange-700">{currentStreak}</div>
          <div className="text-xs text-orange-600">Current Streak</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <Award className="h-4 w-4 text-white" />
          </div>
          <div className="text-lg font-bold text-purple-700">{longestStreak}</div>
          <div className="text-xs text-purple-600">Best Streak</div>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-700">
            {currentStreak >= 7 
              ? "Amazing! You're building a strong wellness habit 🌟"
              : currentStreak >= 3
              ? "Great progress! Keep the momentum going 💪"
              : "Every journey begins with a single step 🌱"
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default WellnessStreak;