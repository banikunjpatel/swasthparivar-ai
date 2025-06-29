// src/components/Onboarding/steps/StepBasicInfo.tsx

import React from 'react';

interface Props {
  formState: {
    fullName: string;
    age: number;
    gender: 'male' | 'female' | 'other';
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
            min="0"
            value={formState.age}
            onChange={(e) => setFormState('age', Number(e.target.value))}
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
              className={`flex items-center px-4 py-2 rounded-lg border cursor-pointer shadow-sm ${
                formState.gender === g
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
    </div>
  );
};

export default StepBasicInfo;
