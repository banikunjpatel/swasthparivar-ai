import React from 'react';
import { DINACHARYA_RECOMMENDATIONS } from '../../data/ayurvedic-data';
import { DoshaType } from '../../types';
import { Clock, Sun, Moon, Activity } from 'lucide-react';

interface DinacharyaGuideProps {
  userDosha: any;
}

const DinacharyaGuide: React.FC<DinacharyaGuideProps> = ({ userDosha }) => {
  const getTimeIcon = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 5 && hour < 12) return Sun;
    if (hour >= 12 && hour < 18) return Sun;
    if (hour >= 18 && hour < 22) return Moon;
    return Moon;
  };

  const getDoshaSpecificGuidance = (recommendation: any) => {
    const primaryDosha = userDosha.split('-')[0] as 'vata' | 'pitta' | 'kapha';
    return recommendation.doshaSpecific[primaryDosha] || recommendation.description;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Daily Routine (Dinacharya)</h2>
        <p className="text-gray-600">Personalized for your {userDosha} constitution</p>
      </div>

      <div className="space-y-4">
        {DINACHARYA_RECOMMENDATIONS.map((recommendation, index) => {
          const TimeIcon = getTimeIcon(recommendation.time);
          
          return (
            <div key={index} className="flex space-x-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl hover:shadow-md transition-shadow">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center">
                  <TimeIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{recommendation.activity}</h3>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{recommendation.time}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-2">{recommendation.description}</p>
                
                <div className="bg-white bg-opacity-70 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-800 mb-1">For your {userDosha} constitution:</p>
                  <p className="text-sm text-gray-700">{getDoshaSpecificGuidance(recommendation)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
        <div className="flex items-center space-x-3 mb-3">
          <Activity className="h-6 w-6 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-800">Key Principles</h3>
        </div>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Consistency is more important than perfection</li>
          <li>• Adjust timing based on your natural rhythms</li>
          <li>• Listen to your body's signals and needs</li>
          <li>• Gradually implement changes rather than all at once</li>
          <li>• Seasonal adjustments may be necessary</li>
        </ul>
      </div>
    </div>
  );
};

export default DinacharyaGuide;