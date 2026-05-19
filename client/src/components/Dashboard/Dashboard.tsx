import React, { useState, useEffect } from 'react';
import { ChevronRight, Check, Clock, Users, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import apiClient from '../../apiCall/api';
import type { DailyTask } from './DailyTaskCard';

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface TodayMeals {
  day?: string;
  meals?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    morning?: string;
    evening?: string;
  };
}

interface DashboardProps {
  user: any;
  members: any[];
  todayTask: DailyTask | null;
  todayMealPlan: TodayMeals | undefined;
  mealPlan: any[];
  currentSeason: string;
  onTaskComplete: (taskId: string) => void;
  onNavigate: (section: string) => void;
  isAuthenticated: boolean;
  doshaName?: string;
  doshaPerc?: string;
}

interface StreakData {
  currentStreak: number;
  completedWeeks: number;
  currentWeek: number;
  weeklyProgress: Array<{
    week: number;
    completedDays: number;
    totalDays: number;
    isCompleted: boolean;
  }>;
  thisWeekDays: Array<{
    dayLabel: string;
    isCompleted: boolean;
    isToday: boolean;
    isFuture: boolean;
  }>;
}

/* ─── Static data maps ───────────────────────────────────────────────────── */

const ELEMENT_BENEFITS: Record<string, { s: string; b: string; c: string }> = {
  Fire: { s: 'Better Digestion', b: 'Kapha Dosha', c: 'Energy' },
  Water: { s: 'Hydration', b: 'Pitta Dosha', c: 'Calm' },
  Earth: { s: 'Grounding', b: 'Vata Dosha', c: 'Stability' },
  Air: { s: 'Circulation', b: 'Kapha Dosha', c: 'Clarity' },
  Space: { s: 'Better Digestion', b: 'Pitta Dosha', c: 'Lightness' },
};

const ELEMENT_ICON: Record<string, string> = {
  Fire: '🔥', Water: '💧', Earth: '🌱', Air: '🌬️', Space: '🪐',
};

const MEAL_META = {
  breakfast: {
    icon: '☀️',
    emoji: '🥞',
    tags: ['Earth', 'Light', 'Seasonal'],
    bestTime: '7:30 – 8:30 AM',
    doshaTag: 'Vata ↓',
    circleClass: 'from-primary/50 to-primary',
  },
  lunch: {
    icon: '🌞',
    emoji: '🥗',
    tags: ['Fire', 'Main Meal'],
    bestTime: '12:00 – 1:30 PM',
    doshaTag: 'Tridoshic',
    circleClass: 'from-primary to-primary-dark',
  },
  dinner: {
    icon: '🌙',
    emoji: '🍲',
    tags: ['Light', 'Easy to Digest'],
    bestTime: 'Before 7:30 PM',
    doshaTag: 'Kapha ↓',
    circleClass: 'from-primary-dark to-primary-darker',
  },
} as const;

const QUICK_ACTIONS = [
  { label: 'Family Members', sub: 'Manage your family profiles', icon: '👨‍👩‍👧', section: 'family' },
  { label: 'Guidance', sub: "Family's seasonal wisdom", icon: '🧘‍♀️', section: 'guidance' },
];

/* ─── MealCard (commented out - not currently used) ───────────────────────── */

// const MealCard = ({ type, name }: { type: 'breakfast' | 'lunch' | 'dinner'; name: string | undefined }) => {
//   const m = MEAL_META[type];
//   return (
//     <div className="bg-card rounded-2xl border border-border p-4 flex flex-col gap-3 flex-1 min-w-0 shadow-sm">
//       <div className="flex items-start justify-between">
//         <div className="flex items-center gap-2">
//           <span className="text-lg">{m.icon}</span>
//           <span className="font-semibold text-foreground capitalize">{type}</span>
//         </div>
//         <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
//           {m.doshaTag}
//         </span>
//       </div>

//       <div className="flex items-center gap-3">
//         <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${m.circleClass} flex items-center justify-center text-2xl flex-shrink-0 shadow-sm`}>
//           {m.emoji}
//         </div>
//         <div className="min-w-0">
//           <p className="font-semibold text-sm text-foreground leading-tight">
//             {name || <span className="text-muted-foreground italic font-normal">No meal plan available</span>}
//           </p>
//           <div className="flex flex-wrap gap-1 mt-1">
//             {m.tags.map(tag => (
//               <span key={tag} className="text-[10px] text-muted-foreground">{tag}</span>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-t border-border pt-2">
//         <Clock className="w-3.5 h-3.5" />
//         <span>Best time: {m.bestTime}</span>
//       </div>
//     </div>
//   );
// };

/* ─── Main Dashboard ─────────────────────────────────────────────────────── */

const Dashboard: React.FC<DashboardProps> = ({
  user, members, todayTask, todayMealPlan, currentSeason, onTaskComplete, onNavigate, isAuthenticated,
}) => {
  const [taskDone, setTaskDone] = useState(todayTask?.completed ?? false);
  const [completing, setCompleting] = useState(false);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loadingStreak, setLoadingStreak] = useState(true);

  const benefits = ELEMENT_BENEFITS[todayTask?.element ?? 'Space'] ?? ELEMENT_BENEFITS.Space;
  const elemIcon = ELEMENT_ICON[todayTask?.element ?? 'Space'] ?? '✨';

  // Sync taskDone state with todayTask.completed prop
  useEffect(() => {
    setTaskDone(todayTask?.completed ?? false);
  }, [todayTask?.completed]);

  // Fetch streak data
  useEffect(() => {
    const fetchStreak = async () => {
      if (!isAuthenticated || !user?.userId) {
        setLoadingStreak(false);
        return;
      }

      setLoadingStreak(true);
      try {
        const response = await apiClient.getStreak(user.userId);

        if (!response.error && response.data) {
          setStreakData(response.data);
        } else {
          setStreakData(null);
        }
      } catch (error) {
        setStreakData(null);
      } finally {
        setLoadingStreak(false);
      }
    };

    fetchStreak();
  }, [isAuthenticated, user?.userId, todayTask?.completed]);

  const handleMarkDone = async () => {
    if (taskDone || completing || !todayTask) return;
    setCompleting(true);
    try {
      const uid = await apiClient.getCurrentUserId();
      const res = await apiClient.completeTask(todayTask.taskId, uid);
      if (!res.error) {
        setTaskDone(true);
        onTaskComplete(todayTask.taskId);

        // Refresh streak data after completing task
        const streakResponse = await apiClient.getStreak(uid);
        if (!streakResponse.error && streakResponse.data) {
          setStreakData(streakResponse.data);
        }
      }
    } catch (e) {
    } finally {
      setCompleting(false);
    }
  };

  const todayMeals = todayMealPlan?.meals;

  return (
    <div className="w-full space-y-6">

      {/* ── HERO HEADER ──────────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-green-600 to-teal-600 shadow-lg">
        {/* Decorative circles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -bottom-6 -left-6 w-32 h-32 sm:w-48 sm:h-48 bg-white/5 rounded-full" />
          <div className="absolute -top-10 right-10 sm:right-20 w-48 h-48 sm:w-64 sm:h-64 bg-white/5 rounded-full" />
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 text-3xl sm:text-5xl opacity-15 select-none">🕉️</div>
          <div className="absolute right-0 top-0 h-full w-32 sm:w-44 hidden md:flex flex-col items-end justify-end pr-2 sm:pr-4 pb-2 sm:pb-4 opacity-20 text-4xl sm:text-6xl pointer-events-none select-none">
            <div>🧘‍♂️</div>
            <div className="text-2xl sm:text-3xl">🌿🌿</div>
          </div>
        </div>

        <div className="relative p-4 sm:p-6 md:p-8 lg:p-10">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-xl sm:text-2xl">🌿</span>
            </div>

            <div className="min-w-0 flex-1 w-full">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground leading-tight">
                Namaste, {user?.name || 'Friend'} 🙏
              </h1>
              <p className="text-primary-foreground/70 text-xs sm:text-sm md:text-base mt-1 leading-relaxed">
                Natural family living rooted in your family's nature
              </p>

              {isAuthenticated && (
                <>
                  <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 mt-2 sm:mt-3 text-primary-foreground/75 text-xs sm:text-sm">
                    <span className="flex items-center gap-1">
                      <span className="hidden xs:inline">📅</span>
                      <span className="hidden sm:inline">{format(new Date(), 'EEEE, dd MMM yyyy')}</span>
                      <span className="sm:hidden">{format(new Date(), 'dd MMM yyyy')}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="hidden xs:inline">☀️</span>
                      {currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)} Season
                    </span>
                    {user?.region && (
                      <span className="flex items-center gap-1">
                        <span className="hidden xs:inline">📍</span>
                        {user.region}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 mt-2 text-xs sm:text-sm font-medium text-primary-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">{members.length} Family Members</span>
                      <span className="xs:hidden">{members.length} Members</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Natural Living</span>
                      <span className="sm:hidden">Natural Living</span>
                    </span>
                    {/* {user?.preference && (
                      <span className="flex items-center gap-1">
                        <span className="hidden xs:inline">🍽️</span>
                        {user.preference === 'vegetarian' ? 'Vegetarian' : 'Satvic'}
                      </span>
                    )} */}
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ── AUTHENTICATED MAIN CONTENT ────────────────────────────────── */}
      {isAuthenticated && (
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── LEFT COLUMN (2/3) ────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* TODAY'S PRACTICE CARD */}
            <div className="rounded-2xl overflow-hidden bg-secondary border border-primary/30 shadow-lg">
              <div className="px-5 pt-5 pb-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-primary text-sm">⭐</span>
                  <span className="text-xs font-bold tracking-widest text-primary uppercase">
                    Today's Practice – High Priority
                  </span>
                </div>
              </div>

              <div className="px-5 pb-5">
                <div className="flex items-start gap-4">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Phase + element badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="bg-primary-foreground/10  text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full border border-primary-foreground/20">
                        Day {todayTask?.dayNumber ?? '–'} – {todayTask?.element ?? '…'} Phase
                      </span>
                      <span className="bg-primary-foreground/8 text-secondary-foreground/80 text-xs px-2.5 py-1 rounded-full border border-primary-foreground/15 flex items-center gap-1">
                        {elemIcon} {todayTask?.element ?? '…'}
                        {todayTask?.cycle ? <span className=" text-secondary-foreground/50"> • {todayTask.cycle}</span> : null}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className=" text-secondary-foreground text-2xl md:text-3xl font-extrabold leading-tight mb-1">
                      {todayTask?.title ?? 'Loading your daily practice…'}
                    </h2>

                    {/* Description */}
                    <p className=" text-secondary-foreground/65 text-sm mb-4 leading-relaxed">
                      {todayTask?.description ?? ''}
                    </p>

                    {/* Benefits row */}
                    <div className="flex flex-wrap gap-4 mb-5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase text-primary tracking-wide mb-0.5">Supports</span>
                        <span className="flex items-center gap-1  text-secondary-foreground/80 text-xs"><span>🫁</span>{benefits.s}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase text-primary/80 tracking-wide mb-0.5">Balances</span>
                        <span className="flex items-center gap-1  text-secondary-foreground/80 text-xs"><span>🔥</span>{benefits.b}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase text-primary tracking-wide mb-0.5">Creates</span>
                        <span className="flex items-center gap-1  text-secondary-foreground/80 text-xs"><span>🌿</span>{benefits.c}</span>
                      </div>
                    </div>

                    {/* Buttons row */}
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={handleMarkDone}
                        disabled={taskDone || completing || !todayTask}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow
                          ${taskDone
                            ? 'bg-primary/50  text-secondary-foreground/80 cursor-default'
                            : 'bg-primary  text-secondary-foreground hover:opacity-90 active:scale-95'
                          }`}
                      >
                        <Check className="w-4 h-4" />
                        {taskDone ? 'Completed!' : completing ? 'Saving…' : 'Mark as Done'}
                      </button>

                      {/* <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary-foreground/25 text-secondary-foreground/80 text-sm font-semibold hover:bg-primary-foreground/10 transition-colors">
                        <Clock className="w-4 h-4" />
                        Remind Me Later
                      </button> */}

                      {/* Motivational mini-box */}
                      <div className="hidden sm:flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-xl px-3 py-2 max-w-[200px]">
                        <span className="text-lg flex-shrink-0">🌟</span>
                        <p className="text-xs text-secondary-foreground font-semibold leading-snug">
                          Your action today makes a big difference!<br />
                          <span className="text-secondary-foreground/70 font-normal">Stay consistent, stay healthy.</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right illustration */}
                  <div className="hidden sm:flex flex-col items-center justify-center w-28 flex-shrink-0 mt-2 select-none">
                    <div className="relative">
                      <span className="text-6xl filter drop-shadow-lg">📋</span>
                      <span className="absolute -top-1 -right-1 text-2xl">✨</span>
                      <span className="absolute -bottom-1 -left-1 text-xl opacity-70">🌟</span>
                    </div>
                  </div>
                </div>

                {/* Quote */}
                {todayTask?.quote && (
                  <div className="border-t border-primary-foreground/10 pt-3 mt-4">
                    <p className="text-xs italic text-primary-foreground/45 leading-relaxed">
                      "{todayTask.quote}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* WELLNESS STREAK - Moved below Today's Card */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
              <h3 className="font-bold text-foreground mb-3">Your Family's Streak 🔥</h3>

              {loadingStreak ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading streak...</p>
                </div>
              ) : streakData ? (
                <>
                  <div className="text-center mb-4">
                    <span className="text-5xl font-extrabold text-foreground">{streakData.currentStreak}</span>
                    <span className="text-lg font-semibold text-muted-foreground ml-2">Days</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {streakData.currentStreak > 0
                        ? "Keep it up! You're doing amazing."
                        : "Start your natural living journey today!"}
                    </p>
                  </div>

                  <div className="flex justify-between mb-3">
                    {streakData.thisWeekDays.map((d, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        {d.isFuture ? (
                          <div className="w-8 h-8 rounded-full border-2 border-dashed border-border/50 flex items-center justify-center">
                            <span className="text-xs text-muted-foreground/50">·</span>
                          </div>
                        ) : d.isCompleted ? (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        ) : (
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${d.isToday ? 'border-primary border-dashed' : 'border-border'
                            }`}>
                            {d.isToday && <span className="text-xs text-primary font-bold">!</span>}
                          </div>
                        )}
                        <span className={`text-[11px] font-semibold ${d.isToday ? 'text-primary' : 'text-muted-foreground'
                          }`}>
                          {d.dayLabel}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Week {streakData.currentWeek}
                      </span>
                      <span className="text-muted-foreground">
                        {streakData.completedWeeks} {streakData.completedWeeks === 1 ? 'week' : 'weeks'} completed
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">No streak data available</p>
                </div>
              )}
            </div>

            {/* TODAY'S MEALS */}
            {/* <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌿</span>
                  <div>
                    <h3 className="font-bold text-foreground text-base">Today's Meals</h3>
                    <p className="text-xs text-muted-foreground">Nourish your body, balance your dosha</p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('meal-plan')}
                  className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline"
                >
                  View Full Plan <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {mealPlan.length === 0 && !todayMeals ? (
                <p className="text-sm text-muted-foreground text-center py-6 italic">
                  No meal plan available. Generate one from the Meal Plan section.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <MealCard type="breakfast" name={todayMeals?.breakfast || todayMeals?.morning} />
                  <MealCard type="lunch"     name={todayMeals?.lunch} />
                  <MealCard type="dinner"    name={todayMeals?.dinner} />
                </div>
              )}
            </div> */}
          </div>

          {/* ── RIGHT SIDEBAR (1/3) ──────────────────────────────────── */}
          <div className="space-y-5">

            {/* QUICK ACTIONS */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
              <h3 className="font-bold text-foreground mb-3">Current Sections</h3>
              <div className="space-y-2">
                {QUICK_ACTIONS.map(a => (
                  <button
                    key={a.section}
                    onClick={() => onNavigate(a.section)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors group"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                      {a.icon}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold text-foreground">{a.label}</p>
                      <p className="text-xs text-muted-foreground">{a.sub}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Traditional Wisdom Quote */}
            <div className="bg-secondary rounded-2xl border border-accent p-5 relative overflow-hidden">
              <div className="absolute top-3 left-4 text-primary text-4xl font-serif opacity-40 leading-none select-none">"</div>
              <p className="text-sm italic text-secondary-foreground leading-relaxed mt-4 relative z-10">
                When diet is wrong, medicine is of no use. When diet is correct, medicine is of no need.
              </p>
              <p className="text-xs font-semibold text-primary mt-3">– Ancient Wisdom</p>
              <div className="absolute bottom-2 right-3 text-3xl opacity-20 select-none">🪴</div>
            </div>

          </div>
        </div>
      )}


      {/* ── DISCLAIMER FOOTER ─────────────────────────────────────────── */}
      {/* {isAuthenticated && (
        <div className="flex items-start gap-3 bg-secondary/60 rounded-xl border border-accent px-5 py-3">
          <span className="text-2xl flex-shrink-0 mt-0.5">🤖</span>
          <p className="text-xs text-secondary-foreground leading-relaxed">
            <strong>This is an AI-generated wellness app.</strong> If you have any health concerns, please consult your doctor.
            The guidance provided here is based on Ayurvedic principles and personalized algorithms.
            It should not replace professional medical advice.
          </p>
        </div>
      )} */}
    </div>
  );
};

export default Dashboard;
