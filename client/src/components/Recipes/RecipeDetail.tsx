import React from 'react';
import { Recipe } from '../../types';
import { Clock, Users, ChefHat, X, Star, BookOpen } from 'lucide-react';

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onClose }) => {
  const getDoshaScore = () => {
    const avg = (recipe?.doshaBalance?.vata + recipe?.doshaBalance?.pitta + recipe?.doshaBalance?.kapha) / 3;
    return Math.round(avg);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-600 to-teal-600 p-6 rounded-t-xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="pr-12">
            <h1 className="text-3xl font-bold text-white mb-2">{recipe.name}</h1>
            <p className="text-green-100 mb-4">{recipe.description}</p>

            <div className="flex items-center space-x-6 text-white">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>{recipe.prepTime + recipe.cookTime} min</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>{recipe.servings} servings</span>
              </div>
              <div className="flex items-center space-x-2">
                <ChefHat className="h-5 w-5" />
                <span className="capitalize">{recipe.difficulty}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 fill-current" />
                <span>{getDoshaScore()}% Balanced</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Nutrition & Dosha Info */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Nutrition Facts */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Nutrition Facts
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Calories</span>
                  <span className="font-semibold">{recipe.nutrition.calories}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Protein</span>
                  <span className="font-semibold">{recipe.nutrition.protein}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Carbohydrates</span>
                  <span className="font-semibold">{recipe.nutrition.carbs}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fat</span>
                  <span className="font-semibold">{recipe.nutrition.fat}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fiber</span>
                  <span className="font-semibold">{recipe.nutrition.fiber}g</span>
                </div>
              </div>
            </div>

            {/* Dosha Balance */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Dosha Balance</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Vata (Air & Space)</span>
                    <span>{recipe.doshaBalance.vata}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${recipe.doshaBalance.vata}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Pitta (Fire & Water)</span>
                    <span>{recipe.doshaBalance.pitta}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${recipe.doshaBalance.pitta}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Kapha (Earth & Water)</span>
                    <span>{recipe.doshaBalance.kapha}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${recipe.doshaBalance.kapha}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Ingredients</h3>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="grid md:grid-cols-2 gap-1">
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                    <span className="font-medium">{ingredient.quantity} {ingredient.unit}</span>
                    <span className="text-gray-600">{ingredient.name}</span>
                    {ingredient.optional && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">optional</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Instructions</h3>
            <div className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <div key={index} className="flex space-x-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 pt-1">{instruction}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Substitutes */}
          {recipe.substitutes && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Ingredient Substitutes</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="space-y-3">
                  {Object.entries(recipe.substitutes).map(([ingredient, alternatives]) => (
                    <div key={ingredient}>
                      <span className="font-medium text-gray-800">{ingredient}:</span>
                      <span className="text-gray-600 ml-2">{alternatives.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Recipe Tags</h3>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;