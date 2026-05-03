import React, { useState } from 'react';

/* ------------------ Types ------------------ */

interface DoshaDistribution {
  vata: number;
  pitta: number;
  kapha: number;
}

interface PrakritiGuidance {
  foods_to_favor: string[];
  foods_to_avoid: string[];
  lifestyle_tips: string[];
}

interface PrakritiDetailsProps {
  primaryDosha: string;
  secondaryDosha: string;
  distribution: DoshaDistribution;
  guidance: PrakritiGuidance;
}

/* ------------------ Small UI ------------------ */

const DoshaBar = ({
  label,
  value,
}: {
  label: string;
  value: number;
}) => (
  <div>
    <div className="flex justify-between text-xs text-gray-600 mb-1">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="w-full h-2 bg-green-100 rounded-full">
      <div
        className="h-2 bg-green-600 rounded-full transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

/* ------------------ Main Card ------------------ */

const PrakritiDetailsCard: React.FC<PrakritiDetailsProps> = ({
  primaryDosha,
  secondaryDosha,
  distribution,
  guidance,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="mt-4 space-y-4">

      {/* Prakriti Type + Distribution */}
      <div className="p-4 rounded-xl bg-green-50 border border-green-100">
        <div className="text-sm text-gray-600 mb-2">
          Prakriti Type
        </div>

        <div className="flex gap-2">
          <span className="px-4 py-1 rounded-full bg-green-600 text-white text-xs font-semibold">
            {primaryDosha.toUpperCase()}
          </span>
          <span className="px-4 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
            {secondaryDosha.toUpperCase()}
          </span>
        </div>

        {/* Distribution */}
        <div className="mt-4 space-y-3">
          <DoshaBar label="Vata" value={distribution.vata} />
          <DoshaBar label="Pitta" value={distribution.pitta} />
          <DoshaBar label="Kapha" value={distribution.kapha} />
        </div>

        {/* Expand / Collapse CTA */}
        <button
          onClick={() => setShowDetails((prev) => !prev)}
          className="
            mt-4 w-full
            flex items-center justify-center gap-2
            text-sm font-medium
            text-green-700
            hover:text-green-800
            transition
          "
        >
          {showDetails ? (
            <>
              Hide Guidance <span className="text-lg">▲</span>
            </>
          ) : (
            <>
              🌿 View Personalized Guidance <span className="text-lg">▼</span>
            </>
          )}
        </button>
      </div>

      {/* Expandable Details */}
      {showDetails && (
        <div className="space-y-4">

          {/* Foods to Favor */}
          <div className="p-4 rounded-xl bg-green-50 border border-green-100">
            <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              🥗 Foods to Favor
            </div>
            <div className="flex flex-wrap gap-2">
              {guidance.foods_to_favor.map((food, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs"
                >
                  {food}
                </span>
              ))}
            </div>
          </div>

          {/* Foods to Avoid */}
          <div className="p-4 rounded-xl bg-red-50 border border-red-100">
            <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              🚫 Foods to Avoid
            </div>
            <div className="flex flex-wrap gap-2">
              {guidance.foods_to_avoid.map((food, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs"
                >
                  {food}
                </span>
              ))}
            </div>
          </div>

          {/* Lifestyle Tips */}
          <div className="p-4 rounded-xl bg-white border border-gray-100">
            <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              🌿 Lifestyle Tips
            </div>
            <ul className="space-y-2">
              {guidance.lifestyle_tips.map((tip, i) => (
                <li
                  key={i}
                  className="text-sm text-gray-600 flex gap-2"
                >
                  <span className="text-green-600">✔</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

        </div>
      )}
    </div>
  );
};

export default PrakritiDetailsCard;
