export interface QuizOption {
  label: string;
  text: string;
  description: string;
  image: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
  category: 'vata' | 'pitta' | 'kapha';
}

// Import all quiz images
import q1NarrowFrame from '../utils/quiz/q1-narrow-frame.png';
import q1MediumFrame from '../utils/quiz/q1-medium-frame.png';
import q1WideFrame from '../utils/quiz/q1-wide-frame.png';
import q2Thin from '../utils/quiz/q2-thin.png';
import q2Medium from '../utils/quiz/q2-medium.png';
import q2Heavy from '../utils/quiz/q2-heavy.png';
import q3DrySkin from '../utils/quiz/q3-dry-skin.png';
import q3OilySkin from '../utils/quiz/q3-oily-skin.png';
import q3SmoothSkin from '../utils/quiz/q3-smooth-skin.png';
import q4LightSweat from '../utils/quiz/q4-light-sweat.png';
import q4HeavySweat from '../utils/quiz/q4-heavy-sweat.png';
import q4ModerateSweat from '../utils/quiz/q4-moderate-sweat.png';
import q5Cold from '../utils/quiz/q5-cold.png';
import q5Hot from '../utils/quiz/q5-hot.png';
import q5Comfortable from '../utils/quiz/q5-comfortable.png';
import q6DryHair from '../utils/quiz/q6-dry-hair.png';
import q6StraightHair from '../utils/quiz/q6-straight-hair.png';
import q6ThickHair from '../utils/quiz/q6-thick-hair.png';
import q7SmallEyes from '../utils/quiz/q7-small-eyes.png';
import q7SharpEyes from '../utils/quiz/q7-sharp-eyes.png';
import q7LargeEyes from '../utils/quiz/q7-large-eyes.png';
import q8IrregularHunger from '../utils/quiz/q8-irregular-hunger.png';
import q8StrongHunger from '../utils/quiz/q8-strong-hunger.png';
import q8CalmHunger from '../utils/quiz/q8-calm-hunger.png';
import q9IrregularDigestion from '../utils/quiz/q9-irregular-digestion.png';
import q9FastDigestion from '../utils/quiz/q9-fast-digestion.png';
import q9SlowDigestion from '../utils/quiz/q9-slow-digestion.png';
import q10LightSleep from '../utils/quiz/q10-light-sleep.png';
import q10ModerateSleep from '../utils/quiz/q10-moderate-sleep.png';
import q10DeepSleep from '../utils/quiz/q10-deep-sleep.png';
import q11ScatteredFocus from '../utils/quiz/q11-scattered-focus.png';
import q11LaserFocus from '../utils/quiz/q11-laser-focus.png';
import q11DeepFocus from '../utils/quiz/q11-deep-focus.png';
import q12Multitasking from '../utils/quiz/q12-multitasking.png';
import q12GoalOriented from '../utils/quiz/q12-goal-oriented.png';
import q12Steady from '../utils/quiz/q12-steady.png';
import q13FastTalker from '../utils/quiz/q13-fast-talker.png';
import q13Assertive from '../utils/quiz/q13-assertive.png';
import q13Listener from '../utils/quiz/q13-listener.png';
import q14Anxious from '../utils/quiz/q14-anxious.png';
import q14Angry from '../utils/quiz/q14-angry.png';
import q14Depressed from '../utils/quiz/q14-depressed.png';
import q15QuickForget from '../utils/quiz/q15-quick-forget.png';
import q15QuickRemember from '../utils/quiz/q15-quick-remember.png';
import q15SlowPermanent from '../utils/quiz/q15-slow-permanent.png';

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Which best describes your natural body structure, especially around your shoulders, chest, and hips?",
    options: [
      {
        label: "A",
        text: "Narrow Frame",
        description: "Naturally thin, light, finds it hard to gain weight",
        image: q1NarrowFrame
      },
      {
        label: "B",
        text: "Medium Frame",
        description: "Medium, athletic, maintains weight easily",
        image: q1MediumFrame
      },
      {
        label: "C",
        text: "Wide Frame",
        description: "Naturally large, solid, gains weight easily",
        image: q1WideFrame
      }
    ],
    category: 'vata'
  },
  {
    id: 2,
    question: "Which of these best describes your weight in general throughout your life?",
    options: [
      {
        label: "A",
        text: "Thin",
        description: "It's difficult for me to gain weight",
        image: q2Thin
      },
      {
        label: "B",
        text: "Medium",
        description: "I gain and lose weight easily depending on my food and lifestyle",
        image: q2Medium
      },
      {
        label: "C",
        text: "Heavy",
        description: "I tend to gain weight easily and struggle to lose it",
        image: q2Heavy
      }
    ],
    category: 'vata'
  },
  {
    id: 3,
    question: "Which of these best describes your skin?",
    options: [
      {
        label: "A",
        text: "Always Dry",
        description: "Feels rough, can be flaky, not prone to oiliness",
        image: q3DrySkin
      },
      {
        label: "B",
        text: "Oily & Prone to Pimples",
        description: "Looks shiny, gets breakouts, sensitive and reactive",
        image: q3OilySkin
      },
      {
        label: "C",
        text: "Thick and Smooth",
        description: "Feels soft, rarely has issues, ages slowly",
        image: q3SmoothSkin
      }
    ],
    category: 'pitta'
  },
  {
    id: 4,
    question: "After 30 minutes of a good workout, what would your shirt look like?",
    options: [
      {
        label: "A",
        text: "Barely Wet",
        description: "I don't sweat too much",
        image: q4LightSweat
      },
      {
        label: "B",
        text: "Drenched",
        description: "I sweat a lot, and it can have a strong unpleasant smell",
        image: q4HeavySweat
      },
      {
        label: "C",
        text: "Moderately Sweaty",
        description: "In humid weather, my clothes get fully wet",
        image: q4ModerateSweat
      }
    ],
    category: 'pitta'
  },
  {
    id: 5,
    question: "How is your body's temperature generally?",
    options: [
      {
        label: "A",
        text: "Usually Feel Cold",
        description: "I often carry a sweater or extra layer, and I love the warmth of the sun",
        image: q5Cold
      },
      {
        label: "B",
        text: "Feel Hot Easily",
        description: "Summers are tough for me, and I prefer winters",
        image: q5Hot
      },
      {
        label: "C",
        text: "Generally Comfortable",
        description: "I'm comfortable most of the year but prefer summer a little more",
        image: q5Comfortable
      }
    ],
    category: 'vata'
  },
  {
    id: 6,
    question: "What is your hair like (naturally, not treated)?",
    options: [
      {
        label: "A",
        text: "Dry & Frizzy",
        description: "Dry, thin, rough, and frizzy; I lose hair easily",
        image: q6DryHair
      },
      {
        label: "B",
        text: "Straight & Thin",
        description: "Straight, thin hair with a tendency to premature greying",
        image: q6StraightHair
      },
      {
        label: "C",
        text: "Thick & Shiny",
        description: "Thick, dense, and naturally shiny with a lustrous texture",
        image: q6ThickHair
      }
    ],
    category: 'vata'
  },
  {
    id: 7,
    question: "Which best describes your eyes?",
    options: [
      {
        label: "A",
        text: "Small & Dry",
        description: "Small and often get dry",
        image: q7SmallEyes
      },
      {
        label: "B",
        text: "Sharp & Intense",
        description: "Medium-sized with a sharp, intense gaze",
        image: q7SharpEyes
      },
      {
        label: "C",
        text: "Large & Beautiful",
        description: "Large with thick eyelashes",
        image: q7LargeEyes
      }
    ],
    category: 'pitta'
  },
  {
    id: 8,
    question: "What's your hunger like (physical hunger)?",
    options: [
      {
        label: "A",
        text: "Irregular",
        description: "Sometimes I'm not hungry at all, other times extremely hungry",
        image: q8IrregularHunger
      },
      {
        label: "B",
        text: "Strong",
        description: "I have a good appetite and feel hungry very frequently",
        image: q8StrongHunger
      },
      {
        label: "C",
        text: "Calm",
        description: "I don't feel physically hungry too often, and it's not hard for me to fast",
        image: q8CalmHunger
      }
    ],
    category: 'pitta'
  },
  {
    id: 9,
    question: "What's your digestive health like?",
    options: [
      {
        label: "A",
        text: "Irregular",
        description: "Sometimes really good, other times I get bloated, gassy, or constipated",
        image: q9IrregularDigestion
      },
      {
        label: "B",
        text: "Very Quick",
        description: "I feel hungry even 2–3 hours after eating a meal",
        image: q9FastDigestion
      },
      {
        label: "C",
        text: "Relatively Slow",
        description: "It takes me a while to feel hungry again, and I feel sluggish after heavy meals",
        image: q9SlowDigestion
      }
    ],
    category: 'vata'
  },
  {
    id: 10,
    question: "What's your sleep like?",
    options: [
      {
        label: "A",
        text: "Light",
        description: "I wake up easily with sounds and sometimes have trouble sleeping",
        image: q10LightSleep
      },
      {
        label: "B",
        text: "Moderate",
        description: "I wake up early in the morning, ready to take action",
        image: q10ModerateSleep
      },
      {
        label: "C",
        text: "Deep",
        description: "It takes me a while to wake up in the morning",
        image: q10DeepSleep
      }
    ],
    category: 'kapha'
  },
  {
    id: 11,
    question: "When you're focusing deeply on a task or project, what describes your concentration best?",
    options: [
      {
        label: "A",
        text: "Distracted & Fast-Moving",
        description: "Constantly shifting between thoughts, tabs, and ideas or tasks",
        image: q11ScatteredFocus
      },
      {
        label: "B",
        text: "Intense & Focused",
        description: "Can deeply focus on engaging work,but interruptions feel frustrating.",
        image: q11LaserFocus
      },
      {
        label: "C",
        text: "Deep & Steady",
        description: "Takes time to begin, but once focused, can work for long uninterrupted periods.",
        image: q11DeepFocus
      }
    ],
    category: 'vata'
  },
  {
    id: 12,
    question: "Which of these describes your work style best?",
    options: [
      {
        label: "A",
        text: "Multi-tasker",
        description: "I tend to have many projects going on at once; I get excited by new ideas",
        image: q12Multitasking
      },
      {
        label: "B",
        text: "Goal-oriented",
        description: "I'm intensely goal-oriented and push myself for perfection; I love to lead",
        image: q12GoalOriented
      },
      {
        label: "C",
        text: "Steady & Consistent",
        description: "I prefer consistent, stable roles and long-term commitments",
        image: q12Steady
      }
    ],
    category: 'pitta'
  },
  {
    id: 13,
    question: "You're in a group discussion with friends or colleagues. What happens?",
    options: [
      {
        label: "A",
        text: "Fast Talker",
        description: "My words flow quickly — I talk fast and move quickly between thoughts",
        image: q13FastTalker
      },
      {
        label: "B",
        text: "Clear & Assertive",
        description: "I speak clearly and assertively when I have a precise point to make",
        image: q13Assertive
      },
      {
        label: "C",
        text: "Thoughtful Listener",
        description: "I listen more; when I do speak, my words are thoughtful and well considered",
        image: q13Listener
      }
    ],
    category: 'vata'
  },
  {
    id: 14,
    question: "Which negative emotion do you feel most frequently in life?",
    options: [
      {
        label: "A",
        text: "Anxious & Fearful",
        description: "Anxious, fearful, nervous",
        image: q14Anxious
      },
      {
        label: "B",
        text: "Angry & Impatient",
        description: "Angry, impatient, frustrated",
        image: q14Angry
      },
      {
        label: "C",
        text: "Low & Demotivated",
        description: "Depressed, low, demotivated",
        image: q14Depressed
      }
    ],
    category: 'kapha'
  },
  {
    id: 15,
    question: "Imagine you're learning something new (a recipe, topic, or instrument). Which describes your experience best?",
    options: [
      {
        label: "A",
        text: "Quick Learner, Quick Forgetter",
        description: "I learn things very quickly but also forget them easily",
        image: q15QuickForget
      },
      {
        label: "B",
        text: "Quick Learner, Good Recall",
        description: "I learn quickly and can recall them later when needed",
        image: q15QuickRemember
      },
      {
        label: "C",
        text: "Slow Learner, Never Forget",
        description: "It takes me longer to grasp something new, but once I do, I never forget it",
        image: q15SlowPermanent
      }
    ],
    category: 'kapha'
  }
];
