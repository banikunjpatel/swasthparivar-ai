import { DoshaBalance, DoshaType, Season, User, Recipe, Food } from '../types';

export const calculateDoshaFromAssessment = (scores: { vata: number; pitta: number; kapha: number }): { prakriti: DoshaType; balance: DoshaBalance } => {
  const total = scores.vata + scores.pitta + scores.kapha;
  const balance: DoshaBalance = {
    vata: Math.round((scores.vata / total) * 100),
    pitta: Math.round((scores.pitta / total) * 100),
    kapha: Math.round((scores.kapha / total) * 100)
  };

  // Determine primary dosha
  const sortedDoshas = Object.entries(balance).sort(([,a], [,b]) => b - a);
  const [primary, primaryScore] = sortedDoshas[0];
  const [secondary, secondaryScore] = sortedDoshas[1];

  let prakriti: DoshaType;
  if (primaryScore - secondaryScore < 10) {
    prakriti = `${primary}-${secondary}` as DoshaType;
  } else {
    prakriti = primary as DoshaType;
  }

  return { prakriti, balance };
};

export const getCurrentSeason = (location?: string): Season => {
  const month = new Date().getMonth() + 1; // 1 to 12

  if (month >= 2 && month <= 3) return 'spring';       // Feb–Mar → Basant
  if (month >= 4 && month <= 5) return 'summer';       // Apr–May → Grishma
  if (month >= 6 && month <= 7) return 'monsoon';      // Jun–Jul → Varsha
  if (month >= 8 && month <= 9) return 'autumn';       // Aug–Sep → Sharad
  if (month >= 10 && month <= 11) return 'pre-winter'; // Oct–Nov → Hemant
  return 'winter'; 
};

export const calculateRecipeDoshaAlignment = (recipe: Recipe, userDosha: DoshaBalance): number => {
  // Calculate how well the recipe aligns with the user's dosha needs
  const userPrimary = Object.entries(userDosha).reduce((a, b) => userDosha[a[0] as keyof DoshaBalance] > userDosha[b[0] as keyof DoshaBalance] ? a : b)[0] as keyof DoshaBalance;
  
  // Higher recipe dosha balance for user's primary dosha = better alignment
  const alignment = recipe.doshaBalance[userPrimary];
  
  // Adjust for imbalances - if user has excess of a dosha, prefer recipes that reduce it
  let balanceScore = 0;
  Object.entries(userDosha).forEach(([dosha, percentage]) => {
    if (percentage > 40) { // If dosha is elevated
      // Prefer recipes that don't increase this dosha
      const recipeEffect = recipe.doshaBalance[dosha as keyof DoshaBalance];
      balanceScore += (100 - recipeEffect) * 0.1;
    }
  });

  return Math.min(100, alignment + balanceScore);
};

export const filterRecipesBySeason = (recipes: Recipe[], season: Season): Recipe[] => {
  return recipes.filter(recipe => recipe.season.includes(season));
};

export const generateShoppingList = (recipes: Recipe[]): { [category: string]: { name: string; quantity: number; unit: string }[] } => {
  const shoppingList: { [category: string]: { [name: string]: { quantity: number; unit: string } } } = {};

  recipes.forEach(recipe => {
    recipe.ingredients.forEach(ingredient => {
      const category = 'General'; // In a real app, you'd map ingredients to categories
      
      if (!shoppingList[category]) {
        shoppingList[category] = {};
      }

      if (shoppingList[category][ingredient.name]) {
        // Combine quantities (simplified - in reality you'd need unit conversion)
        shoppingList[category][ingredient.name].quantity += ingredient.quantity;
      } else {
        shoppingList[category][ingredient.name] = {
          quantity: ingredient.quantity,
          unit: ingredient.unit
        };
      }
    });
  });

  // Convert to array format
  const result: { [category: string]: { name: string; quantity: number; unit: string }[] } = {};
  Object.entries(shoppingList).forEach(([category, items]) => {
    result[category] = Object.entries(items).map(([name, details]) => ({
      name,
      ...details
    }));
  });

  return result;
};

export const calculateOptimalMealTiming = (dosha: DoshaType): { breakfast: string; lunch: string; dinner: string } => {
  const baseTiming = {
    breakfast: '7:00 AM',
    lunch: '12:00 PM',
    dinner: '6:00 PM'
  };

  // Adjust based on dosha
  if (dosha.includes('kapha')) {
    return {
      breakfast: '6:00 AM', // Earlier to combat sluggishness
      lunch: '12:00 PM',
      dinner: '5:30 PM' // Earlier and lighter
    };
  }

  if (dosha.includes('pitta')) {
    return {
      breakfast: '7:30 AM',
      lunch: '12:30 PM', // Slightly later when digestive fire is strongest
      dinner: '6:30 PM'
    };
  }

  if (dosha.includes('vata')) {
    return {
      breakfast: '7:00 AM',
      lunch: '12:00 PM',
      dinner: '6:00 PM' // Regular timing for stability
    };
  }

  return baseTiming;
};

export const getDoshaRecommendations = (dosha: DoshaType, imbalance?: DoshaBalance): string[] => {
  const recommendations: string[] = [];

  if (dosha.includes('vata')) {
    recommendations.push(
      'Focus on warm, moist, and grounding foods',
      'Maintain regular meal times',
      'Include healthy fats like ghee and nuts',
      'Avoid cold, dry, and raw foods',
      'Practice calming activities like gentle yoga'
    );
  }

  if (dosha.includes('pitta')) {
    recommendations.push(
      'Choose cooling and calming foods',
      'Avoid spicy, hot, and acidic foods',
      'Include sweet, bitter, and astringent tastes',
      'Eat meals at moderate temperatures',
      'Practice stress-reducing activities'
    );
  }

  if (dosha.includes('kapha')) {
    recommendations.push(
      'Favor light, warm, and stimulating foods',
      'Include pungent, bitter, and astringent tastes',
      'Limit heavy, oily, and sweet foods',
      'Eat your largest meal at lunch',
      'Engage in vigorous physical activity'
    );
  }

  return recommendations;
};