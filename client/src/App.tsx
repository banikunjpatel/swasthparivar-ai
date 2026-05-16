import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { useOnboarding } from './hooks/useOnboarding';
import Header from './components/Layout/Header';
import DoshaCard from './components/Dashboard/DoshaCard';
import CulturalWellnessCard from './components/Dashboard/CulturalWellnessCard';
import DailyTaskCard, { DailyTask } from './components/Dashboard/DailyTaskCard';
import Dashboard from './components/Dashboard/Dashboard';
import MealPlanView from './components/MealPlan/MealPlanView';
import RecipeDetail from './components/Recipes/RecipeDetail';
import RutucharyaGuide from './components/Guidance/RutucharyaGuide';
import OnboardingFlow from './components/Onboarding/OnboardingFlow';
import { DoshaType, DoshaBalance, Recipe, Season } from './types';
import { getCurrentSeason } from './utils/ayurvedic-logic';
import { TrendingUp, Calendar, BookOpen, Activity, UserIcon, CalendarCheck, Heart } from 'lucide-react';
import apiClient from './apiCall/api';
import NoMealPlan from './components/MealPlan/NoMealPlan';
import FamilyMembers from './components/FamilyMember/FamilyMembers';
import { GroceryList } from './components/Grocery/GroceryList';
import { getWeekStartDate, transformMealPlan } from './utils/transformMealPlan';
import { format } from 'date-fns';
import WellnessTips from './components/Guidance/WellnessTips';
import Footer from './components/Layout/Footer';
import HomePage from './components/Home/HomePage';


function AppContent() {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [fetchedRecipe, setFetchedRecipe] = useState<Recipe | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [isAssessmentDone] = useState(false);
  const [currentSeason, setCurrentSeason] = useState<Season>('spring');
  const [mealPlan, setMealPlan] = useState<any[]>([]);
  const [todayMealPlan, setTodayMealPlan] = useState<any>();
  const [userId, setUserId] = useState<string>('');
  const [doshaName, setDoshaName] = useState<string>('');
  const [doshaPerc, setDoshaPerc] = useState<string>('');
  const [guestData, setGuestData] = useState<{ prakriti: DoshaType; currentDosha: DoshaBalance } | null>(null);
  const [members, setMembers] = useState([]);
  const [todayTask, setTodayTask] = useState<DailyTask | null>(null);
  const { user, isAuthenticated, updateUser } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Onboarding state
  const { needsOnboarding, isLoading: onboardingLoading } = useOnboarding(user?.userId || null, isAuthenticated ?? false);
  const [showOnboarding, setShowOnboarding] = useState(needsOnboarding);
  type Meal = {
    base: string;
    customizations: string;
  };
  type DayPlan = {
    meals: {
      breakfast: Meal;
      lunch: Meal;
      dinner: Meal;
    }

  };
  type Props = {
    todayPlan: DayPlan;
  };

  const tagColorMap: Record<string, string> = {
    breakfast: "bg-yellow-100 text-yellow-800",
    lunch: "bg-green-100 text-green-800",
    dinner: "bg-orange-100 text-orange-800",
  };

  const boxColorMap: Record<string, string> = {
    breakfast: "bg-yellow-50 border-yellow-200",
    lunch: "bg-green-50 border-green-200",
    dinner: "bg-orange-50 border-orange-200",
  };
  const features = [
    {
      icon: <UserIcon className="w-10 h-10 text-blue-500" />,
      title: 'Family Profiles',
      description: 'Individual dosha analysis and health tracking for each family member',
    },
    {
      icon: <CalendarCheck className="w-10 h-10 text-green-500" />,
      title: 'AI Meal Planning',
      description: 'Personalized Indian meals based on natural living principles and preferences',
    },
    {
      icon: <Heart className="w-10 h-10 text-purple-500" />,
      title: 'Wellness Guidance',
      description: 'Daily tips for yoga, meditation, and seasonal wellness practices',
    },
  ];
  const fetchMembers = async () => {
    try {
      const userId = await apiClient.getCurrentUserId();
      const res = await apiClient.getFamilyMembers(userId);
      // const highestDosha = Object.entries(res?.data[0]?.doshaStats).reduce((max: any, current: any) => {
      //   return current[1] > max[1] ? current : max;
      // }, ["", 0]);

      // const [doshaName, percentage] = highestDosha;

      // setDoshaName(`${doshaName.charAt(0).toUpperCase() + doshaName.slice(1)}`);
      // setDoshaPerc(percentage.toString());
      setUserId(user?.userId || '');
      setMembers(res.data || []);
    } catch (err) {
    }
  };
  const fetchTodayTask = async (uid: string) => {
    try {
      const res = await apiClient.getTodayTask(uid);
      if (res.data && !res.error) setTodayTask(res.data);
    } catch (err) {
    }
  };

  const fetchMealPlan = async () => {
    if (userId && members && members.length > 0) {
      try {
        const res = await apiClient.getMealPlan(userId);
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const transformed = transformMealPlan(res.data);
          setMealPlan(transformed);
          const today = format(new Date(), "EEEE"); // e.g., "Wednesday"
          const matchedWeek = transformed.find((item: any) =>
            format(new Date(item.weekStart), "yyyy-MM-dd") === getWeekStartDate(new Date())
          );
          const todayData = matchedWeek?.days?.find((dayObj: any) => dayObj.day === today);
          setTodayMealPlan(todayData);
        }
      } catch (err) {
        // Don't set mealPlan to [] to avoid overriding generated plans
      }
    }
  };
  useEffect(() => {
    if (!user) {
      setUserId('');
      setMembers([]);
      setMealPlan([]);
      setSelectedRecipe(null);
      setGuestData(null);
      setFetchedRecipe(null);  // if defined
      setLoadingRecipe(false);
      setCurrentSection('dashboard'); // optional: reset UI view
      setShowOnboarding(false);
    }
  }, [user]);

  // Update showOnboarding when needsOnboarding changes
  useEffect(() => {
    setShowOnboarding(needsOnboarding);
  }, [needsOnboarding]);
  useEffect(() => {
    if (fetchedRecipe) {
      setSelectedRecipe(fetchedRecipe);
    }
  }, [fetchedRecipe]);

  useEffect(() => {
    if (user) {
      fetchMembers();
      if (user.userId) fetchTodayTask(user.userId);
    }
  }, [user]);

  useEffect(() => {
    setCurrentSeason(getCurrentSeason());
    if (user && members && members.length > 0) {
      fetchMealPlan();
    }
  }, [members, user]);

  const prakriti: any = user?.prakriti || guestData?.prakriti || null;
  const currentDosha = user?.currentDosha || guestData?.currentDosha;

  /**
   * Handle onboarding completion
   * Updates user object in localStorage and state, then hides modal
   */
  const handleOnboardingComplete = () => {
    if (user) {
      const updatedUser = { ...user, onboardingCompleted: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      updateUser({ onboardingCompleted: true });
    }
    fetchMembers();
    setShowOnboarding(false);
  };
  const TodayMealCard: React.FC<Props> = ({ todayPlan }) => {
    const meals = ["breakfast", "lunch", "dinner"] as const;

    return (
      <div className="mx-auto">
        <h2 className="text-lg font-bold mb-4 flex items-center text-gray-800">
          🍽️ <span className="ml-2">Today's Meal Highlights</span>
        </h2>

        {meals.map((mealKey) => {
          const meal = todayPlan.meals[mealKey];
          return (
            <div
              key={mealKey}
              className={`rounded-xl px-4 py-3 mb-3 border ${boxColorMap[mealKey]}`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-sm capitalize text-gray-800">{mealKey}</h3>
                <span className={`text-xs rounded-full px-2.5 py-1 ${tagColorMap[mealKey]} font-semibold`}>
                  {mealKey === "breakfast" ? "Vata ↓" : mealKey === "lunch" ? "Tridoshic" : "Kapha ↓"}
                </span>
              </div>
              <p className="text-sm mt-1.5 text-gray-700">{meal.base}</p>
              {meal?.customizations && (
                typeof meal?.customizations === "string" ? (
                  <p className="text-xs text-gray-600 mt-1 italic">{meal.customizations}</p>
                ) : (
                  <ul className="text-xs text-gray-600 mt-1 italic pl-4 list-disc space-y-0.5">
                    {Object.entries(meal?.customizations).map(([member, customization]) => (
                      <li key={member}>
                        <strong className="capitalize">{member}:</strong> {String(customization)}
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          );
        })}
      </div>
    );
  };
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Main Greeting Section */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-sm">
        <div className="absolute top-4 right-4 opacity-30 text-4xl">🕉️</div>

        <div className="relative">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-3xl">🙏</span>
            <div>
              <h1 className="text-2xl font-bold">
                Namaste, {user?.name || 'Wellness Seeker'} 🙏
              </h1>
              <p className="text-white/90 text-sm mt-1">
                Natural family living rooted in your family's nature
              </p>
            </div>
          </div>

          {isAuthenticated && (
            <div className="flex items-center gap-4 text-sm text-white/90 mt-3">
              <span>📅 {format(new Date(), 'EEEE, dd MMMM yyyy')}</span>
              <span>☀️ {currentSeason} Season</span>
              {user?.region && <span>📍 {user.region}</span>}
              <span>👥 {members.length} Family Members</span>
              <span>✨ AI-Powered Wellness</span>
            </div>
          )}

          {!isAssessmentDone && !members.length && (
            <button
              onClick={() => {
                if (isAuthenticated) {
                  setCurrentSection('family');
                } else {
                  setShowAuthModal(true);
                }
              }}
              className="mt-4 bg-white text-emerald-600 px-6 py-2.5 rounded-lg font-semibold hover:bg-emerald-50 transition-colors shadow-sm text-sm"
            >
              🧘‍♀️ Start Your Journey
            </button>
          )}
        </div>
      </div>

      {/* Guest/Unauthenticated View */}
      {!isAuthenticated && (
        <section className="bg-gradient-to-r  from-green-50 to-emerald-50 py-12 rounded-2xl">
          <div className="max-w-5xl mx-auto text-center px-6">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              🧘‍♂️ Prakriti Parivar
            </h3>
            <p className="text-gray-600 text-lg mb-10 max-w-3xl mx-auto">
              Discover the perfect harmony between ancient wisdom and modern AI technology.
              Create personalized wellness plans for your entire family based on individual constitutions,
              seasonal needs, and cultural preferences.
            </p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 p-6 text-center"
                >
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Authenticated Dashboard */}
      {isAuthenticated && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left + Center Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Task Card */}
            {todayTask && (
              <DailyTaskCard
                task={todayTask}
                onComplete={() => setTodayTask(t => t ? { ...t, completed: true } : t)}
              />
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-5 text-center border border-gray-100">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-xl font-bold text-gray-800">{doshaPerc}%</div>
                <div className="text-xs text-gray-600 mt-1">{doshaName} Balance</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5 text-center border border-gray-100">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-xl font-bold text-gray-800">{mealPlan && mealPlan.length ? mealPlan.length * 7 : 0}</div>
                <div className="text-xs text-gray-600 mt-1">Days Planned</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5 text-center border border-gray-100">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="h-5 w-5 text-orange-600" />
                </div>
                <div className="text-xl font-bold text-gray-800">{mealPlan && mealPlan.length ? mealPlan.length * 7 * 3 : 0}</div>
                <div className="text-xs text-gray-600 mt-1">Recipes</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5 text-center border border-gray-100">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-xl font-bold text-gray-800 capitalize">{currentSeason}</div>
                <div className="text-xs text-gray-600 mt-1">Season</div>
              </div>
            </div>

            {/* Dosha Card */}
            {prakriti && currentDosha && (
              <DoshaCard prakriti={prakriti} currentBalance={currentDosha} />
            )}

            {/* Today's Meals */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              {todayMealPlan ? (
                <TodayMealCard todayPlan={todayMealPlan} />
              ) : (
                <div className="text-sm text-gray-400">Today's meal is not available.</div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {doshaName && (
              <CulturalWellnessCard userDosha={doshaName} currentSeason={currentSeason} />
            )}

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setCurrentSection('meal-plan')}
                  className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium text-gray-700"
                >
                  🍽️ View Meal Plan
                </button>
                <button
                  onClick={() => setCurrentSection('grocery')}
                  className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium text-gray-700"
                >
                  🛒 Browse Grocery
                </button>
                <button
                  onClick={() => setCurrentSection('guidance')}
                  className="w-full text-left p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-sm font-medium text-gray-700"
                >
                  🧘‍♀️ Daily Guidance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  );

  // Fetch meal plan when section or userId changes


  const handleTaskComplete = async (taskId: string) => {
    // Update local state immediately for UI responsiveness
    setTodayTask(t => t ? { ...t, completed: true } : t);

    // Refetch the task to ensure we have the latest state from the server
    if (user?.userId) {
      await fetchTodayTask(user.userId);
    }
  };

  const renderContent = () => {
    if (!isAuthenticated) {
      return <HomePage onNavigate={setCurrentSection} />;
    }

    switch (currentSection) {
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            members={members}
            todayTask={todayTask}
            todayMealPlan={todayMealPlan}
            mealPlan={mealPlan}
            currentSeason={currentSeason}
            onTaskComplete={handleTaskComplete}
            onNavigate={setCurrentSection}
            isAuthenticated={isAuthenticated ?? false}
            doshaName={doshaName}
            doshaPerc={doshaPerc}
          />
        );

      case 'family':
        return <FamilyMembers members={members} onRefresh={fetchMembers} />;

      case 'meal-plan':
        return members.length > 0 ? (
          <MealPlanView
            mealPlan={mealPlan}
            members={members}
            setMealPlan={setMealPlan}
            onSelectRecipe={async (recipeName: any, mealType: string) => {
              setLoadingRecipe(true);
              setSelectedRecipe(null); // Prevent showing stale data

              try {
                const userId = await apiClient.getCurrentUserId();

                // Map dietary preference properly
                const dietPref = (members?.[0]?.dietaryPreferences || '').toLowerCase();
                let dietType: 'vegetarian' | 'satvic' | 'vegan' | 'non_veg' | 'eggs_ok' | 'veg';

                if (dietPref === 'satvic') {
                  dietType = 'satvic';
                } else if (dietPref === 'vegetarian') {
                  dietType = 'vegetarian';
                } else if (dietPref === 'vegan') {
                  dietType = 'vegan';
                } else if (dietPref.includes('non')) {
                  dietType = 'non_veg';
                } else if (dietPref.includes('egg')) {
                  dietType = 'eggs_ok';
                } else {
                  dietType = 'vegetarian';
                }

                // Build the recipe request with required fields
                const obj = {
                  userId: userId,  // Add userId for tracking
                  dish: recipeName,  // Changed from mealName to dish
                  region: members?.[0]?.state || 'India',  // Get region from first member
                  dietType: dietType,  // Use properly mapped diet type
                  servings: members?.length || 1,  // Use number of family members as servings
                };
                const res = await apiClient.getRecipeByName(obj);
                setFetchedRecipe(res.data);
              } catch (error) {
              } finally {
                setLoadingRecipe(false);
              }
            }
            }
          />
        ) : (
          <NoMealPlan userId={userId}
            members={members}
            onPlanGenerated={(data) => {
            }} />
        );
      case 'grocery':
        return <GroceryList mealPlan={mealPlan} userId={userId} />;
      case 'recipes':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Recipe Library</h2>
            <p className="text-gray-600">Coming soon – Traditional recipes.</p>
          </div>
        );

      case 'guidance':
        return <RutucharyaGuide userDosha={doshaName} currentSeason={currentSeason} />;

      case 'wellness':
        return <WellnessTips members={members} season={currentSeason} />

      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-emerald-50/20 to-teal-50/30">
      {/* Show onboarding flow for new users */}
      {showOnboarding && !onboardingLoading && user?.userId && (
        <OnboardingFlow
          userId={user.userId}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* Main app content - only show if onboarding is not needed */}
      {!showOnboarding && (
        <>
          <Header onNavigate={setCurrentSection} currentSection={currentSection} />

          <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {renderContent()}
            <Footer />
          </main>
        </>
      )}

      {loadingRecipe && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-lg shadow-lg">
            <svg className="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700">Loading recipe...</span>
          </div>
        </div>
      )}

      {selectedRecipe && !loadingRecipe && (
        <RecipeDetail recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
      {/* <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} hasLogin={false} /> */}
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
