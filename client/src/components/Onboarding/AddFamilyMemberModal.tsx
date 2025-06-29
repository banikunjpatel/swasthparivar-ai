// src/components/FamilyMemberForm/AddFamilyMemberModal.tsx

import React, { useState } from 'react';

import apiClient from '../../lib/api';
import StepBasicInfo from './steps/StepBasicInfo';
import StepHealthConditions from './steps/StepHealthConditions';
import StepPrakritiAssessment from './steps/StepPrakritiAssessment';
import StepReviewAndSubmit from './steps/StepReviewAndSubmit';
import StepDietaryPreference from './steps/StepDietaryPreference';
import Modal from '../../shared/Modal';

interface AddFamilyMemberModalProps {
  open: boolean;
  onClose: () => void;
}

export interface MemberFormState {
  fullName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  dietaryPreference: string; // Added property to match FormState
  medicalConditions: string[];
  allergies: string[],
  prakriti: string;
}
const defaultFormState: MemberFormState = {
  fullName: '',
  age: 0,
  gender: 'male',
  dietaryPreference: '', // Added default value for the new property
  medicalConditions: [],
  prakriti: 'unknown',
  allergies: [],
};

const calculatePrakriti = (answers: number[]) => {
  const doshaCount = {
    vata: 0,
    pitta: 0,
    kapha: 0
  };

  answers.forEach(answer => {
    if (answer === 0) doshaCount.vata += 1;
    else if (answer === 1) doshaCount.pitta += 1;
    else if (answer === 2) doshaCount.kapha += 1;
  });

  // Find the dominant dosha
  const dominant = Object.entries(doshaCount).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  return dominant;
};

const AddFamilyMemberModal: React.FC<AddFamilyMemberModalProps> = ({ open, onClose }) => {
  const [step, setStep] = useState(0);
  const [formState, setFormState] = useState<MemberFormState>(defaultFormState);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(Array(8).fill(-1));

  const handleNext = async () => {
    if (step === 3) {
      try {
        // const res = await apiClient.calculatePrakriti(selectedAnswers);
        // setFormState(prev => ({ ...prev, prakriti: res.data.prakriti }));
        const prakriti = calculatePrakriti(selectedAnswers);
        console.log('Calculated Prakriti:', prakriti);
        setFormState(prev => ({ ...prev, prakriti }));
        setStep(step + 1);
      } catch (err) {
        console.error('Failed to calculate prakriti', err);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      await apiClient.addFamilyMember(formState);
      onClose();
    } catch (error) {
      console.error('Error submitting form', error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        const handleFormStateChange = (field: string, value: any) => {
          setFormState(prev => ({ ...prev, [field]: value }));
        };
        return <StepBasicInfo formState={formState} setFormState={handleFormStateChange} />;
      case 1:
        return <StepHealthConditions formState={formState} setFormState={setFormState} />;
      case 2:
        return <StepDietaryPreference formState={formState} setFormState={setFormState} />;
      case 3:
        return <StepPrakritiAssessment selectedAnswers={selectedAnswers} setSelectedAnswers={setSelectedAnswers} />;
      case 4:
        return <StepReviewAndSubmit formState={formState} handleBack={handleBack} handleSubmit={handleSubmit} />;
      default:
        return null;
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Family Member">
      <div className="px-4 py-6">
        {renderStep()}

        <div className="flex justify-between mt-6">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
          >
            Back
          </button>
          {step < 4 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AddFamilyMemberModal;