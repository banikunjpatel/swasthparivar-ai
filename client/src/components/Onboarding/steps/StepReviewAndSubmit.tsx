import React from 'react';
import { MemberFormState } from '../AddFamilyMemberModal';

interface StepReviewProps {
  formState: MemberFormState;
  handleBack: () => void;
  handleSubmit: () => void;
}

const StepReviewAndSubmit: React.FC<StepReviewProps> = ({ formState, handleBack, handleSubmit }) => {
  return (
    <div className="p-4 sm:p-6 rounded-lg bg-gradient-to-br from-green-50 to-white shadow-md text-gray-800 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-center text-green-800">🌿 Review Information</h2>

      <div className="grid sm:grid-cols-2 gap-6 bg-white rounded-xl shadow-inner p-6 border border-green-200">
        <div>
          <p className="text-sm font-medium text-gray-600">Full Name:</p>
          <p className="text-lg font-semibold text-gray-900">{formState.fullName}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-600">Age:</p>
          <p className="text-lg font-semibold text-gray-900">{formState.age}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-600">Gender:</p>
          <p className="text-lg font-semibold text-gray-900 capitalize">{formState.gender}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-600">Medical Conditions:</p>
          <p className="text-lg font-semibold text-gray-900">
            {formState.medicalConditions?.join(', ') || 'None'}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-600">Dietary Preferences:</p>
          <p className="text-lg font-semibold text-gray-900">{formState.dietaryPreference || 'None'}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-600">Prakriti (Dosha):</p>
          <p className="text-lg font-semibold text-green-700 capitalize">
            {formState.prakriti || 'Unknown'}
          </p>
        </div>
      </div>

      {/* <div className="flex justify-between items-center pt-4">
        <button
          onClick={handleBack}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
        >
          ← Back
        </button>

        <button
          onClick={handleSubmit}
          className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition"
        >
          ✅ Complete & Save
        </button>
      </div> */}
    </div>
  );
};

export default StepReviewAndSubmit;
