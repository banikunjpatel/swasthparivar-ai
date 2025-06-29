import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import Header from './components/Layout/Header';
import PrakritiAssessment from './components/Assessment/PrakritiAssessment';
import DoshaCard from './components/Dashboard/DoshaCard';
import WellnessStreak from './components/Dashboard/WellnessStreak';
import CulturalWellnessCard from './components/Dashboard/CulturalWellnessCard';
import MealPlanView from './components/MealPlan/MealPlanView';
import RecipeDetail from './components/Recipes/RecipeDetail';
import DinacharyaGuide from './components/Guidance/DinacharyaGuide';
import RutucharyaGuide from './components/Guidance/RutucharyaGuide';
import { DoshaType, DoshaBalance, Recipe, Season } from './types';
import { getCurrentSeason, getDoshaRecommendations } from './utils/ayurvedic-logic';
import { TrendingUp, Calendar, BookOpen, Activity, Target } from 'lucide-react';
import apiClient from './lib/api';
import NoMealPlan from './components/MealPlan/NoMealPlan';
import NoFamilyMemberPrompt from './components/Onboarding/NoFamilyMemberPrompt';
import { SAMPLE_MEAL_PLAN } from './data/ayurvedic-data';


function AppContent() {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [currentSeason, setCurrentSeason] = useState<Season>('spring');
  const { user, updateUser } = useAuth();
  const [guestData, setGuestData] = useState<{ prakriti: DoshaType; currentDosha: DoshaBalance } | null>(null);

  useEffect(() => {
    setCurrentSeason(getCurrentSeason());
  }, []);

  const handlePrakritiComplete = async (prakriti: DoshaType, balance: DoshaBalance) => {
    try {
      const response = await apiClient.completeAssessment({
        prakriti,
        currentDosha: balance
      });

      if (response.data?.user) {
        updateUser(response.data.user); // Logged-in user
      } else {
        setGuestData({ prakriti, currentDosha: balance }); // Guest fallback
      }
    } catch (error) {
      console.warn('Guest user or API failed. Storing in guest state.');
      setGuestData({ prakriti, currentDosha: balance });
    }

    setCurrentSection('dashboard');
  };

  const isAssessmentDone = user?.assessmentCompleted || guestData !== null;
  const prakriti: any = user?.prakriti || guestData?.prakriti || null;
  const currentDosha = user?.currentDosha || guestData?.currentDosha;

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" />
        <div className="relative">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-4xl">🙏</span>
            <div>
              <h1 className="text-3xl font-bold">
                Namaste, {user?.name || 'Wellness Seeker'}
              </h1>
              <p className="text-green-100 text-lg">
                Your personalized Ayurvedic nutrition companion for optimal health and balance.
              </p>
            </div>
          </div>
          {!isAssessmentDone && (
            <button
              onClick={() => setCurrentSection('assessment')}
              className="mt-4 bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors shadow-lg"
            >
              🧘‍♀️ Discover Your Constitution
            </button>
          )}
        </div>
      </div>
      <div>
      {/* {!user && ( */}
      <div className="text-center mt-16">
        <div className="text-gray-700 text-xl font-semibold mb-4">What you can do on AyurMeal:</div>
        <div className="grid md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 border border-green-100 hover:shadow-lg transition">
            <div className="text-3xl mb-2">👨‍👩‍👧</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Add Family Members</h3>
            <p className="text-sm text-gray-600">
              Track doshas and wellness goals for each family member individually.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-green-100 hover:shadow-lg transition">
            <div className="text-3xl mb-2">🍽️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Generate Meal Plans</h3>
            <p className="text-sm text-gray-600">
              Personalized meal plans based on constitution for a week or month.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-green-100 hover:shadow-lg transition">
            <div className="text-3xl mb-2">🛒</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Get Grocery Lists</h3>
            <p className="text-sm text-gray-600">
              Auto-generated lists for planned meals — shop smarter, waste less.
            </p>
          </div>
        </div>
      </div>
  
      </div>

      {isAssessmentDone ? (
        <>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800">85%</div>
              <div className="text-sm text-gray-600">Dosha Balance</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800">7</div>
              <div className="text-sm text-gray-600">Days Planned</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800">24</div>
              <div className="text-sm text-gray-600">Recipes Available</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800 capitalize">{currentSeason}</div>
              <div className="text-sm text-gray-600">Current Season</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {prakriti && currentDosha && (
                <DoshaCard prakriti={prakriti} currentBalance={currentDosha} />
              )}

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Target className="h-6 w-6 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-800">Today's Recommendations</h3>
                </div>
                <div className="space-y-3">
                  {prakriti &&
                    getDoshaRecommendations(prakriti).slice(0, 3).map((rec, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                        <p className="text-sm text-gray-700">{rec}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <WellnessStreak currentStreak={5} longestStreak={12} weeklyGoal={7} completedThisWeek={5} />

              {prakriti && (
                <CulturalWellnessCard userDosha={prakriti} currentSeason={currentSeason} />
              )}

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setCurrentSection('meal-plan')}
                    className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg"
                  >
                    🍽️ View Meal Plan
                  </button>
                  <button
                    onClick={() => setCurrentSection('recipes')}
                    className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg"
                  >
                    📚 Browse Recipes
                  </button>
                  <button
                    onClick={() => setCurrentSection('guidance')}
                    className="w-full text-left p-3 bg-orange-50 hover:bg-orange-100 rounded-lg"
                  >
                    🧘‍♀️ Daily Guidance
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <NoFamilyMemberPrompt onAddFamily={() => setCurrentSection('family')} />
      )}
    </div>
  );

  const renderContent = () => {
    switch (currentSection) {
      case 'dashboard':
        return renderDashboard();

      case 'assessment':
        return <PrakritiAssessment onComplete={handlePrakritiComplete} />;

      case 'meal-plan':
        return (<MealPlanView
          mealPlan={SAMPLE_MEAL_PLAN}
          onSelectRecipe={(recipe: any) => {
            console.log('User selected:', recipe.name);
            setSelectedRecipe(recipe); // Updated to set selected recipe
          }}
        />)
        // return isAssessmentDone ? (
        //   <MealPlanView onSelectRecipe={setSelectedRecipe} />
        // ) : (
        //   <NoMealPlan onGenerate={() => setCurrentSection('dashboard')} />
        // );

      case 'recipes':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Recipe Library</h2>
            <p className="text-gray-600">Coming soon – Ayurvedic recipes.</p>
          </div>
        );

      case 'guidance':
        return isAssessmentDone && prakriti ? (
          <div className="space-y-8">
            <DinacharyaGuide userDosha={prakriti} />
            <RutucharyaGuide userDosha={prakriti} currentSeason={currentSeason} />
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">Complete assessment to get personalized guidance.</div>
        );

      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50">
      <Header onNavigate={setCurrentSection} currentSection={currentSection} />

      <main className="max-w-7xl mx-auto px-4 py-8">{renderContent()}</main>

      {selectedRecipe && (
        <RecipeDetail recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
