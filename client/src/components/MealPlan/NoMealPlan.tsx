import React, { useState } from 'react';
import { Users, Award, Sparkles } from 'lucide-react';
import apiClient from '../../apiCall/api';
import LoginPromptDialog from '../../utils/LoginPromptDialog';
interface NoMealPlanProps {
  members: any[]; // You can replace `any` with `FamilyMember[]` if you have that type
  userId: string;
  onPlanGenerated: (data: any) => void;
}
const NoMealPlan: React.FC<NoMealPlanProps> = ({ members, userId, onPlanGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const handleGenerate = async () => {
    const currentUserId = userId;

    if (!currentUserId) {
      setShowLoginPrompt(true);
      return;
    }
    try {
      setLoading(true);
      const response = await apiClient.getMealPlan(userId);
      onPlanGenerated(response.data); // pass data back to parent
    } catch (err) {
      console.error('Failed to generate meal plan:', err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-3xl mx-auto text-center py-16">
      <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
        <span role="img" aria-label="meal-icon">🍽️</span>
        AI Meal Planning
      </h2>
      <p className="text-gray-600 mb-6 text-lg">Personalized nutrition plans for your family</p>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="mb-10 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow"
      >
        {loading ? 'Generating...' : '✚ Generate New Plan'}
      </button>

      <div className="text-gray-500 text-5xl mb-4">🍴</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Meal Plans Yet</h3>
      <p className="text-gray-500 mb-10 max-w-md mx-auto">
        Create your first AI-powered meal plan tailored to your family's needs.
      </p>

      {members.length === 0 && (
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
              <p className="text-gray-600 text-sm">Discover individual body type assessments for personalized recommendations</p>
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
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="mt-10 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow"
      >
        {loading ? 'Generating...' : '✚ Generate Your First Meal Plan'}
      </button>
      <LoginPromptDialog
        open={showLoginPrompt}
        title="Login Required"
        description="You need to be signed in to generate a personalized meal plan."
        onClose={() => setShowLoginPrompt(false)}
      />
    </div>
  );
};

export default NoMealPlan;
