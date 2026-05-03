// ...existing code...
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
export interface DoshaStats {
  vata: number;
  pitta: number;
  kapha: number;
}
export interface MemberFormState {
  _id?: string;
  fullName: string;
  age: number | '';
  gender: 'male' | 'female' | 'other';
  dietaryPreferences: string;
  userId: string;
  state?: string;
}
const defaultFormState: MemberFormState = {
  _id: undefined,
  fullName: '',
  age: '',
  gender: 'male',
  dietaryPreferences: '',
  userId: userId,
  state: ''
};

const AddFamilyMemberModal: React.FC<AddFamilyMemberModalProps> = ({ open, onClose, initialData, membersData }) => {
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState<MemberFormState>(defaultFormState);
  const [errors, setErrors] = useState<{ fullName?: boolean; age?: boolean; state?: boolean }>({});

  useEffect(() => {
    if (open) {
      setErrors({});
      if (initialData) {
        setFormState(initialData);
      } else {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            setFormState(prev => ({ ...defaultFormState, fullName: (user?.name && membersData?.length === 0) ? user.name : '', userId: user.userId || '' }));
          } catch {
            console.warn('Invalid user data in localStorage');
            setFormState(defaultFormState);
          }
        } else {
          setFormState(defaultFormState);
        }
      }
    }
  }, [open, initialData, membersData]);

  const validate = () => {
    const newErrors: { fullName?: boolean; age?: boolean; state?: boolean } = {};
    if (!formState.fullName || formState.fullName.trim() === '') newErrors.fullName = true;
    if (formState.age === '' || formState.age < 1 || formState.age > 99) newErrors.age = true;
    if (!formState.state || formState.state.trim() === '') newErrors.state = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: any) => {
    // cast field to keyof MemberFormState when updating the strongly-typed form state
    setFormState(prev => ({ ...prev, [field as keyof MemberFormState]: value }));
    // update errors safely (cast to any to allow dynamic key)
    setErrors(prev => ({ ...prev, [field as keyof typeof prev]: false } as any));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (initialData && initialData._id) {
        await apiClient.updateFamilyMember(initialData._id, formState);
      } else {
        await apiClient.addFamilyMember(formState);
      }
      onClose();
      setFormState(defaultFormState);
    } catch (err) {
      console.error('Error submitting form', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Family Member">
      <div className="px-4 py-6">
        <StepBasicInfo formState={formState} setFormState={handleChange} membersData={membersData} errors={errors} />

        <div className="flex justify-between mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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
// ...existing code...
/** // filepath: d:\swasth\new\swasthparivar-ai\client\src\components\Onboarding\AddFamilyMemberModal.tsx
// ...existing code...
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
export interface DoshaStats {
  vata: number;
  pitta: number;
  kapha: number;
}
export interface MemberFormState {
  _id?: string;
  fullName: string;
  age: number | '';
  gender: 'male' | 'female' | 'other';
  dietaryPreferences: string;
  medicalConditions: string[];
  allergies: string[];
  prakriti: string;
  userId: string;
  doshaStats: DoshaStats;
  state?: string;
}
const defaultFormState: MemberFormState = {
  _id: undefined,
  fullName: '',
  age: '',
  gender: 'male',
  dietaryPreferences: '',
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

const AddFamilyMemberModal: React.FC<AddFamilyMemberModalProps> = ({ open, onClose, initialData, membersData }) => {
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState<MemberFormState>(defaultFormState);
  const [errors, setErrors] = useState<{ fullName?: boolean; age?: boolean; state?: boolean }>({});

  useEffect(() => {
    if (open) {
      setErrors({});
      if (initialData) {
        setFormState(initialData);
      } else {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            setFormState(prev => ({ ...defaultFormState, fullName: (user?.name && membersData?.length === 0) ? user.name : '', userId: user.userId || '' }));
          } catch {
            console.warn('Invalid user data in localStorage');
            setFormState(defaultFormState);
          }
        } else {
          setFormState(defaultFormState);
        }
      }
    }
  }, [open, initialData, membersData]);

  const validate = () => {
    const newErrors: { fullName?: boolean; age?: boolean; state?: boolean } = {};
    if (!formState.fullName || formState.fullName.trim() === '') newErrors.fullName = true;
    if (formState.age === '' || formState.age < 1 || formState.age > 99) newErrors.age = true;
    if (!formState.state || formState.state.trim() === '') newErrors.state = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof MemberFormState, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: false }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (initialData && initialData._id) {
        await apiClient.updateFamilyMember(initialData._id, formState);
      } else {
        await apiClient.addFamilyMember(formState);
      }
      onClose();
      setFormState(defaultFormState);
    } catch (err) {
      console.error('Error submitting form', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Family Member">
      <div className="px-4 py-6">
        <StepBasicInfo formState={formState} setFormState={handleChange} membersData={membersData} errors={errors} />

        <div className="flex justify-between mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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
// **/  