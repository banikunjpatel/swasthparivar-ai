import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Download, RefreshCw } from 'lucide-react';
import { Recipe, MealType } from '../../types';
import MealPlanCard from './MealPlanCard';
import { SAMPLE_RECIPES } from '../../data/ayurvedic-data';

interface WeeklyMealPlanProps {
  onSelectRecipe: (recipe: Recipe) => void;
}

const WeeklyMealPlan: React.FC<WeeklyMealPlanProps> = ({ onSelectRecipe }) => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState(0);

  // Mock data - in a real app, this would come from state/API
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  // Generate sample meal plan
  const generateMealPlan = () => {
    const plan: { [key: string]: { [key in MealType]: Recipe } } = {};
    
    weekDays.forEach(day => {
      plan[day] = {
        breakfast: SAMPLE_RECIPES[0], // Kitchari for breakfast
        lunch: SAMPLE_RECIPES[0], // Kitchari for lunch
        dinner: SAMPLE_RECIPES[0], // Kitchari for dinner
        snack: SAMPLE_RECIPES[1] // Golden Milk for snack
      };
    });

    return plan;
  };

  const [mealPlan] = useState(generateMealPlan());

  const getWeekDateRange = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + (currentWeek * 7));
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return {
      start: startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  };

  const weekRange = getWeekDateRange();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Weekly Meal Plan</h2>
            <p className="text-gray-600">Personalized for your Dosha balance</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Shopping List
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrentWeek(currentWeek - 1)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <h3 className="text-lg font-semibold text-gray-800">
            {weekRange.start} - {weekRange.end}
          </h3>
          
          <button
            onClick={() => setCurrentWeek(currentWeek + 1)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Day Selector (Mobile) */}
      <div className="md:hidden">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex space-x-2 overflow-x-auto">
            {weekDays.map((day, index) => (
              <button
                key={day}
                onClick={() => setSelectedDay(index)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedDay === index
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day) => (
            <div key={day} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 text-center p-3 bg-white rounded-lg shadow">
                {day}
              </h3>
              
              <div className="space-y-3">
                {mealTypes.map((mealType) => (
                  <div key={mealType} className="min-h-[200px]">
                    <MealPlanCard
                      recipe={mealPlan[day][mealType]}
                      mealType={mealType}
                      onSelectRecipe={onSelectRecipe}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="space-y-4">
          {mealTypes.map((mealType) => (
            <MealPlanCard
              key={mealType}
              recipe={mealPlan[weekDays[selectedDay]][mealType]}
              mealType={mealType}
              onSelectRecipe={onSelectRecipe}
            />
          ))}
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Nutrition Summary</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">2,450</div>
            <div className="text-sm text-blue-600">Avg Daily Calories</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-2xl font-bold text-green-700">85%</div>
            <div className="text-sm text-green-600">Dosha Balance</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="text-2xl font-bold text-orange-700">92g</div>
            <div className="text-sm text-orange-600">Avg Daily Protein</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">35g</div>
            <div className="text-sm text-purple-600">Avg Daily Fiber</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyMealPlan;