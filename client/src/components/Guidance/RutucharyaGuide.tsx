import React, { useState } from 'react';
import { RUTUCHARYA_GUIDANCE } from '../../data/ayurvedic-data';
import { Season } from '../../types';
import { Leaf, Snowflake, Sun, CloudRain, Wind, CheckCircle2, ArrowUpDown } from 'lucide-react';

interface RutucharyaGuideProps {
  userDosha: any;
  currentSeason: Season;
}

/* ─── Static metadata ─────────────────────────────────────────────────────── */

const SEASON_INFO = {
  spring:  { icon: Leaf,       name: 'Spring',  gradient: 'from-green-500 to-emerald-600'  },
  summer:  { icon: Sun,        name: 'Summer',  gradient: 'from-yellow-500 to-orange-500'  },
  monsoon: { icon: CloudRain,  name: 'Monsoon', gradient: 'from-blue-500 to-indigo-600'    },
  autumn:  { icon: Wind,       name: 'Autumn',  gradient: 'from-orange-500 to-red-500'     },
  winter:  { icon: Snowflake,  name: 'Winter',  gradient: 'from-blue-500 to-purple-600'    },
};

const DOSHA_META = {
  vata:  { emoji: '🌿', label: 'Vata'  },
  pitta: { emoji: '🔥', label: 'Pitta' },
  kapha: { emoji: '💧', label: 'Kapha' },
};

const ELEMENT_META = {
  earth: { icon: '🌱', bg: 'bg-amber-50',  border: 'border-amber-200',  heading: 'text-amber-800',  name: 'EARTH', desc: 'Stability & Nourishment' },
  water: { icon: '💧', bg: 'bg-blue-50',   border: 'border-blue-200',   heading: 'text-blue-800',   name: 'WATER', desc: 'Flow & Hydration'        },
  fire:  { icon: '🔥', bg: 'bg-red-50',    border: 'border-red-200',    heading: 'text-red-800',    name: 'FIRE',  desc: 'Transformation & Energy' },
  air:   { icon: '🌬️', bg: 'bg-sky-50',    border: 'border-sky-200',    heading: 'text-sky-800',    name: 'AIR',   desc: 'Movement & Circulation'  },
  space: { icon: '✨', bg: 'bg-purple-50', border: 'border-purple-200', heading: 'text-purple-800', name: 'SPACE', desc: 'Clarity & Consciousness'  },
};

const ELEMENTS = ['earth', 'water', 'fire', 'air', 'space'] as const;

/* ─── Component ──────────────────────────────────────────────────────────── */

const RutucharyaGuide: React.FC<RutucharyaGuideProps> = ({ userDosha, currentSeason }) => {
  const initialDosha = userDosha && typeof userDosha === 'string'
    ? userDosha.split('-')[0].toLowerCase()
    : 'vata';

  const [selectedSeason, setSelectedSeason] = useState<Season>(currentSeason);
  const [selectedDosha, setSelectedDosha] = useState<'vata' | 'pitta' | 'kapha'>(
    ['vata', 'pitta', 'kapha'].includes(initialDosha)
      ? (initialDosha as 'vata' | 'pitta' | 'kapha')
      : 'vata'
  );

  // Normalise pre-winter → winter (pre-winter is no longer a selector option)
  const effectiveSeason = selectedSeason === 'pre-winter' ? 'winter' : selectedSeason;
  const guidance        = RUTUCHARYA_GUIDANCE[effectiveSeason];

  const getDoshaGuidance = () =>
    guidance?.dosha_considerations?.[selectedDosha]?.guidance || [];

  const getSeasonalElement = (el: typeof ELEMENTS[number]) =>
    guidance?.element_guidance?.[el] || [];

  const getDoshaElement = (el: typeof ELEMENTS[number]) =>
    guidance?.dosha_considerations?.[selectedDosha]?.element_guidance?.[el] || [];

  return (
    <div className="w-full space-y-6">

      {/* ── HERO HEADER — matches Dashboard title style ─────────────── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-green-600 to-teal-600 shadow-lg">
        {/* Decorative circles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -bottom-6 -left-6 w-32 h-32 sm:w-48 sm:h-48 bg-white/5 rounded-full" />
          <div className="absolute -top-10 right-10 sm:right-20 w-48 h-48 sm:w-64 sm:h-64 bg-white/5 rounded-full" />
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 text-3xl sm:text-5xl opacity-10 select-none">🕉️</div>
          <div className="absolute right-0 top-0 h-full w-32 sm:w-44 hidden md:flex flex-col items-end justify-end pr-2 sm:pr-4 pb-2 sm:pb-4 opacity-20 text-4xl sm:text-6xl pointer-events-none select-none">
            <div>🌿</div>
            <div className="text-2xl sm:text-3xl">🌿🌿</div>
          </div>
        </div>

        <div className="relative p-4 sm:p-6 md:p-8">
          {/* Title row */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <span className="text-xl">🌿</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                Your Family's Seasonal Wisdom
              </h1>
              <p className="text-white/70 text-xs sm:text-sm mt-0.5">
                Five Elements wisdom for your body type and season
              </p>
            </div>
          </div>

          {/* ── Dosha pills ── */}
          <div className="flex flex-wrap gap-2 mb-3">
            {(Object.entries(DOSHA_META) as [keyof typeof DOSHA_META, typeof DOSHA_META[keyof typeof DOSHA_META]][]).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => setSelectedDosha(key)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  selectedDosha === key
                    ? 'bg-white text-green-700 shadow-md'
                    : 'bg-white/15 border border-white/25 text-white hover:bg-white/25'
                }`}
              >
                <span>{meta.emoji}</span>
                {meta.label}
              </button>
            ))}
          </div>

          {/* ── Season pills ── */}
          <div className="flex flex-wrap gap-2">
            {(Object.entries(SEASON_INFO) as [string, typeof SEASON_INFO[keyof typeof SEASON_INFO]][]).map(([key, cfg]) => {
              const Icon = cfg.icon;
              const active = effectiveSeason === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedSeason(key as Season)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    active
                      ? 'bg-white text-green-700 border-transparent shadow-sm font-semibold'
                      : 'bg-white/10 border-white/25 text-white/90 hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cfg.name}
                  {key === currentSeason && !active && (
                    <span className="ml-1 w-1.5 h-1.5 rounded-full bg-white inline-block opacity-70" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── GENERAL BODY TYPE GUIDANCE ──────────────────────────────── */}
      {getDoshaGuidance().length > 0 && (
        <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
          <div className="bg-secondary/60 border-b border-green-100 px-5 py-3 flex items-center gap-2">
            <span className="text-xl">🧘</span>
            <h3 className="font-bold text-gray-800 text-base">
              General {DOSHA_META[selectedDosha].label} Body Type Guidance
            </h3>
          </div>
          <div className="px-5 py-4 grid sm:grid-cols-2 gap-x-8 gap-y-2">
            {getDoshaGuidance().map((text, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ELEMENT CARDS ────────────────────────────────────────────── */}
      <div className="space-y-4">
        {ELEMENTS.map((el) => {
          const seasonal = getSeasonalElement(el);
          const dosha    = getDoshaElement(el);
          if (seasonal.length === 0 && dosha.length === 0) return null;

          const meta = ELEMENT_META[el];
          return (
            <div key={el} className={`${meta.bg} ${meta.border} border rounded-2xl overflow-hidden shadow-sm`}>
              {/* Card header */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-inherit bg-white/50">
                <div className={`w-10 h-10 rounded-full ${meta.bg} border ${meta.border} flex items-center justify-center text-xl shrink-0`}>
                  {meta.icon}
                </div>
                <div>
                  <h4 className={`font-bold text-base ${meta.heading} tracking-wide`}>{meta.name}</h4>
                  <p className="text-xs text-gray-500">{meta.desc}</p>
                </div>
              </div>

              {/* Two columns */}
              <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/60">
                {/* Include More */}
                <div className="p-4">
                  {seasonal.length > 0 && (
                    <>
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Include More</span>
                      </div>
                      <ul className="space-y-1">
                        {seasonal.map((t, i) => (
                          <li key={i} className={`flex items-start gap-1.5 text-sm ${meta.heading}`}>
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                {/* Balance With */}
                <div className="p-4 bg-white/30">
                  {dosha.length > 0 && (
                    <>
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                          <ArrowUpDown className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Balance With</span>
                      </div>
                      <ul className="space-y-1">
                        {dosha.map((t, i) => (
                          <li key={i} className={`flex items-start gap-1.5 text-sm ${meta.heading}`}>
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── SEASONAL TIP ─────────────────────────────────────────────── */}
      {guidance?.lifestyle_tips?.length > 0 && (
        <div className="bg-secondary/60 border border-green-100 rounded-2xl px-5 py-4 flex items-start gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl flex items-center justify-center shrink-0">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm mb-1">Seasonal Tip</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {guidance.lifestyle_tips.join(' · ')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RutucharyaGuide;
