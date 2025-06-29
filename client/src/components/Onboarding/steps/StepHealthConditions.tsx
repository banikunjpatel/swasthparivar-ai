import React from 'react';
import { MemberFormState } from '../AddFamilyMemberModal';

interface FormState {
  medicalConditions: string[];
  allergies: string[];
  [key: string]: any;
}

interface StepHealthConditionsProps {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<MemberFormState>>;
}

const ALL_CONDITIONS = [
  'Diabetes',
  'Hypertension',
  'Asthma',
  'Thyroid Issues',
  'Heart Disease',
  'Arthritis',
  'Digestive Issues',
  'Skin Problems',
];

const ALL_ALLERGIES = [
  'Nuts',
  'Dairy',
  'Gluten',
  'Eggs',
  'Fish',
  'Soy',
  'Sesame',
  'Shellfish',
];

const StepHealthConditions: React.FC<StepHealthConditionsProps> = ({
  formState,
  setFormState,
}) => {
  const handleToggle = (field: 'medicalConditions' | 'allergies', item: string) => {
    const current = formState[field] || [];
    const updated = current.includes(item)
      ? current.filter(c => c !== item)
      : [...current, item];
      const updatedMedicalConditions = field === 'medicalConditions' ? updated : formState.medicalConditions;
      const updatedAllergies = field === 'allergies' ? updated : formState.allergies;
    setFormState({
      ...formState,
      medicalConditions: updatedMedicalConditions,
      allergies: updatedAllergies,
      fullName: formState.fullName,
      age: formState.age,
      gender: formState.gender,
      dietaryPreference: formState.dietaryPreference,
      prakriti: formState.prakriti,
    });
  };

  return (
    <div className="space-y-8">
      {/* Medical Conditions Section */}
      <div>
        <h2 className="text-2xl font-semibold text-green-800">Health Conditions</h2>
        <p className="text-gray-600 mb-4">
          Select all health conditions that apply to this family member.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ALL_CONDITIONS.map(condition => (
            <label
              key={condition}
              className="flex items-center space-x-3 bg-white border rounded-lg px-4 py-3 shadow hover:shadow-md transition cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formState.medicalConditions.includes(condition)}
                onChange={() => handleToggle('medicalConditions', condition)}
                className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-gray-800">{condition}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Allergies Section */}
      <div>
        <h2 className="text-2xl font-semibold text-green-800">Allergies</h2>
        <p className="text-gray-600 mb-4">
          Select any allergies this family member has.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ALL_ALLERGIES.map(allergy => (
            <label
              key={allergy}
              className="flex items-center space-x-3 bg-white border rounded-lg px-4 py-3 shadow hover:shadow-md transition cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formState.allergies?.includes(allergy)}
                onChange={() => handleToggle('allergies', allergy)}
                className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-gray-800">{allergy}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepHealthConditions;
