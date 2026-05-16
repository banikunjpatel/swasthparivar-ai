import React, { useEffect, useState } from 'react';

import apiClient from '../../apiCall/api';
import StepBasicInfo from './steps/StepBasicInfo';
import Modal from '../../shared/Modal';

interface AddFamilyMemberModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: MemberFormState | null;
  membersData: MemberFormState[];
}

const storedUser = localStorage.getItem('user');
const userId = storedUser ? JSON.parse(storedUser)?.userId : '';

export interface MemberFormState {
  _id?: string;
  fullName: string;
  birthdate?: string;
  age: number | '';
  gender: 'male' | 'female' | 'other';
  dietaryPreferences?: string;
  userId: string;
  state?: string;
}

const defaultFormState: MemberFormState = {
  _id: undefined,
  fullName: '',
  birthdate: '',
  age: '',
  gender: 'male',
  dietaryPreferences: '',
  userId: userId,
  state: ''
};

/**
 * Calculate age from birthdate
 */
const calculateAge = (birthdate: string): number => {
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

const AddFamilyMemberModal: React.FC<AddFamilyMemberModalProps> = ({ open, onClose, initialData, membersData }) => {
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState<MemberFormState>(defaultFormState);
  const [errors, setErrors] = useState<{ fullName?: boolean; birthdate?: boolean }>({});

  useEffect(() => {
    if (open) {
      setErrors({});
      if (initialData) {
        setFormState({ ...initialData, birthdate: initialData.birthdate || '' });
      } else {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            const defaultState = membersData?.length > 0 ? membersData[0].state : (user.region || 'Karnataka');
            setFormState(prev => ({ 
              ...defaultFormState, 
              fullName: (user?.name && membersData?.length === 0) ? user.name : '', 
              userId: user.userId || '',
              state: defaultState
            }));
          } catch {
            setFormState(defaultFormState);
          }
        } else {
          setFormState(defaultFormState);
        }
      }
    }
  }, [open, initialData, membersData]);

  const isEditMode = !!(initialData?._id);

  const validate = () => {
    const newErrors: { fullName?: boolean; birthdate?: boolean } = {};
    if (!formState.fullName || formState.fullName.trim() === '') newErrors.fullName = true;
    // Birthdate not required when editing (only age is stored)
    if (!isEditMode && (!formState.birthdate || formState.birthdate.trim() === '')) newErrors.birthdate = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: any) => {
    setFormState(prev => ({ ...prev, [field as keyof MemberFormState]: value }));
    setErrors(prev => ({ ...prev, [field as keyof typeof prev]: false } as any));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // Calculate age from birthdate; fall back to stored age when editing without a date
      const age = formState.birthdate
        ? calculateAge(formState.birthdate)
        : (isEditMode && formState.age ? Number(formState.age) : 0);
      
      // Auto-set state from first member or user if not set
      let state = formState.state;
      if (!state) {
        if (membersData?.length > 0) {
          state = membersData[0].state;
        } else {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const user = JSON.parse(storedUser);
              state = user.region || 'Karnataka';
            } catch {
              state = 'Karnataka';
            }
          } else {
            state = 'Karnataka';
          }
        }
      }
      
      const memberData = {
        ...formState,
        age: age,
        state: state,
        dietaryPreferences: formState.dietaryPreferences || 'vegetarian' // Default to vegetarian if not provided
      };
      
      if (initialData && initialData._id) {
        await apiClient.updateFamilyMember(initialData._id, memberData);
      } else {
        await apiClient.addFamilyMember(memberData);
      }
      onClose();
      setFormState(defaultFormState);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Family Member">
      <div className="px-0 py-2 sm:py-4">
        <StepBasicInfo formState={formState} setFormState={handleChange} membersData={membersData} errors={errors} />

        <div className="flex flex-col-reverse xs:flex-row justify-between gap-3 mt-6 sm:mt-8">
          <button
            onClick={onClose}
            className="w-full xs:w-auto px-4 sm:px-6 py-2.5 sm:py-2 border rounded-lg text-sm sm:text-base text-gray-600 hover:bg-gray-100 transition-colors font-medium"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="w-full xs:w-auto px-6 sm:px-8 py-2.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddFamilyMemberModal;
