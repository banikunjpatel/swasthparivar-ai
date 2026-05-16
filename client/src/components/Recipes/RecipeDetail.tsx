import React from 'react';
import { Clock, Users, ChefHat, X, BookOpen } from 'lucide-react';

interface RecipeDetailProps {
  recipe: any; // Backend recipe format
  onClose: () => void;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onClose }) => {
  // Handle both old frontend format and new backend format
  const dish = recipe.dish || recipe.name || 'Recipe';
  const ingredients = recipe.recipe?.ingredients || recipe.ingredients || [];
  const steps = recipe.recipe?.steps || recipe.instructions || [];
  const prepTime = recipe.recipe?.prep_mins || recipe.prepTime || 0;
  const cookTime = recipe.recipe?.cook_mins || recipe.cookTime || 0;
  const servings = recipe.servings || 4;
  const notes = recipe.notes || recipe.description || '';
  const region = recipe.region || '';
  const dietType = recipe.dietType || '';

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
            <h1 className="text-3xl font-bold text-white mb-2">{dish}</h1>
            {notes && <p className="text-green-100 mb-4">{notes}</p>}

            <div className="flex items-center space-x-6 text-white">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>{prepTime + cookTime} min</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>{servings} servings</span>
              </div>
              <div className="flex items-center space-x-2">
                <ChefHat className="h-5 w-5" />
                <span className="capitalize">{dietType || 'Vegetarian'}</span>
              </div>
              {region && (
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>{region}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Ingredients */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Ingredients</h3>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="grid md:grid-cols-2 gap-1">
                {ingredients.map((ingredient: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                    <span className="font-medium">{ingredient.qty} {ingredient.unit}</span>
                    <span className="text-gray-600">{ingredient.name}</span>
                    {ingredient.category && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{ingredient.category}</span>
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
              {steps.map((step: string, index: number) => (
                <div key={index} className="flex space-x-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timing Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Cooking Time</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Preparation Time</p>
                <p className="text-2xl font-bold text-blue-600">{prepTime} min</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cooking Time</p>
                <p className="text-2xl font-bold text-blue-600">{cookTime} min</p>
              </div>
            </div>
          </div>

          {/* Ayurvedic Notes */}
          {notes && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Traditional Notes</h3>
              <p className="text-gray-700">{notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;