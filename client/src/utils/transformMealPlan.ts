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
  return rawData.map((entry) => {
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
    // console.log("Transformed Entry:", {
    //   id: entry._id,
    //   userId: entry.userId,
    //   weekStart: entry.weekStart?.split('T')[0], // trim time from ISO string
    //   days,
    // })
    return {
      id: entry._id,
      userId: entry.userId,
      weekStart: entry.weekStart?.split('T')[0], // trim time from ISO string
      days,
    };
  }); 
}

export const getWeekStartDate = (date: Date): any => {
  const d = date;
  const day = d.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
  const diff = day === 0 ? -5 : (1 - day) + 1; // If Sunday, subtract 6 to get previous Monday
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

