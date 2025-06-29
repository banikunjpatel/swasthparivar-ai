import React from 'react';
import { Users, Award, Sparkles } from 'lucide-react';

const NoMealPlan: React.FC<{ onGenerate: () => void }> = ({ onGenerate }) => {
  return (
    <div className="max-w-3xl mx-auto text-center py-16">
      <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
        <span role="img" aria-label="meal-icon">🍽️</span>
        AI Meal Planning
      </h2>
      <p className="text-gray-600 mb-6 text-lg">Personalized nutrition plans for your family</p>

      <button
        onClick={onGenerate}
        className="mb-10 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow"
      >
        ✚ Generate New Plan
      </button>

      <div className="text-gray-500 text-5xl mb-4">🍴</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Meal Plans Yet</h3>
      <p className="text-gray-500 mb-10 max-w-md mx-auto">
        Create your first AI-powered meal plan tailored to your family's needs.
      </p>

      <div className="bg-white shadow rounded-lg p-6 space-y-6 text-left">
        <div className="flex items-start gap-4">
          <Users className="text-orange-500 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-800">1. Add Family Members</h4>
            <p className="text-gray-600 text-sm">Set up profiles with dietary preferences and health conditions</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <Award className="text-orange-500 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-800">2. Complete Prakriti Assessment</h4>
            <p className="text-gray-600 text-sm">Discover individual Ayurvedic constitutions for personalized recommendations</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <Sparkles className="text-orange-500 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-800">3. Generate Meal Plan</h4>
            <p className="text-gray-600 text-sm">Let AI create balanced, nutritious meals for your entire family</p>
          </div>
        </div>
      </div>

      <button
        onClick={onGenerate}
        className="mt-10 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow"
      >
        ✚ Generate Your First Meal Plan
      </button>
    </div>
  );
};

export default NoMealPlan;
