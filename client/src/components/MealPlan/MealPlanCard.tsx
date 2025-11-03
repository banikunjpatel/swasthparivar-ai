import React from 'react';
import { Recipe, MealType } from '../../types';
import { Clock, Users, ChefHat, Star } from 'lucide-react';

interface MealPlanCardProps {
  recipe: Recipe;
  mealType: MealType;
  onSelectRecipe: (recipe: Recipe) => void;
}

const MealPlanCard: React.FC<MealPlanCardProps> = ({ recipe, mealType, onSelectRecipe }) => {
  const mealTypeColors = {
    breakfast: 'from-yellow-400 to-orange-500',
    lunch: 'from-green-400 to-teal-500',
    dinner: 'from-purple-400 to-indigo-500',
    snack: 'from-pink-400 to-rose-500'
  };

  const mealTypeIcons = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍎'
  };

  const getDoshaScore = () => {
    const avg = (recipe.doshaBalance.vata + recipe.doshaBalance.pitta + recipe.doshaBalance.kapha) / 3;
    return Math.round(avg);
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={() => onSelectRecipe(recipe)}
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${mealTypeColors[mealType]} p-4 rounded-t-xl`}>
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{mealTypeIcons[mealType]}</span>
            <h3 className="font-semibold capitalize">{mealType}</h3>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium">{getDoshaScore()}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h4 className="text-xl font-bold text-gray-800 mb-2">{recipe.name}</h4>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{recipe.description}</p>

        {/* Recipe Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{recipe.prepTime + recipe.cookTime} min</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{recipe.servings} servings</span>
          </div>
          <div className="flex items-center space-x-1">
            <ChefHat className="h-4 w-4" />
            <span className="capitalize">{recipe.difficulty}</span>
          </div>
        </div>

        {/* Nutrition Summary */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Calories</span>
            <span className="font-semibold">{recipe.nutrition.calories}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Protein</span>
            <span className="font-semibold">{recipe.nutrition.protein}g</span>
          </div>
        </div>

        {/* Dosha Balance */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Dosha Balance</p>
          <div className="flex space-x-2">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>V</span>
                <span>{recipe.doshaBalance.vata}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full" 
                  style={{ width: `${recipe.doshaBalance.vata}%` }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>P</span>
                <span>{recipe.doshaBalance.pitta}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-orange-500 h-1.5 rounded-full" 
                  style={{ width: `${recipe.doshaBalance.pitta}%` }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>K</span>
                <span>{recipe.doshaBalance.kapha}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-green-500 h-1.5 rounded-full" 
                  style={{ width: `${recipe.doshaBalance.kapha}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {recipe.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MealPlanCard;