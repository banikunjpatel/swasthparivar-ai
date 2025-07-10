import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import Header from './components/Layout/Header';
import DoshaCard from './components/Dashboard/DoshaCard';
import CulturalWellnessCard from './components/Dashboard/CulturalWellnessCard';
import MealPlanView from './components/MealPlan/MealPlanView';
import RecipeDetail from './components/Recipes/RecipeDetail';
import DinacharyaGuide from './components/Guidance/DinacharyaGuide';
import RutucharyaGuide from './components/Guidance/RutucharyaGuide';
import { DoshaType, DoshaBalance, Recipe, Season } from './types';
import { getCurrentSeason } from './utils/ayurvedic-logic';
import { TrendingUp, Calendar, BookOpen, Activity, UserIcon, CalendarCheck, Heart } from 'lucide-react';
import apiClient from './lib/api';
import NoMealPlan from './components/MealPlan/NoMealPlan';
import FamilyMembers from './components/FamilyMember/FamilyMembers';
import { Users, Sparkles } from 'lucide-react';
import { GroceryList } from './components/Grocery/GroceryList';
import { getWeekStartDate, transformMealPlan } from './utils/transformMealPlan';
import { format } from 'date-fns';
import WellnessTips from './components/Guidance/WellnessTips';


function AppContent() {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [fetchedRecipe, setFetchedRecipe] = useState<Recipe | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [isAssessmentDone, setIsAssessmentDone] = useState(false);
  const [currentSeason, setCurrentSeason] = useState<Season>('spring');
  const [mealPlan, setMealPlan] = useState<any[]>([]);
  const [todayMealPlan, setTodayMealPlan] = useState<any>();
  // const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string>('');
  const [doshaName, setDoshaName] = useState<string>('');
  const [doshaPerc, setDoshaPerc] = useState<string>('');
  const [guestData, setGuestData] = useState<{ prakriti: DoshaType; currentDosha: DoshaBalance } | null>(null);
  const [members, setMembers] = useState([]);
  const { user, loading, isAuthenticated } = useAuth();
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
    breakfast: "bg-yellow-50",
    lunch: "bg-green-50",
    dinner: "bg-orange-50",
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
      description: 'Personalized Indian meals based on Ayurvedic principles and preferences',
    },
    {
      icon: <Heart className="w-10 h-10 text-purple-500" />,
      title: 'Wellness Guidance',
      description: 'Daily tips for yoga, meditation, and seasonal wellness practices',
    },
  ];

  // useEffect(() => {
  //     const fetchUser = async () => {
  //       try {
  //         const userRes = await apiClient.getCurrentUser();
  //         setUser(userRes.data);
  //         setIsAssessmentDone(userRes.data ? true : false);
  //         console.log('Current user fetched:', userRes);
  //       } catch (err) {
  //         setUser(null);
  //       }
  //     };
  //     fetchUser();
  //   }, []);
  const fetchMembers = async () => {
    try {
      console.log("Fetching family members...");
      // const userRes = await apiClient.getCurrentUser(); // Adjust based on your user object structure
      const userId = await apiClient.getCurrentUserId();
      const res = await apiClient.getFamilyMembers(userId);
      const highestDosha = Object.entries(res.data[0].doshaStats).reduce((max: any, current: any) => {
        return current[1] > max[1] ? current : max;
      }, ["", 0]);

      const [doshaName, percentage] = highestDosha;

      setDoshaName(`${doshaName.charAt(0).toUpperCase() + doshaName.slice(1)}`);
      setDoshaPerc(percentage.toString());
      setUserId(user?.userId || '');
      setMembers(res.data || []);
    } catch (err) {
      console.error("Failed to load family members", err);
    }
  };
  const fetchMealPlan = async () => {
    // console.log('Fetching meal plan for userId:', userId);
    // console.log('fetchMealPlan:', members);
    if (userId && members && members.length > 0) {
      // console.log('Fetching meal plan for userId:', userId);
      try {
        const res = await apiClient.getMealPlan(userId);
        const transformed = transformMealPlan(res.data);
        setMealPlan(transformed);
        const today = format(new Date(), "EEEE"); // e.g., "Wednesday"
        const matchedWeek = transformed.find(item =>
          format(new Date(item.weekStart), "yyyy-MM-dd") === getWeekStartDate(new Date())
        );

        console.log("Matched Week:", matchedWeek);
        const todayData = matchedWeek?.days?.find((dayObj: any) => dayObj.day === today);
        console.log("Today’s plan:", todayData);

        setTodayMealPlan(todayData);

      } catch (err) {
        setMealPlan([]);
        setTodayMealPlan(undefined);
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
    }
  }, [user]);
  useEffect(() => {
    if (fetchedRecipe) {
      setSelectedRecipe(fetchedRecipe);
    }
  }, [fetchedRecipe]);

  useEffect(() => {
    if (user) {
      fetchMembers();
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


  // const currentTodayMeal = () => {
  //   console.log('Fetching current today meal...');

  // };
  // currentTodayMeal();
  // console.log('Current Today Meal:', currentTodayMeal());
  const TodayMealCard: React.FC<Props> = ({ todayPlan }) => {
    console.log('Rendering TodayMealCard with todayPlan:', todayPlan);
    const meals = ["breakfast", "lunch", "dinner"] as const;

    return (
      <div className="mx-auto mt-6">
        <h2 className="text-lg font-bold mb-4 flex items-center">
          🍽️ <span className="ml-2">Today's Meal Highlights</span>
        </h2>

        {meals.map((mealKey) => {
          const meal = todayPlan.meals[mealKey];
          console.log(mealKey, meal);
          return (
            <div
              key={mealKey}
              className={`rounded-xl px-4 py-3 mb-3 shadow-sm ${boxColorMap[mealKey]}`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-md capitalize">{mealKey}</h3>
                <span className={`text-sm rounded-full px-2 py-1 ${tagColorMap[mealKey]} font-semibold`}>
                  {mealKey === "breakfast" ? "Vata ↓" : mealKey === "lunch" ? "Tridoshic" : "Kapha ↓"}
                </span>
              </div>
              <p className="text-sm mt-1 text-gray-700">{meal.base}</p>
              {meal?.customizations && (
                typeof meal?.customizations === "string" ? (
                  <p className="text-xs text-gray-500 mt-0.5 italic">{meal.customizations}</p>
                ) : (
                  <ul className="text-xs text-gray-500 mt-0.5 italic pl-4 list-disc space-y-1">
                    {Object.entries(meal?.customizations).map(([member, customization]) => (
                      <li key={member}>
                        <strong className="capitalize">{member}:</strong> {String(customization)}
                      </li>
                    ))}
                  </ul>
                )
              )}
              {/* <p className="text-xs text-gray-500 mt-0.5 italic">{meal.customizations}</p> */}
            </div>
          );
        })}
      </div>
    );
  };
  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Main Greeting Section */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" />

        <div className="absolute top-4 right-4 opacity-20 text-4xl sm:text-5xl">🕉️</div>
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
              {isAuthenticated && (
                <>
                  <p className="text-sm sm:text-base text-white/90">
                    Wednesday 25 June, 2025 • {currentSeason} Season
                  </p>
                  <div className="flex items-center left-4 gap-4 text-sm sm:text-base font-medium text-white">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {members.length} Family Members
                    </div>
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      AI-Powered Wellness
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {!isAssessmentDone && (
            <button
              onClick={() => setCurrentSection('family')}
              className="mt-4 bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors shadow-lg"
            >
              🧘‍♀️ Discover Your Constitution
            </button>
          )}
        </div>
      </div>
      <> {!isAuthenticated && (
        <>
          {/* <section className="bg-green-50 py-12 px-4 md:px-10">
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-green-800 mb-4">🌿 Why Choose Ayurvedic Nutrition?</h2>
              <p className="text-gray-700 mb-8 text-md md:text-lg">
                Rooted in ancient wisdom, Ayurvedic meals promote balance, boost immunity, and align your diet with your unique constitution (Prakriti).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow p-6 text-left">
                  <h3 className="font-semibold text-green-700 text-lg mb-2">🧘‍♀️ Mind-Body Balance</h3>
                  <p className="text-gray-600 text-sm">Customized meals help reduce stress and increase vitality by balancing doshas.</p>
                </div>
                <div className="bg-white rounded-xl shadow p-6 text-left">
                  <h3 className="font-semibold text-green-700 text-lg mb-2">🍲 Seasonal Eating</h3>
                  <p className="text-gray-600 text-sm">Recommendations adjust as per seasons and body needs, helping you stay naturally in sync.</p>
                </div>
                <div className="bg-white rounded-xl shadow p-6 text-left">
                  <h3 className="font-semibold text-green-700 text-lg mb-2">🌾 Natural & Wholesome</h3>
                  <p className="text-gray-600 text-sm">Emphasis on fresh, local, and sattvic foods—free from toxins and additives.</p>
                </div>
              </div>
            </div>
          </section> */}
          <section className="bg-gradient-to-r from-green-100 to-green-50 py-12 px-4 md:px-10">
            <div className="max-w-6xl mx-auto text-center">
              <div className="px-4 py-10 md:px-10">
                <div className="text-center max-w-3xl mx-auto mb-10">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                    🧘‍♂️ Welcome to Swasth Ayur AI
                  </h1>
                  <p className="text-gray-600 text-md md:text-lg">
                    Discover the perfect harmony between ancient Ayurvedic wisdom and modern AI technology.
                    Create personalized wellness plans for your entire family based on individual constitutions,
                    seasonal needs, and cultural preferences.
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-md hover:shadow-green-300 transition-shadow duration-300 border border-gray-100 p-6 text-center"
                    >
                      <div className="flex justify-center mb-4">{feature.icon}</div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <section className="bg-white py-12 px-4 md:px-10">
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-green-800 mb-8">✨ What Our Users Say</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-6 rounded-xl shadow">
                  <p className="text-gray-700 italic">"Swasth Pariwar has completely changed how my family eats. The meal plans are so easy to follow!"</p>
                  <div className="mt-4 text-sm font-semibold text-green-800">– Priya, Wellness Mom</div>
                </div>
                <div className="bg-green-50 p-6 rounded-xl shadow">
                  <p className="text-gray-700 italic">"I discovered my Prakriti type and finally feel aligned with my food choices."</p>
                  <div className="mt-4 text-sm font-semibold text-green-800">– Rohan, Yoga Instructor</div>
                </div>
                <div className="bg-green-50 p-6 rounded-xl shadow">
                  <p className="text-gray-700 italic">"Simple, effective, and Ayurvedic! My energy levels have improved so much."</p>
                  <div className="mt-4 text-sm font-semibold text-green-800">– Kavita, Working Mom</div>
                </div>
              </div>
            </div>
          </section>
          {/* <section className="bg-gradient-to-r from-green-700 to-green-500 py-12 px-4 md:px-10 text-white">
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">🧘 Transform Your Diet with Ayurvedic Wisdom</h2>
              <p className="mb-6 text-lg">No fad diets. No calorie counting. Just timeless health through nature and personalized care.</p>

              <button className="bg-white text-green-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition">
                🌿 Start Your Journey
              </button>
            </div>
          </section> */}
        </>

      )}
        {/* Main Dashboard Sections */}
        {isAuthenticated && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left + Center Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stat Cards */}
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{doshaPerc} %</div>
                  <div className="text-sm text-gray-600">{doshaName} Balance</div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{mealPlan && mealPlan.length ? mealPlan.length * 7 : 0}</div>
                  <div className="text-sm text-gray-600">Days Planned</div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{mealPlan && mealPlan.length ? mealPlan.length * 7 * 3 : 0} </div>
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

              {/* Dosha & Recommendations */}
              {prakriti && currentDosha && (
                <DoshaCard prakriti={prakriti} currentBalance={currentDosha} />
              )}

              <div className="bg-white rounded-xl shadow-lg p-6">
                {todayMealPlan ? (
                  <TodayMealCard todayPlan={todayMealPlan} />
                ) : (
                  <div className="text-sm text-gray-400">Today's meal is not available.</div>
                )}
                <div className="space-y-3">
                  {/* {prakriti &&
                    getDoshaRecommendations(prakriti).slice(0, 3).map((rec, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                        <p className="text-sm text-gray-700">{rec}</p>
                      </div>
                    ))} */}
                </div>
              </div>

            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* <WellnessStreak currentStreak={5} longestStreak={12} weeklyGoal={7} completedThisWeek={5} /> */}

              {doshaName && (
                <CulturalWellnessCard userDosha={doshaName} currentSeason={currentSeason} />
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
                    onClick={() => setCurrentSection('grocery')}
                    className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg"
                  >
                    📚 Browse Grocery
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
        )}</>
    </div >
  );

  // Fetch meal plan when section or userId changes


  const renderContent = () => {
    // const [loadingRecipe, setLoadingRecipe] = useState(false);
    switch (currentSection) {
      case 'dashboard':
        return renderDashboard();

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
                const obj = {
                  mealName: recipeName,
                  mealType: mealType,
                };
                const res = await apiClient.getRecipeByName(obj);
                setFetchedRecipe(res.data[0]);
              } catch (error) {
                console.error("Failed to fetch recipe", error);
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
              // console.log('New meal plan generated:', data);
              // setMealPlan(data);
            }} />
        );
      case 'grocery':
        return <GroceryList mealPlan={mealPlan} userId={userId} />;
      case 'recipes':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Recipe Library</h2>
            <p className="text-gray-600">Coming soon – Ayurvedic recipes.</p>
          </div>
        );

      case 'guidance':
        return isAuthenticated && doshaName ? (

          <div className="space-y-8">
            <RutucharyaGuide userDosha={doshaName} currentSeason={currentSeason} />
            {/* <DinacharyaGuide userDosha={doshaName} /> */}

          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">Complete assessment to get personalized guidance.</div>
        );
      case 'wellness':
        return <WellnessTips members={members} season={currentSeason} />

      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50">
      <Header onNavigate={setCurrentSection} currentSection={currentSection} />

      <main className="max-w-7xl mx-auto px-4 py-8">{renderContent()}</main>
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
