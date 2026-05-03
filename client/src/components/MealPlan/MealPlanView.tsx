import React, { useEffect, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { MealType } from '../../types';
import apiClient from '../../apiCall/api';
import {
  getWeekStartDate, transformMealPlan

} from '../../utils/transformMealPlan';

type ViewMode = 'day' | 'week' | 'month';

interface MealPlan {
  weekStart: string;
  days: {
    day: string;
    meals: {
      breakfast?: { base: string; customizations: any };
      lunch?: { base: string; customizations: any };
      dinner?: { base: string; customizations: any };
    };
  }[];
}

interface MealPlanViewProps {
  mealPlan: MealPlan[]; // Array of meal plans for the week
  members: any[]; // Array of family members
  onSelectRecipe: (recipe: any, mealType: string) => void;
  setMealPlan: React.Dispatch<React.SetStateAction<MealPlan[]>>
}

const MealPlanView: React.FC<MealPlanViewProps> = ({ mealPlan, members, onSelectRecipe, setMealPlan }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(Date.now());
  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner'];
  const [isGenerateDisabled, setIsGenerateDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMeal, setLoadingMeal] = useState(false);
  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        const date = new Date(currentDate)
        const selectedWeekStart = getWeekStartDate(date);
        const todayWeekStart = getWeekStartDate(new Date());
        const matchedPlan = mealPlan.find(plan => plan.weekStart === selectedWeekStart)
        const isCurrentWeekPlanned = (matchedPlan?.weekStart === selectedWeekStart) || (selectedWeekStart < todayWeekStart);
        setIsGenerateDisabled(isCurrentWeekPlanned);
      } catch (err) {
        console.error('Failed to fetch meal plan', err);
      }
    };

    fetchMealPlan();
  }, [currentDate]);

  const getMealForSlot = (date: Date, mealType: MealType): any => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const selectedWeekStart = getWeekStartDate(date);
    const weekPlan = mealPlan.find((plan) => plan.weekStart === selectedWeekStart);
    const dayEntry = weekPlan?.days.find((d) => d.day === dayName);
    return dayEntry?.meals?.[mealType as 'breakfast' | 'lunch' | 'dinner'] || null;
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
    if (viewMode === 'day') newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    else newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate.getTime());
  };

  const getWeekDates = () => {
    const baseDate = new Date(currentDate);
    const day = baseDate.getDay();
    const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(baseDate);
    monday.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday); // clone to avoid mutation
      date.setDate(monday.getDate() + i);
      return date;
    });
  };

  const MealCard: React.FC<{ mealData: any; mealType: MealType; compact?: boolean }> = ({
    mealData,
    mealType,
    compact = false,
  }) => {
    const mealColors = {
      breakfast: 'bg-yellow-50 border-yellow-200',
      lunch: 'bg-green-50 border-green-200',
      dinner: 'bg-purple-50 border-purple-200'
    };

    const iconBackgrounds = {
      breakfast: 'bg-yellow-300',
      lunch: 'bg-green-300',
      dinner: 'bg-purple-300'
    };

    const mealIcons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙'
    };

    if (!mealData) {
      return (
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center text-sm text-gray-400 italic ${compact ? 'h-[100px]' : 'h-[120px]'
            }`}
        >
          Not planned
        </div>
      );
    }

    return (
      <div
        className={`${mealColors[mealType as 'breakfast' | 'lunch' | 'dinner']} border rounded-xl shadow-sm p-4 space-y-2 transition hover:shadow-md cursor-pointer`}
        onClick={() => onSelectRecipe(mealData, mealType)}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className={`${iconBackgrounds[mealType as 'breakfast' | 'lunch' | 'dinner']} rounded-full p-2 w-8 h-8 flex items-center justify-center text-white text-sm`}
          >
            {mealIcons[mealType as 'breakfast' | 'lunch' | 'dinner']}
          </div>
          <h4 className="text-md font-bold text-gray-800 capitalize">{mealType}</h4>
        </div>

        {/* Base meal name */}
        <div>
          <h5 className="text-sm font-semibold text-gray-900">{mealData}</h5>
        </div>

        {/* Customizations */}
        {mealData?.customizations && (typeof mealData?.customizations === "string" ? (
          <p className="text-sm text-gray-700">{mealData?.customizations}</p>
        ) : (
          <ul className="text-xs text-gray-700 pl-4 list-disc space-y-1">
            {Object.entries(mealData?.customizations).map(([member, customization]) => (
              <li key={member}>
                <strong className="capitalize">{member}:</strong> {String(customization)}
              </li>
            ))}
          </ul>
        ))}

      </div>
    );
  };

  const renderDayView = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800">{formatDate(new Date(currentDate))}</h3>
      </div>
      <div className="grid gap-6">
        {mealTypes.map((mealType) => (
          <div key={mealType} className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 capitalize">{mealType}</h4>
            <MealCard mealData={getMealForSlot(new Date(currentDate), mealType)} mealType={mealType} />
          </div>
        ))}
      </div>
    </div>
  );
  const renderWeekView = () => {
    const weekDates = JSON.parse(JSON.stringify([...getWeekDates()]));

    return (
      <div className="space-y-6">
        {/* Generate Button */}
        <div className="flex justify-end">
          <button
            onClick={async () => {
              try {
                setLoading(true);
                const userId = await apiClient.getCurrentUserId();
                const weekStartDate = getWeekStartDate(new Date(weekDates[0]));
                setLoadingMeal(true);

                try {
                  // Map dietary preference to backend dietType enum
                  const dietPref = (members?.[0]?.dietaryPreferences || '').toLowerCase();
                  const dietType: 'veg' | 'non_veg' | 'eggs_ok' =
                    dietPref.includes('non') ? 'non_veg' :
                      dietPref.includes('egg') ? 'eggs_ok' : 'veg';

                  const memberPayload = (members || []).map((m: any) => ({
                    name: m.fullName || m.name || 'Member',
                    dosha: (m.prakriti?.primaryDosha || 'tridoshic') as 'vata' | 'pitta' | 'kapha' | 'tridoshic',
                  }));

                  const payload = {
                    userId,
                    weekStart: weekStartDate,
                    region: members?.[0]?.state || 'India',
                    dietType,
                    members: memberPayload,
                  };

                  const res = await apiClient.generateMealPlanV2(payload);
                  if (res.error) throw new Error(res.error);

                  const transformed = transformMealPlan([{
                    _id: res.data?.weekStartDate || weekStartDate,
                    userId: res.data?.user_id || userId,
                    weekStart: res.data?.weekStartDate || weekStartDate,
                    plan: res.data?.plan,
                  }]);

                  setIsGenerateDisabled(true);
                  setMealPlan(transformed);
                } catch (err) {
                  console.error("Failed to fetch meal plan", err);
                } finally {
                  setLoadingMeal(false);
                }

              } catch (error) {
                console.error("Failed to generate meal plan", error);
              } finally {
                setLoading(false);
              }
            }}
            disabled={isGenerateDisabled && loading}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${isGenerateDisabled
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
              }`}
          >
            {loading ? 'Generating...' : '✚ Generate New Plan'}
          </button>
        </div>

        {/* ✅ Desktop Grid View */}
        <div className="hidden md:block">
          <div className="grid grid-cols-7 gap-4">
            {weekDates.map((date: any, index: number) => (
              <div key={index} className="text-center">
                <h4 className="font-semibold text-gray-800 mb-4">
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <div className="space-y-3">
                  {mealTypes.map((mealType) => {
                    const mealData = getMealForSlot(new Date(date), mealType);
                    return (
                      <div key={mealType} title={mealData?.base || 'Not planned'}>
                        <MealCard mealData={mealData} mealType={mealType} compact />
                      </div>
                    );
                  })}
                  {/* ss */}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ Mobile Grid View */}
        <div className="block md:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {weekDates.map((date: any, index: number) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-4"
              >
                <h4 className="font-semibold text-gray-800 mb-2 text-center">
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                </h4>
                <p className="text-sm text-gray-600 mb-4 text-center">
                  {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <div className="space-y-3">
                  {mealTypes.map((mealType) => {
                    const mealData = getMealForSlot(new Date(date), mealType);
                    return (
                      <div key={mealType} title={mealData || 'Not planned'}>
                        <MealCard mealData={mealData} mealType={mealType} compact />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };



  // const renderWeekView = () => {
  //   const weekDates = getWeekDates();

  //   return (
  //     <div className="space-y-6">
  //       {/* Generate Button */}
  //       <div className="flex justify-end">
  //         <button
  //           onClick={async () => {
  //             try {
  //               const userId = await apiClient.getCurrentUserId();
  //               await apiClient.generateMealPlan(userId); // call your backend
  //               setIsGenerateDisabled(true); // disable after generation
  //               const res = await apiClient.getMealPlan(userId);
  //               const transformed = transformMealPlan(res.data);
  //               setMealPlan(transformed);
  //             } catch (error) {
  //               console.error("Failed to generate meal plan", error);
  //             }
  //           }}
  //           disabled={isGenerateDisabled}
  //           className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
  //             isGenerateDisabled
  //               ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
  //               : 'bg-green-600 text-white hover:bg-green-700'
  //           }`}
  //         >
  //           ✚ Generate Meal Plan
  //         </button>
  //       </div>

  //       {/* Responsive Horizontal Scroll Container */}
  //       <div className="overflow-x-auto pb-2">
  //         <div className="flex md:grid md:grid-cols-7 gap-4 min-w-[700px] md:min-w-full">
  //           {weekDates.map((date, index) => (
  //             <div
  //               key={index}
  //               className="flex-shrink-0 w-[240px] md:w-auto bg-white rounded-xl shadow-md p-4"
  //             >
  //               <h4 className="font-semibold text-gray-800 mb-2 text-center">
  //                 {date.toLocaleDateString('en-US', { weekday: 'short' })}
  //               </h4>
  //               <p className="text-sm text-gray-600 mb-4 text-center">
  //                 {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
  //               </p>
  //               <div className="space-y-3">
  //                 {mealTypes.map((mealType) => (
  //                   <MealCard
  //                     key={mealType}
  //                     mealData={getMealForSlot(date, mealType)}
  //                     mealType={mealType}
  //                     compact
  //                   />
  //                 ))}
  //               </div>
  //             </div>
  //           ))}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // };

  return (
    <div className="space-y-6">
      {!loadingMeal && (<><div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Meal Plan</h2>
            <p className="text-gray-600">Your personalized Ayurvedic meal plan</p>
          </div>
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            {(['day', 'week'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === mode
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'}`}
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
              {viewMode === 'day' && formatDate(new Date(currentDate))}
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
      </div><div className="bg-white rounded-xl shadow-lg p-6">
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'week' && renderWeekView()}
        </div></>)}

      {loadingMeal && (
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
            <span className="text-sm font-medium text-gray-700">Loading Meal Plan...</span>
          </div>
        </div>
      )}
    </div>

  );
};

export default MealPlanView;
