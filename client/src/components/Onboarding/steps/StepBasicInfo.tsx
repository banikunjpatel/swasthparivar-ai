// src/components/Onboarding/steps/StepBasicInfo.tsx

import React, { useEffect } from 'react';
import { statesAndUTs } from '../../../data/ayurvedic-data';

interface Props {
  formState: {
    fullName: string;
    age: number | '';
    gender: 'male' | 'female' | 'other';
    state?: string;
  };
  membersData: any;
  setFormState: (field: string, value: any) => void;
  errors?: { fullName?: boolean; age?: boolean; state?: boolean };
}

const StepBasicInfo: React.FC<Props> = ({ formState, membersData, setFormState, errors = {} }) => {
  useEffect(() => {
    if (
      membersData?.length > 0 &&
      !formState.state // only set if not already set
    ) {
      setFormState("state", membersData[0].state);
    }
  }, [membersData, formState.state, setFormState]);

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
            required
            className={`w-full px-4 py-3 rounded-lg border shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 
              ${errors.fullName ? 'border-red-500 ring-red-400' : 'border-gray-300'
            }`}
          />
          {errors.fullName && (
            <span className="text-red-500 text-xs">Name is required</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Age</label>
          <input
            type="number"
            min="1"
            max="99"
            required
            value={formState.age === 0 || formState.age === ''  ? '' : formState.age}
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
           className={`w-full px-4 py-3 rounded-lg border shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
              errors.age ? 'border-red-500 ring-red-400' : 'border-gray-300'
            }`}
          />
          {errors.age && (
            <span className="text-red-500 text-xs">Age is required (1-99)</span>
          )}
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
                required
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
          required
          disabled={membersData?.length > 0}
          onChange={(e) => setFormState("state", e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
            errors.state ? 'border-red-500 ring-red-400' : 'border-gray-300'
          }`} >
          <option value="" disabled>Select a state</option>
          {statesAndUTs.map((item) => (
            <option key={item.key} value={item.value}>
              {item.value}
            </option>
          ))}
        </select>
        {errors.state && (
          <span className="text-red-500 text-xs">State is required</span>
        )}
      </div>
    </div>
  );
};

export default StepBasicInfo;
