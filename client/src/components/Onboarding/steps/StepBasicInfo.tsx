// src/components/Onboarding/steps/StepBasicInfo.tsx

import React, { useEffect } from 'react';

interface Props {
  formState: {
    fullName: string;
    birthdate?: string;
    age: number | '';
    gender: 'male' | 'female' | 'other';
    state?: string;
    dietaryPreferences?: string;
  };
  membersData: any;
  setFormState: (field: string, value: any) => void;
  errors?: { fullName?: boolean; birthdate?: boolean };
}

const StepBasicInfo: React.FC<Props> = ({ formState, membersData, setFormState, errors = {} }) => {
  useEffect(() => {
    // Auto-set state from first member or user
    if (membersData?.length > 0 && !formState.state) {
      setFormState("state", membersData[0].state);
    } else if (!formState.state) {
      // Try to get from localStorage user
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.region) {
            setFormState("state", user.region);
          }
        } catch {
          console.warn('Invalid user data in localStorage');
        }
      }
    }
  }, [membersData, formState.state, setFormState]);

  return (
    <div className="space-y-6 sm:space-y-8">
       {/* Name & Birthdate Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 text-left">Name</label>
          <input
            type="text"
            value={formState.fullName}
            onChange={(e) => setFormState('fullName', e.target.value)}
            placeholder="Enter name"
            required
            className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 
              ${errors.fullName ? 'border-red-500 ring-red-400' : 'border-gray-300'
            }`}
          />
          {errors.fullName && (
            <span className="text-red-500 text-xs mt-1 block">Name is required</span>
          )}
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 text-left">Date of Birth</label>
          <input
            type="date"
            required
            value={formState.birthdate || ''}
            onChange={(e) => setFormState('birthdate', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
              errors.birthdate ? 'border-red-500 ring-red-400' : 'border-gray-300'
            }`}
          />
          {errors.birthdate && (
            <span className="text-red-500 text-xs mt-1 block">Birthdate is required</span>
          )}
        </div>
      </div>

      {/* Gender */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 text-left">Gender</label>
        <div className="flex flex-row gap-2">
          {['male', 'female', 'other'].map((g) => (
            <label
              key={g}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer shadow-sm transition-colors text-sm font-medium select-none ${
                formState.gender === g
                  ? 'bg-yellow-100 border-yellow-500 text-yellow-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="gender"
                value={g}
                required
                checked={formState.gender === g}
                onChange={() => setFormState('gender', g)}
                className="form-radio text-yellow-500 focus:ring-yellow-500 shrink-0"
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