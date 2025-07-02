export interface User {
  userId: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  location: string;
  dietType: 'vegetarian' | 'non-vegetarian' | 'vegan';
  allergies: string[];
  healthConditions: string[];
  prakriti: DoshaType;
  currentDosha: DoshaBalance;
  createdAt: Date;
}

export interface DoshaBalance {
  vata: number;
  pitta: number;
  kapha: number;
}

export type DoshaType = 'vata' | 'pitta' | 'kapha' | 'vata-pitta' | 'pitta-kapha' | 'vata-kapha';

export type Season = 'spring' | 'summer' | 'monsoon' | 'autumn' | 'winter' | 'late-winter';

export interface Food {
  id: string;
  name: string;
  category: 'grain' | 'vegetable' | 'fruit' | 'protein' | 'dairy' | 'spice' | 'oil' | 'sweetener';
  taste: Taste[];
  doshaEffect: DoshaEffect;
  season: Season[];
  nutrition: NutritionInfo;
  description?: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  vitamins: string[];
  minerals: string[];
}

export interface DoshaEffect {
  vata: 'increase' | 'decrease' | 'neutral';
  pitta: 'increase' | 'decrease' | 'neutral';
  kapha: 'increase' | 'decrease' | 'neutral';
}

export type Taste = 'sweet' | 'sour' | 'salty' | 'pungent' | 'bitter' | 'astringent';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  mealType: MealType;
  doshaBalance: DoshaBalance;
  season: Season[];
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  nutrition: NutritionInfo;
  substitutes?: { [key: string]: string[] };
}

export interface Ingredient {
  foodId: string;
  name: string;
  quantity: number;
  unit: string;
  optional?: boolean;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealPlan {
  id: string;
  userId: string;
  date: Date;
  meals: {
    breakfast: Recipe;
    lunch: Recipe;
    dinner: Recipe;
    snacks: Recipe[];
  };
  totalNutrition: NutritionInfo;
  doshaScore: DoshaBalance;
  seasonalAlignment: number;
}

export interface WeeklyMealPlan {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  dailyPlans: MealPlan[];
  shoppingList: ShoppingItem[];
  weeklyNutrition: NutritionInfo;
  avgDoshaScore: DoshaBalance;
}

export interface ShoppingItem {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  estimated_cost?: number;
}

export interface DinacharyaRecommendation {
  time: string;
  activity: string;
  description: string;
  doshaSpecific: {
    vata?: string;
    pitta?: string;
    kapha?: string;
  };
}

export interface RutucharyaGuidance {
  season: Season;
  foods_to_favor: string[];
  foods_to_avoid: string[];
  lifestyle_tips: string[];
  dosha_considerations: {
    vata: string[];
    pitta: string[];
    kapha: string[];
  };
}