import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { MealType } from '../../types';

type ViewMode = 'day' | 'week' | 'month';

interface UserMealPlan {
  weekStart: string;
  days: {
    day: string;
    meals: {
      breakfast?: string;
      lunch?: string;
      dinner?: string;
      snack?: string;
    };
  }[];
}

interface MealPlanViewProps {
  mealPlan: UserMealPlan;
  onSelectRecipe: (recipe: any) => void; 
}

const MealPlanView: React.FC<MealPlanViewProps> = ({ mealPlan, onSelectRecipe }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  const getMealForSlot = (date: Date, mealType: MealType): string => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dayEntry = mealPlan.days.find((d) => d.day === dayName);
    return dayEntry?.meals?.[mealType] || 'Not planned';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getWeekDates = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  const MealCard: React.FC<{ mealName: string; mealType: MealType; compact?: boolean }> = ({
    mealName,
    mealType,
    compact = false,
  }) => {
    const mealColors = {
      breakfast: 'bg-yellow-100 border-yellow-300',
      lunch: 'bg-green-100 border-green-300',
      dinner: 'bg-purple-100 border-purple-300',
      snack: 'bg-pink-100 border-pink-300',
    };

    const mealIcons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎',
    };

    return (
      <div
        className={`${mealColors[mealType]} border-2 rounded-lg p-3 ${
          compact ? 'h-[100px]' : 'h-[120px]'
        }`}
        onClick={() => onSelectRecipe(mealName)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{mealIcons[mealType]}</span>
            <span className="text-xs font-medium capitalize text-gray-600">{mealType}</span>
          </div>
        </div>
        <h4 className={`font-semibold text-gray-800 ${compact ? 'text-xs' : 'text-sm'}`}>
          {mealName}
        </h4>
      </div>
    );
  };

  const renderDayView = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800">{formatDate(currentDate)}</h3>
      </div>
      <div className="grid gap-6">
        {mealTypes.map((mealType) => (
          <div key={mealType} className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 capitalize">{mealType}</h4>
            <MealCard mealName={getMealForSlot(currentDate, mealType)} mealType={mealType} />
          </div>
        ))}
      </div>
    </div>
  );

  const renderWeekView = () => {
    const weekDates = getWeekDates();
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-7 gap-4">
          {weekDates.map((date, index) => (
            <div key={index} className="text-center">
              <h4 className="font-semibold text-gray-800 mb-4">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              <div className="space-y-3">
                {mealTypes.map((mealType) => (
                  <MealCard
                    key={mealType}
                    mealName={getMealForSlot(date, mealType)}
                    mealType={mealType}
                    compact
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Meal Plan</h2>
            <p className="text-gray-600">Your personalized Ayurvedic nutrition plan</p>
          </div>
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            {(['day', 'week'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <span className="text-lg font-semibold text-gray-800">
              {viewMode === 'day' && formatDate(currentDate)}
              {viewMode === 'week' && `Week of ${formatDate(getWeekDates()[0])}`}
            </span>
          </div>
          <button
            onClick={() => navigateDate('next')}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'week' && renderWeekView()}
      </div>
    </div>
  );
};

export default MealPlanView;
