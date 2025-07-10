// src/components/Onboarding/steps/StepBasicInfo.tsx

import React from 'react';
import { statesAndUTs } from '../../../data/ayurvedic-data';

interface Props {
  formState: {
    fullName: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    state?: string;
  };
  setFormState: (field: string, value: any) => void;
}

const StepBasicInfo: React.FC<Props> = ({ formState, setFormState }) => {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>

      {/* Name & Age Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Name</label>
          <input
            type="text"
            value={formState.fullName}
            onChange={(e) => setFormState('fullName', e.target.value)}
            placeholder="Enter name"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Age</label>
          <input
            type="number"
            min="1"
            value={formState.age === 0 ? '' : formState.age}
            onChange={(e) => {
              const value = e.target.value;
              // allow only empty input or value >= 1
              if (value === '') {
                setFormState('age', '');
              } else if (Number(value) >= 1) {
                setFormState('age', Number(value));
              }
            }}
            placeholder="Enter age"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Gender</label>
        <div className="flex space-x-6">
          {['male', 'female', 'other'].map((g) => (
            <label
              key={g}
              className={`flex items-center px-4 py-2 rounded-lg border cursor-pointer shadow-sm ${formState.gender === g
                ? 'bg-yellow-100 border-yellow-500 text-yellow-700'
                : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50'
                }`}
            >
              <input
                type="radio"
                name="gender"
                value={g}
                checked={formState.gender === g}
                onChange={() => setFormState('gender', g)}
                className="form-radio text-yellow-500 focus:ring-yellow-500 mr-2"
              />
              <span className="capitalize">{g}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">State / UT</label>
        <select
          value={formState.state || ""}
          onChange={(e) => setFormState("state", e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option value="" disabled>Select a state</option>
          {statesAndUTs.map((item) => (
            <option key={item.key} value={item.value}>
              {item.value}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default StepBasicInfo;
