import React from 'react';

interface ElementProgressBarProps {
  element: 'fire' | 'water' | 'earth' | 'air' | 'space';
  percentage: number;
}

const ELEMENT_INFO = {
  fire: {
    sanskrit: 'Tejas',
    name: 'Fire',
    description: 'Digestion · Energy · Metabolism',
    gradient: 'from-orange-500 to-orange-700',
    bgGradient: 'from-orange-50 to-orange-100',
  },
  water: {
    sanskrit: 'Jala',
    name: 'Water',
    description: 'Blood · Lymph · Emotional Flow',
    gradient: 'from-blue-500 to-blue-700',
    bgGradient: 'from-blue-50 to-blue-100',
  },
  earth: {
    sanskrit: 'Prithvi',
    name: 'Earth',
    description: 'Physical Body · Stability · Grounding',
    gradient: 'from-green-500 to-green-700',
    bgGradient: 'from-green-50 to-green-100',
  },
  air: {
    sanskrit: 'Vayu',
    name: 'Air',
    description: 'Breath · Movement · Circulation',
    gradient: 'from-sky-500 to-sky-700',
    bgGradient: 'from-sky-50 to-sky-100',
  },
  space: {
    sanskrit: 'Akasha',
    name: 'Space',
    description: 'Rest · Clarity · Consciousness',
    gradient: 'from-teal-500 to-teal-700',
    bgGradient: 'from-teal-50 to-teal-100',
  },
};

export const ElementProgressBar: React.FC<ElementProgressBarProps> = ({ element, percentage }) => {
  const info = ELEMENT_INFO[element];

  return (
    <div className={`p-4 rounded-lg bg-gradient-to-r ${info.bgGradient}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="font-semibold text-gray-800">
            {info.sanskrit} · {info.name}
          </h4>
          <p className="text-sm text-gray-600">{info.description}</p>
        </div>
        <span className="text-lg font-bold text-gray-800 ml-4">{percentage}%</span>
      </div>
      
      <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${info.gradient} transition-all duration-500 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
