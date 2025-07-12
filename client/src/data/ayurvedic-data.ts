import { DoshaBalance, Season, DinacharyaRecommendation, RutucharyaGuidance, Food, Recipe } from '../types';

export const PRAKRITI_QUESTIONS = [
  {
    id: 1,
    question: "What is your body frame?",
    options: [
      { text: "Thin, light frame", dosha: 'vata', points: 2 },
      { text: "Medium, muscular frame", dosha: 'pitta', points: 2 },
      { text: "Large, heavy frame", dosha: 'kapha', points: 2 }
    ]
  },
  {
    id: 2,
    question: "How is your skin type?",
    options: [
      { text: "Dry, rough, cool", dosha: 'vata', points: 2 },
      { text: "Warm, oily, prone to rashes", dosha: 'pitta', points: 2 },
      { text: "Cool, oily, smooth", dosha: 'kapha', points: 2 }
    ]
  },
  {
    id: 3,
    question: "How is your appetite?",
    options: [
      { text: "Variable, sometimes forget to eat", dosha: 'vata', points: 2 },
      { text: "Strong, get irritable when hungry", dosha: 'pitta', points: 2 },
      { text: "Steady, can skip meals easily", dosha: 'kapha', points: 2 }
    ]
  },
  {
    id: 4,
    question: "How is your digestion?",
    options: [
      { text: "Variable, gas and bloating", dosha: 'vata', points: 2 },
      { text: "Strong, sometimes heartburn", dosha: 'pitta', points: 2 },
      { text: "Slow, heavy feeling after meals", dosha: 'kapha', points: 2 }
    ]
  },
  {
    id: 5,
    question: "What is your sleep pattern?",
    options: [
      { text: "Light sleeper, wake up easily", dosha: 'vata', points: 2 },
      { text: "Moderate sleep, wake up refreshed", dosha: 'pitta', points: 2 },
      { text: "Deep sleeper, hard to wake up", dosha: 'kapha', points: 2 }
    ]
  },
  {
    id: 6,
    question: "How do you handle stress?",
    options: [
      { text: "Anxious, worried thoughts", dosha: 'vata', points: 2 },
      { text: "Irritable, quick temper", dosha: 'pitta', points: 2 },
      { text: "Calm, tend to withdraw", dosha: 'kapha', points: 2 }
    ]
  },
  {
    id: 7,
    question: "What is your energy level?",
    options: [
      { text: "Comes in spurts, crashes easily", dosha: 'vata', points: 2 },
      { text: "Moderate, consistent throughout day", dosha: 'pitta', points: 2 },
      { text: "Steady, slow to start", dosha: 'kapha', points: 2 }
    ]
  },
  {
    id: 8,
    question: "How is your memory?",
    options: [
      { text: "Quick to learn, quick to forget", dosha: 'vata', points: 2 },
      { text: "Sharp, focused, good retention", dosha: 'pitta', points: 2 },
      { text: "Slow to learn, excellent long-term memory", dosha: 'kapha', points: 2 }
    ]
  }
];

export const DINACHARYA_RECOMMENDATIONS: DinacharyaRecommendation[] = [
  {
    time: "5:00 - 6:00 AM",
    activity: "Wake up",
    description: "Rise before sunrise for optimal energy",
    doshaSpecific: {
      vata: "Wake up gently, avoid rushing",
      pitta: "Consistent wake time is important",
      kapha: "Early rising helps combat sluggishness"
    }
  },
  {
    time: "6:00 - 7:00 AM",
    activity: "Morning cleansing",
    description: "Brush teeth, scrape tongue, oil pulling",
    doshaSpecific: {
      vata: "Gentle oil massage before shower",
      pitta: "Cool water for face wash",
      kapha: "Dry brushing to stimulate circulation"
    }
  },
  {
    time: "7:00 - 8:00 AM",
    activity: "Exercise/Yoga",
    description: "Physical activity to energize the body",
    doshaSpecific: {
      vata: "Gentle yoga, walking, tai chi",
      pitta: "Moderate exercise, avoid overheating",
      kapha: "Vigorous exercise, running, strength training"
    }
  },
  {
    time: "8:00 - 9:00 AM",
    activity: "Breakfast",
    description: "Light, warm, easily digestible meal",
    doshaSpecific: {
      vata: "Warm, moist, nourishing foods",
      pitta: "Cool, fresh, not too spicy",
      kapha: "Light, warming, stimulating foods"
    }
  },
  {
    time: "12:00 - 1:00 PM",
    activity: "Lunch",
    description: "Main meal when digestive fire is strongest",
    doshaSpecific: {
      vata: "Largest meal, warm and oily",
      pitta: "Balanced meal, not too hot",
      kapha: "Moderate portion, light and warm"
    }
  },
  {
    time: "6:00 - 7:00 PM",
    activity: "Dinner",
    description: "Light meal, easy to digest",
    doshaSpecific: {
      vata: "Warm, cooked foods, not too late",
      pitta: "Cooling foods, avoid spicy",
      kapha: "Very light, early dinner"
    }
  },
  {
    time: "9:00 - 10:00 PM",
    activity: "Wind down",
    description: "Prepare for sleep, avoid screens",
    doshaSpecific: {
      vata: "Calming activities, warm bath",
      pitta: "Cool down, release the day",
      kapha: "Light activity, avoid heavy foods"
    }
  }
];

export const RUTUCHARYA_GUIDANCE: { [key in Season]: RutucharyaGuidance } = {
  spring: {
    season: 'spring',
    foods_to_favor: ['bitter greens', 'barley', 'honey', 'light fruits', 'warming spices'],
    foods_to_avoid: ['heavy foods', 'dairy', 'sweet fruits', 'cold foods'],
    lifestyle_tips: ['Exercise more', 'Dry brushing', 'Detox practices', 'Rise early'],
    dosha_considerations: {
      vata: ['Moderate exercise', 'Warm foods still important'],
      pitta: ['Avoid overheating', 'Cool morning exercise'],
      kapha: ['Vigorous exercise', 'Reduce heavy foods', 'Stimulating activities']
    }
  },
  summer: {
    season: 'summer',
    foods_to_favor: ['sweet fruits', 'cooling vegetables', 'coconut', 'mint', 'rose water'],
    foods_to_avoid: ['spicy foods', 'hot foods', 'sour foods', 'alcohol'],
    lifestyle_tips: ['Stay cool', 'Avoid midday sun', 'Swimming', 'Cool environments'],
    dosha_considerations: {
      vata: ['Stay hydrated', 'Avoid too much cold'],
      pitta: ['Cooling foods essential', 'Avoid heated activities', 'Gentle exercise'],
      kapha: ['Light, cooling foods', 'Moderate exercise']
    }
  },
  monsoon: {
    season: 'monsoon',
    foods_to_favor: ['warm spices', 'ginger', 'garlic', 'cooked vegetables', 'herbal teas'],
    foods_to_avoid: ['raw foods', 'cold drinks', 'leafy greens', 'street food'],
    lifestyle_tips: ['Stay dry', 'Boost immunity', 'Warm foods', 'Indoor exercises'],
    dosha_considerations: {
      vata: ['Extra warmth needed', 'Grounding foods'],
      pitta: ['Avoid excess heat', 'Gentle warming'],
      kapha: ['Prevent congestion', 'Warming spices important']
    }
  },
  autumn: {
    season: 'autumn',
    foods_to_favor: ['root vegetables', 'warming spices', 'nuts', 'warm milk', 'sesame oil'],
    foods_to_avoid: ['cold foods', 'raw foods', 'dry foods', 'bitter tastes'],
    lifestyle_tips: ['Oil massage', 'Warm baths', 'Regular routine', 'Grounding activities'],
    dosha_considerations: {
      vata: ['Most important season for care', 'Warm, moist, heavy foods'],
      pitta: ['Cooling down from summer heat', 'Sweet, bitter tastes'],
      kapha: ['Prepare for winter', 'Warming foods']
    }
  },
  winter: {
    season: 'winter',
    foods_to_favor: ['warm foods', 'healthy fats', 'hot spices', 'nuts', 'warming teas'],
    foods_to_avoid: ['cold foods', 'ice cream', 'raw foods', 'bitter foods'],
    lifestyle_tips: ['Stay warm', 'Oil massage', 'Hearty foods', 'Indoor activities'],
    dosha_considerations: {
      vata: ['Heavy, warm, oily foods', 'Extra care needed'],
      pitta: ['Can handle more heat', 'Warming foods okay'],
      kapha: ['Stimulating foods', 'Avoid too much heaviness']
    }
  },
  'pre-winter': {
    season: 'pre-winter',
    foods_to_favor: ['warming spices', 'light foods', 'honey', 'ginger', 'turmeric'],
    foods_to_avoid: ['heavy foods', 'excess dairy', 'cold foods', 'sweet foods'],
    lifestyle_tips: ['Prepare for spring', 'Light detox', 'Increase activity', 'Early rising'],
    dosha_considerations: {
      vata: ['Transition carefully', 'Still need warming foods'],
      pitta: ['Gentle warming', 'Prepare for hot season'],
      kapha: ['Begin spring cleansing', 'Reduce heavy foods']
    }
  }
};

export const SAMPLE_FOODS: Food[] = [
  {
    id: 'rice',
    name: 'Basmati Rice',
    category: 'grain',
    taste: ['sweet'],
    doshaEffect: { vata: 'decrease', pitta: 'neutral', kapha: 'increase' },
    season: ['spring', 'summer', 'monsoon', 'autumn', 'winter', 'pre-winter'],
    nutrition: { calories: 205, protein: 4.3, carbs: 45, fat: 0.4, fiber: 0.6, vitamins: ['B1', 'B3'], minerals: ['manganese'] }
  },
  {
    id: 'quinoa',
    name: 'Quinoa',
    category: 'grain',
    taste: ['sweet', 'astringent'],
    doshaEffect: { vata: 'neutral', pitta: 'decrease', kapha: 'neutral' },
    season: ['autumn', 'winter', 'spring'],
    nutrition: { calories: 222, protein: 8, carbs: 39, fat: 3.6, fiber: 5.2, vitamins: ['B6', 'folate'], minerals: ['iron', 'magnesium'] }
  },
  {
    id: 'spinach',
    name: 'Spinach',
    category: 'vegetable',
    taste: ['bitter', 'astringent'],
    doshaEffect: { vata: 'increase', pitta: 'decrease', kapha: 'decrease' },
    season: ['winter', 'spring'],
    nutrition: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, vitamins: ['K', 'A', 'C'], minerals: ['iron', 'folate'] }
  },
  {
    id: 'sweet-potato',
    name: 'Sweet Potato',
    category: 'vegetable',
    taste: ['sweet'],
    doshaEffect: { vata: 'decrease', pitta: 'neutral', kapha: 'increase' },
    season: ['autumn', 'winter'],
    nutrition: { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, vitamins: ['A', 'C', 'B6'], minerals: ['potassium', 'manganese'] }
  },
  {
    id: 'ginger',
    name: 'Fresh Ginger',
    category: 'spice',
    taste: ['pungent', 'sweet'],
    doshaEffect: { vata: 'decrease', pitta: 'increase', kapha: 'decrease' },
    season: ['monsoon', 'autumn', 'winter', 'pre-winter'],
    nutrition: { calories: 1, protein: 0, carbs: 0.2, fat: 0, fiber: 0, vitamins: ['C'], minerals: ['potassium'] }
  }
];

export const SAMPLE_RECIPES: Recipe[] = [
  {
    id: 'moong-dal-chilla',
    name: 'Moong dal chilla',
    description: 'A nourishing, easily digestible meal perfect for all doshas',
    ingredients: [
      { foodId: 'rice', name: 'Basmati Rice', quantity: 0.5, unit: 'cup' },
      { foodId: 'mung-dal', name: 'Mung Dal', quantity: 0.5, unit: 'cup' },
      { foodId: 'turmeric', name: 'Turmeric', quantity: 0.5, unit: 'tsp' },
      { foodId: 'cumin', name: 'Cumin Seeds', quantity: 1, unit: 'tsp' },
      { foodId: 'ginger', name: 'Fresh Ginger', quantity: 1, unit: 'inch' },
      { foodId: 'ghee', name: 'Ghee', quantity: 1, unit: 'tbsp' }
    ],
    instructions: [
      'Wash rice and dal together until water runs clear',
      'Heat ghee in a pot and add cumin seeds',
      'Add ginger and sauté for 30 seconds',
      'Add rice and dal, stir for 2 minutes',
      'Add turmeric and 4 cups water',
      'Bring to boil, then simmer covered for 25-30 minutes',
      'Add salt to taste and serve hot'
    ],
    prepTime: 10,
    cookTime: 35,
    servings: 2,
    mealType: 'lunch',
    doshaBalance: { vata: 80, pitta: 85, kapha: 70 },
    season: ['spring', 'summer', 'monsoon', 'autumn', 'winter', 'pre-winter'],
    difficulty: 'easy',
    tags: ['detox', 'healing', 'balanced'],
    nutrition: { calories: 280, protein: 12, carbs: 52, fat: 4, fiber: 8, vitamins: ['B1', 'folate'], minerals: ['iron', 'magnesium'] },
    substitutes: {
      'Mung Dal': ['Red lentils', 'Yellow split peas'],
      'Basmati Rice': ['Brown rice', 'Quinoa']
    }
  },
  {
    id: 'ragi-dosa',
    name: 'Ragi dosa',
    description: 'Warming, anti-inflammatory drink perfect for evening',
    ingredients: [
      { foodId: 'almond-milk', name: 'Almond Milk', quantity: 1, unit: 'cup' },
      { foodId: 'turmeric', name: 'Turmeric Powder', quantity: 0.5, unit: 'tsp' },
      { foodId: 'ginger', name: 'Fresh Ginger', quantity: 0.25, unit: 'inch' },
      { foodId: 'cinnamon', name: 'Cinnamon', quantity: 0.25, unit: 'tsp' },
      { foodId: 'honey', name: 'Raw Honey', quantity: 1, unit: 'tsp' },
      { foodId: 'coconut-oil', name: 'Coconut Oil', quantity: 0.5, unit: 'tsp' }
    ],
    instructions: [
      'Heat almond milk in a small saucepan',
      'Add turmeric, ginger, and cinnamon',
      'Simmer for 5 minutes, whisking occasionally',
      'Strain if desired',
      'Add honey and coconut oil when slightly cooled',
      'Whisk well and serve warm'
    ],
    prepTime: 5,
    cookTime: 8,
    servings: 1,
    mealType: 'snack',
    doshaBalance: { vata: 85, pitta: 60, kapha: 65 },
    season: ['monsoon', 'autumn', 'winter', 'pre-winter'],
    difficulty: 'easy',
    tags: ['anti-inflammatory', 'warming', 'bedtime'],
    nutrition: { calories: 95, protein: 2, carbs: 8, fat: 6, fiber: 1, vitamins: ['E'], minerals: ['calcium'] }
  }
];

// export const SAMPLE_MEAL_PLAN = {
//   weekStart: new Date(), // Replace with the actual start date
//   days: [],
// };
export const SAMPLE_MEAL_PLAN = {
  "userId": "665f0d8e4d62d7a1f4c23a88",
  "weekStart": "2025-06-30",
  "plan": {
    "Monday": {
      "breakfast": {
        "base": "Moong dal chilla",
        "customizations": {
          "hiral": "with mint chutney (Pitta pacifying, no nuts)",
          "nikunj": "with ginger chutney (Kapha pacifying, no soy)"
        }
      },
      "lunch": {
        "base": "Vegetable khichdi",
        "customizations": {
          "hiral": "with extra cumin (Pitta pacifying, no nuts)",
          "nikunj": "with extra black pepper (Kapha pacifying, no soy)"
        }
      },
      "dinner": {
        "base": "Palak paneer with roti",
        "customizations": {
          "hiral": "with extra coriander (Pitta pacifying, no nuts)",
          "nikunj": "with extra garlic (Kapha pacifying, no soy)"
        }
      }
    },
    "Tuesday": {
      "breakfast": {
        "base": "Ragi porridge",
        "customizations": {
          "hiral": "with cardamom (Pitta pacifying, no nuts)",
          "nikunj": "with cinnamon (Kapha pacifying, no soy)"
        }
      },
      "lunch": {
        "base": "Lentil soup with brown rice",
        "customizations": {
          "hiral": "with lemon juice (Pitta pacifying, no nuts)",
          "nikunj": "with extra black pepper (Kapha pacifying, no soy)"
        }
      },
      "dinner": {
        "base": "Mixed vegetable curry with quinoa",
        "customizations": {
          "hiral": "with extra cilantro (Pitta pacifying, no nuts)",
          "nikunj": "with extra ginger (Kapha pacifying, no soy)"
        }
      }
    },
    "Wednesday": {
      "breakfast": {
        "base": "Oats upma",
        "customizations": {
          "hiral": "with fennel seeds (Pitta pacifying, no nuts)",
          "nikunj": "with extra turmeric (Kapha pacifying, no soy)"
        }
      },
      "lunch": {
        "base": "Chickpea salad",
        "customizations": {
          "hiral": "with cucumber (Pitta pacifying, no nuts)",
          "nikunj": "with extra lemon (Kapha pacifying, no soy)"
        }
      },
      "dinner": {
        "base": "Aloo gobi with millet roti",
        "customizations": {
          "hiral": "with extra coriander (Pitta pacifying, no nuts)",
          "nikunj": "with extra cumin (Kapha pacifying, no soy)"
        }
      }
    },
    "Thursday": {
      "breakfast": {
        "base": "Poha",
        "customizations": {
          "hiral": "with pomegranate seeds (Pitta pacifying, no nuts)",
          "nikunj": "with extra curry leaves (Kapha pacifying, no soy)"
        }
      },
      "lunch": {
        "base": "Vegetable pulao",
        "customizations": {
          "hiral": "with mint leaves (Pitta pacifying, no nuts)",
          "nikunj": "with extra black pepper (Kapha pacifying, no soy)"
        }
      },
      "dinner": {
        "base": "Tofu stir-fry with rice",
        "customizations": {
          "hiral": "with extra basil (Pitta pacifying, no nuts)",
          "nikunj": "with extra garlic (Kapha pacifying, no soy)"
        }
      }
    },
    "Friday": {
      "breakfast": {
        "base": "Idli with sambar",
        "customizations": {
          "hiral": "with coconut chutney (Pitta pacifying, no nuts)",
          "nikunj": "with tomato chutney (Kapha pacifying, no soy)"
        }
      },
      "lunch": {
        "base": "Rajma with brown rice",
        "customizations": {
          "hiral": "with extra cumin (Pitta pacifying, no nuts)",
          "nikunj": "with extra ginger (Kapha pacifying, no soy)"
        }
      },
      "dinner": {
        "base": "Baingan bharta with jowar roti",
        "customizations": {
          "hiral": "with extra coriander (Pitta pacifying, no nuts)",
          "nikunj": "with extra garlic (Kapha pacifying, no soy)"
        }
      }
    },
    "Saturday": {
      "breakfast": {
        "base": "Dosa with chutney",
        "customizations": {
          "hiral": "with coconut chutney (Pitta pacifying, no nuts)",
          "nikunj": "with tomato chutney (Kapha pacifying, no soy)"
        }
      },
      "lunch": {
        "base": "Paneer tikka with quinoa",
        "customizations": {
          "hiral": "with extra mint (Pitta pacifying, no nuts)",
          "nikunj": "with extra black pepper (Kapha pacifying, no soy)"
        }
      },
      "dinner": {
        "base": "Vegetable stew with rice",
        "customizations": {
          "hiral": "with extra cilantro (Pitta pacifying, no nuts)",
          "nikunj": "with extra ginger (Kapha pacifying, no soy)"
        }
      }
    },
    "Sunday": {
      "breakfast": {
        "base": "Aloo paratha",
        "customizations": {
          "hiral": "with mint raita (Pitta pacifying, no nuts)",
          "nikunj": "with plain yogurt (Kapha pacifying, no soy)"
        }
      },
      "lunch": {
        "base": "Vegetable biryani",
        "customizations": {
          "hiral": "with extra mint (Pitta pacifying, no nuts)",
          "nikunj": "with extra black pepper (Kapha pacifying, no soy)"
        }
      },
      "dinner": {
        "base": "Dal tadka with basmati rice",
        "customizations": {
          "hiral": "with extra cumin (Pitta pacifying, no nuts)",
          "nikunj": "with extra garlic (Kapha pacifying, no soy)"
        }
      }
    }
  }
}

export const statesAndUTs = [
  { key: "Andhra Pradesh", value: "Andhra Pradesh" },
  { key: "Arunachal Pradesh", value: "Arunachal Pradesh" },
  { key: "Assam", value: "Assam" },
  { key: "Bihar", value: "Bihar" },
  { key: "Chhattisgarh", value: "Chhattisgarh" },
  { key: "Goa", value: "Goa" },
  { key: "Gujarat", value: "Gujarat" },
  { key: "Haryana", value: "Haryana" },
  { key: "Himachal Pradesh", value: "Himachal Pradesh" },
  { key: "Jharkhand", value: "Jharkhand" },
  { key: "Karnataka", value: "Karnataka" },
  { key: "Kerala", value: "Kerala" },
  { key: "Madhya Pradesh", value: "Madhya Pradesh" },
  { key: "Maharashtra", value: "Maharashtra" },
  { key: "Manipur", value: "Manipur" },
  { key: "Meghalaya", value: "Meghalaya" },
  { key: "Mizoram", value: "Mizoram" },
  { key: "Nagaland", value: "Nagaland" },
  { key: "Odisha", value: "Odisha" },
  { key: "Punjab", value: "Punjab" },
  { key: "Rajasthan", value: "Rajasthan" },
  { key: "Sikkim", value: "Sikkim" },
  { key: "Tamil Nadu", value: "Tamil Nadu" },
  { key: "Telangana", value: "Telangana" },
  { key: "Tripura", value: "Tripura" },
  { key: "Uttar Pradesh", value: "Uttar Pradesh" },
  { key: "Uttarakhand", value: "Uttarakhand" },
  { key: "West Bengal", value: "West Bengal" },
  { key: "Andaman and Nicobar Islands", value: "Andaman and Nicobar Islands" },
  { key: "Chandigarh", value: "Chandigarh" },
  { key: "Dadra and Nagar Haveli and Daman and Diu", value: "Dadra and Nagar Haveli and Daman and Diu" },
  { key: "Delhi", value: "Delhi" },
  { key: "Jammu and Kashmir", value: "Jammu and Kashmir" },
  { key: "Ladakh", value: "Ladakh" },
  { key: "Lakshadweep", value: "Lakshadweep" },
  { key: "Puducherry", value: "Puducherry" }
];

interface PrakritiQuestion {
  id: number;
  question: string;
  options: string[];
}

export const PrakritiQuestions: PrakritiQuestion[] = [
  {
    id: 1,
    question: 'How would you describe your body build and weight tendencies?',
    options: [
      'Thin, finds it hard to gain weight',
      'Medium build, maintains weight easily',
      'Large, solid build, gains weight easily',
    ],
  },
  {
    id: 2,
    question: 'How is your energy throughout the day?',
    options: [
      'Bursts of energy, then fatigue',
      'Intense but short bursts',
      'Slow to start but lasts long — steady energy',
    ],
  },
  {
    id: 3,
    question: 'How would you describe your digestion and appetite?',
    options: [
      'Variable appetite, may skip meals',
      'Strong appetite, gets irritable if missed',
      'Slow digestion, often feels heavy after meals',
    ],
  },
  {
    id: 4,
    question: 'How does your skin and hair generally feel?',
    options: [
      'Dry, rough, prone to cracking',
      'Warm, prone to acne or redness',
      'Soft, smooth, moist and cool',
    ],
  },
  {
    id: 5,
    question: 'What is your typical emotional reaction under stress?',
    options: [
      'Anxiety, worry, overthinking',
      'Frustration, anger, impatience',
      'Irritated or angry',
    ],
  },
  {
    id: 6,
    question: 'How would you describe your sleep quality?',
    options: [
      'Light, interrupted, hard to fall asleep',
      'Deep but disturbed by dreams or heat',
      'Sleeps soundly but not for long',
    ],
  },
  {
    id: 7,
    question: 'Which type of weather do you prefer?',
    options: [
      'Warm, humid weather',
      'Cold weather',
      'Cool and dry weather',
    ],
  },
  {
    id: 8,
    question: 'Which statement best reflects your personality style?',
    options: [
      'Creative, spontaneous, quick to learn',
      'Focused, confident, likes leading',
      'Calm, supportive, loyal',
    ],
  },
  {
    id: 9,
    question: 'Which lifestyle trait best matches you?',
    options: [
      'Flexible, changes plans often',
      'I like discipline and order',
      'I prefer routines and slow pace',
    ],
  },
];

