# domain/prakriti/rule_based_service.py
"""
Rule-based Prakriti assessment without LLM.
Calculates dosha and element percentages directly from quiz answers.
"""
from __future__ import annotations

from typing import Dict, Tuple
from datetime import datetime

from .models import (
    GeneratePrakritiResponse,
    PrakritiDistribution,
    ElementDistribution,
    PrakritiGuidance,
    PrakritiMeta,
)


def round_to_100(values: Dict[str, float]) -> Dict[str, float]:
    """
    Round values to integers ensuring they sum to exactly 100.
    Uses largest remainder method to handle rounding errors.
    """
    total = sum(values.values())
    if total == 0:
        # Equal distribution if all zeros
        equal_val = 100.0 / len(values)
        return {k: round(equal_val) for k in values.keys()}
    
    # Calculate initial rounded values
    rounded = {}
    remainders = {}
    
    for key, value in values.items():
        floor_val = int(value)
        rounded[key] = floor_val
        remainders[key] = value - floor_val
    
    # Calculate difference from 100
    current_sum = sum(rounded.values())
    diff = 100 - current_sum
    
    # Distribute the difference based on largest remainders
    if diff != 0:
        sorted_keys = sorted(remainders.keys(), key=lambda k: remainders[k], reverse=True)
        for i in range(abs(diff)):
            key = sorted_keys[i % len(sorted_keys)]
            rounded[key] += 1 if diff > 0 else -1
    
    return {k: float(v) for k, v in rounded.items()}


class RuleBasedPrakritiService:
    """Rule-based prakriti assessment service"""
    
    @staticmethod
    def calculate_from_answers(answers: Dict[str, str]) -> GeneratePrakritiResponse:
        """
        Calculate prakriti assessment from quiz answers.
        
        Args:
            answers: Dict mapping question ID to answer (A/B/C)
                    A = Vata, B = Pitta, C = Kapha
        
        Returns:
            GeneratePrakritiResponse with calculated percentages
        """
        # Step 1: Count scores
        vata_count = 0
        pitta_count = 0
        kapha_count = 0
        
        for answer in answers.values():
            answer_upper = answer.upper().strip()
            if answer_upper == 'A':
                vata_count += 1
            elif answer_upper == 'B':
                pitta_count += 1
            elif answer_upper == 'C':
                kapha_count += 1
        
        total_answers = vata_count + pitta_count + kapha_count
        
        if total_answers == 0:
            raise ValueError("No valid answers provided")
        
        # Step 2: Calculate dosha percentages
        vata_pct = (vata_count / total_answers) * 100
        pitta_pct = (pitta_count / total_answers) * 100
        kapha_pct = (kapha_count / total_answers) * 100
        
        # Round to ensure sum is exactly 100
        dosha_percentages = round_to_100({
            'vata': vata_pct,
            'pitta': pitta_pct,
            'kapha': kapha_pct
        })
        
        # Step 3: Determine primary and secondary dosha
        sorted_doshas = sorted(
            dosha_percentages.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        primary_dosha = sorted_doshas[0][0]
        secondary_dosha = sorted_doshas[1][0] if sorted_doshas[1][1] > 0 else None
        
        # Step 4: Calculate element percentages
        # Ayurveda mapping:
        # Vata = Air + Space
        # Pitta = Fire + Water
        # Kapha = Earth + Water
        
        # Direct Ayurveda mapping (no normalization)
        # Vata = Air + Space
        # Pitta = Fire + Water
        # Kapha = Earth + Water
        element_percentages = {
            'air':   round(dosha_percentages['vata'], 1),
            'space': round(dosha_percentages['vata'], 1),
            'fire':  round(dosha_percentages['pitta'], 1),
            'earth': round(dosha_percentages['kapha'], 1),
            'water': round(
                (dosha_percentages['pitta'] + dosha_percentages['kapha']) / 2,
                1
            ),
        }
        
        # Step 5: Generate basic guidance based on primary dosha
        guidance = RuleBasedPrakritiService._generate_guidance(primary_dosha)
        
        # Step 6: Build response
        return GeneratePrakritiResponse(
            primaryDosha=primary_dosha,
            secondaryDosha=secondary_dosha,
            distribution=PrakritiDistribution(
                vata=dosha_percentages['vata'],
                pitta=dosha_percentages['pitta'],
                kapha=dosha_percentages['kapha']
            ),
            elements=ElementDistribution(
                air=element_percentages['air'],
                space=element_percentages['space'],
                fire=element_percentages['fire'],
                earth=element_percentages['earth'],
                water=element_percentages['water']
            ),
            guidance=guidance,
            notes=f"Rule-based assessment from {total_answers} answers",
            meta=PrakritiMeta(
                model="rule-based-v2.0",
                prompt_version=None,
                cached=False
            )
        )
    
    @staticmethod
    def _generate_guidance(primary_dosha: str) -> PrakritiGuidance:
        """Generate basic guidance based on primary dosha"""
        
        guidance_map = {
            'vata': PrakritiGuidance(
                foods_to_favor=[
                    'Warm, cooked foods',
                    'Sweet, sour, and salty tastes',
                    'Ghee and healthy oils',
                    'Root vegetables',
                    'Warm milk and dairy',
                    'Nuts and seeds'
                ],
                foods_to_avoid=[
                    'Cold, raw foods',
                    'Dry, light foods',
                    'Bitter and astringent tastes',
                    'Excessive caffeine',
                    'Carbonated drinks'
                ],
                lifestyle_tips=[
                    'Maintain regular daily routine',
                    'Get adequate rest and sleep',
                    'Practice calming activities like yoga and meditation',
                    'Stay warm and avoid cold, windy weather',
                    'Oil massage (abhyanga) regularly',
                    'Avoid excessive travel and overstimulation'
                ]
            ),
            'pitta': PrakritiGuidance(
                foods_to_favor=[
                    'Cool, refreshing foods',
                    'Sweet, bitter, and astringent tastes',
                    'Coconut and cooling oils',
                    'Leafy greens and vegetables',
                    'Sweet fruits',
                    'Whole grains'
                ],
                foods_to_avoid=[
                    'Spicy, hot foods',
                    'Sour and salty tastes',
                    'Fried and oily foods',
                    'Red meat',
                    'Alcohol and caffeine',
                    'Fermented foods'
                ],
                lifestyle_tips=[
                    'Avoid excessive heat and sun exposure',
                    'Practice cooling activities like swimming',
                    'Maintain work-life balance',
                    'Practice patience and avoid anger',
                    'Engage in moderate exercise',
                    'Spend time in nature and cool environments'
                ]
            ),
            'kapha': PrakritiGuidance(
                foods_to_favor=[
                    'Light, warm, dry foods',
                    'Pungent, bitter, and astringent tastes',
                    'Spices and warming herbs',
                    'Legumes and beans',
                    'Light fruits like apples and pears',
                    'Honey in moderation'
                ],
                foods_to_avoid=[
                    'Heavy, oily foods',
                    'Sweet and salty tastes',
                    'Dairy products',
                    'Cold foods and drinks',
                    'Fried foods',
                    'Excessive sweets'
                ],
                lifestyle_tips=[
                    'Engage in vigorous, regular exercise',
                    'Wake up early and avoid oversleeping',
                    'Stay active and avoid sedentary lifestyle',
                    'Seek variety and new experiences',
                    'Practice energizing activities',
                    'Avoid excessive napping during the day'
                ]
            )
        }
        
        return guidance_map.get(primary_dosha, guidance_map['vata'])
