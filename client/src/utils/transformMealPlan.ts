import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

type Meal = {
  base: string;
  customizations: {
    [key: string]: string;
  };
};

type Meals = {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
};

type DayMeal = {
  day: string;
  meals: Meals;
};

type TransformedMealPlan = {
  id: string;
  userId: string;
  weekStart: string;
  days: DayMeal[];
};

export function transformMealPlan(rawData: any[]): TransformedMealPlan[] {
  if (!Array.isArray(rawData)) {
    return [];
  }
  return rawData.map((entry) => {
    // New schema (LLM v2): entry.plan.days is an array of { date, breakfast, lunch, dinner }
    if (entry?.plan?.days && Array.isArray(entry.plan.days)) {
      const days: DayMeal[] = entry.plan.days.map((dayObj: any) => ({
        day: new Date(dayObj.date).toLocaleDateString('en-US', { weekday: 'long' }),
        meals: {
          breakfast: dayObj.breakfast?.name || dayObj.breakfast || null,
          lunch: dayObj.lunch?.name || dayObj.lunch || null,
          dinner: dayObj.dinner?.name || dayObj.dinner || null,
        },
      }));
      return {
        id: entry._id || entry.plan.weekStart || 'plan',
        userId: entry.userId,
        weekStart: entry.plan.weekStart?.split('T')[0] || entry.plan.weekStart,
        days,
      };
    }

    // New schema: entry.plan.week_plan is an array of { day, meals }
    if (entry?.plan?.week_plan && Array.isArray(entry.plan.week_plan)) {
      const days: DayMeal[] = entry.plan.week_plan.map((dayObj: any) => ({
        day: dayObj.day,
        meals: {
          breakfast: dayObj.meals?.breakfast || null,
          lunch: dayObj.meals?.lunch || null,
          dinner: dayObj.meals?.dinner || null,
        },
      }));
      return {
        id: entry._id || entry.plan.weekStart || 'plan',
        userId: entry.userId,
        weekStart: entry.plan.weekStart?.split('T')[0] || entry.plan.weekStart,
        days,
      };
    }

    // Legacy schema fallbacks
    let planObj;
    if (entry.plan?.plan?.meals) {
      planObj = entry.plan.plan.meals;
    } else if (entry.plan?.plan) {
      planObj = entry.plan.plan;
    } else if (entry.plan) {
      planObj = entry.plan;
    } else {
      planObj = {};
    }
    const days: DayMeal[] = Object.entries(planObj).map(([day, meals]: [string, any]) => ({
      day,
      meals: {
        breakfast: meals.breakfast,
        lunch: meals.lunch,
        dinner: meals.dinner,
      },
    }));

    return {
      id: entry._id,
      userId: entry.userId,
      weekStart: entry.weekStart?.split('T')[0], // trim time from ISO string
      days,
    };
  });
}

export const getWeekStartDate = (date: Date): any => {
  const d = new Date(date); // clone to avoid mutation
  const day = d.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
  const diff = day === 0 ? -6 : 1 - day; // Adjust to get Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
};

export const normalizeToWeekStart = (dateString: Date): string => {
  const date = new Date(dateString);
  const utcYear = date.getUTCFullYear();
  const utcMonth = date.getUTCMonth();
  const utcDay = date.getUTCDate();

  // Return ISO string at 00:00:00 UTC
  return new Date(Date.UTC(utcYear, utcMonth, utcDay, 0, 0, 0)).toISOString();
}



export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

