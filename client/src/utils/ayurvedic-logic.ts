import { DoshaType, Season } from '../types';

export const getCurrentSeason = (): Season => {
  const month = new Date().getMonth() + 1; // 1 to 12

  if (month >= 2 && month <= 3) return 'spring';       // Feb–Mar → Basant
  if (month >= 4 && month <= 5) return 'summer';       // Apr–May → Grishma
  if (month >= 6 && month <= 7) return 'monsoon';      // Jun–Jul → Varsha
  if (month >= 8 && month <= 9) return 'autumn';       // Aug–Sep → Sharad
  if (month >= 10 && month <= 11) return 'pre-winter'; // Oct–Nov → Hemant
  return 'winter'; 
};

export const getDoshaRecommendations = (dosha: DoshaType): string[] => {
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