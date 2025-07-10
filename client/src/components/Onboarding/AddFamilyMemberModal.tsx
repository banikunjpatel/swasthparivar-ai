// src/components/FamilyMemberForm/AddFamilyMemberModal.tsx

import React, { useEffect, useState } from 'react';

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
  initialData?: any | null;
}
const storedUser = localStorage.getItem('user');
const userId = storedUser ? JSON.parse(storedUser)?.userId : '';
export interface DoshaStats {
  vata: number;
  pitta: number;
  kapha: number;
}
export interface MemberFormState {
  _id?: string;
  fullName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  dietaryPreferences: string; // Added property to match FormState
  medicalConditions: string[];
  allergies: string[],
  prakriti: string;
  userId: string;
  doshaStats: DoshaStats;
  state?: string;
}
const defaultFormState: MemberFormState = {
  _id: undefined,
  fullName: '',
  age: 1,
  gender: 'male',
  dietaryPreferences: '', // Added default value for the new property
  medicalConditions: [],
  prakriti: 'unknown',
  allergies: [],
  userId: userId,
  doshaStats: {
    vata: 0,
    pitta: 0,
    kapha: 0
  },
  state: ''
};

const AddFamilyMemberModal: React.FC<AddFamilyMemberModalProps> = ({ open, onClose, initialData }) => {
  const [step, setStep] = useState(0);
  const [formState, setFormState] = useState<MemberFormState>(defaultFormState);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(Array(9).fill(''));

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormState(initialData);
      } else {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            if (user?.name) {
              setFormState(prev => ({ ...prev, fullName: user.name, userId: user.userId || '', }));
            }
          } catch {
            console.warn('Invalid user data in localStorage');
          }
        }
      }

    }
  }, [open, initialData]);

  const handleNext = async () => {
    if (step === 3) {
      try {
        const isComplete = selectedAnswers.every((answer) => answer && answer.trim() !== "");

        if (!isComplete) {
          alert("Please answer all Prakriti assessment questions.");
          return;
        }
        const res = await apiClient.calculatePrakriti(selectedAnswers);
        const { prakriti, doshaStats } = res.data;
        setFormState(prev => ({ ...prev, prakriti, doshaStats }));
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
      if (initialData) {
        if (initialData?._id) {
          await apiClient.updateFamilyMember(initialData._id, formState);
        } else {
          console.error('Error: Family member ID is undefined.')
          return;
        }
      } else {
        await apiClient.addFamilyMember(formState);
      }
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