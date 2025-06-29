import React from 'react';
import { DoshaBalance, DoshaType } from '../../types';
import { Wind, Flame, Droplets } from 'lucide-react';

interface DoshaCardProps {
  prakriti: any;
  currentBalance: DoshaBalance;
}

const DoshaCard: React.FC<DoshaCardProps> = ({ prakriti, currentBalance }) => {
  const doshaInfo = {
    vata: {
      name: 'Vata',
      element: 'Air & Space',
      icon: Wind,
      color: 'blue',
      characteristics: ['Movement', 'Creativity', 'Communication'],
      gradient: 'from-blue-500 to-indigo-600'
    },
    pitta: {
      name: 'Pitta',
      element: 'Fire & Water',
      icon: Flame,
      color: 'orange',
      characteristics: ['Transformation', 'Intelligence', 'Leadership'],
      gradient: 'from-orange-500 to-red-600'
    },
    kapha: {
      name: 'Kapha',
      element: 'Earth & Water',
      icon: Droplets,
      color: 'green',
      characteristics: ['Structure', 'Stability', 'Compassion'],
      gradient: 'from-green-500 to-teal-600'
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Dosha Profile</h2>
        <p className="text-gray-600">Primary Constitution: <span className="font-semibold text-green-700 capitalize">{prakriti}</span></p>
      </div>

      <div className="space-y-6">
        {Object.entries(currentBalance).map(([dosha, percentage]) => {
          const info = doshaInfo[dosha as keyof typeof doshaInfo];
          const Icon = info.icon;
          
          return (
            <div key={dosha} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${info.gradient}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{info.name}</h3>
                    <p className="text-sm text-gray-500">{info.element}</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-800">{percentage}%</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full bg-gradient-to-r ${info.gradient} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {info.characteristics.map((char) => (
                  <span
                    key={char}
                    className={`px-3 py-1 text-xs font-medium rounded-full bg-${info.color}-100 text-${info.color}-700`}
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Balance Insight</h4>
        <p className="text-sm text-gray-600">
          {currentBalance.vata >= 40 && "Your Vata is prominent - focus on warming, grounding foods and regular routines."}
          {currentBalance.pitta >= 40 && "Your Pitta is strong - incorporate cooling foods and avoid excessive heat."}
          {currentBalance.kapha >= 40 && "Your Kapha is elevated - choose light, warming foods and increase activity."}
        </p>
      </div>
    </div>
  );
};

export default DoshaCard;