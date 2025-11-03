import React from 'react';
import { MemberFormState } from '../AddFamilyMemberModal';

interface FormState {
  dietaryPreferences: string;
  [key: string]: any;
}
interface StepDietaryPreferenceProps {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<MemberFormState>>;
}


const OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Non-Vegetarian',
  'Pescatarian',
  'Keto',
  'Other',
];

const StepDietaryPreference: React.FC<StepDietaryPreferenceProps> = ({
  formState,
  setFormState,
}) => {
  const handleChange = (preference: string) => {
    setFormState({
      ...formState,
      dietaryPreferences: preference,
      fullName: formState.fullName || '',
      age: formState.age || 1,
      gender: formState.gender || '',
      medicalConditions: formState.medicalConditions || [],
      prakriti: formState.prakriti || '',
      allergies: formState.allergies || [],
      userId: formState.userId || '',
      doshaStats: formState.doshaStats || { vata: 0, pitta: 0, kapha: 0 } // Default value for doshaStats
    });
  };
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Dietary Preference</h2>
      <p className="text-gray-600 mb-4">Select your dietary preference.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {OPTIONS.map(option => (
          <label
            key={option}
            className={`flex items-center space-x-3 p-4 border rounded-lg shadow-md cursor-pointer transition ${formState.dietaryPreferences === option
                ? 'bg-green-50 border-green-600'
                : 'bg-white hover:bg-green-50'
              }`}
          >
            <input
              type="radio"
              name="dietaryPreferences"
              value={option}
              checked={formState.dietaryPreferences === option}
              onChange={() => handleChange(option)}
              className="h-5 w-5 text-green-600 border-gray-300 focus:ring-green-500"
            />
            <span className="text-gray-800">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default StepDietaryPreference;
