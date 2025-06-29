// src/components/Onboarding/NoFamilyMemberPrompt.tsx

import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import AddFamilyMemberModal from './AddFamilyMemberModal';

interface Props {
  onAddFamily: () => void;
}

const NoFamilyMemberPrompt: React.FC<Props> = ({ onAddFamily }) => {
    const [modalOpen, setModalOpen] = useState(false);
  return (
    <div className="flex flex-col items-center justify-cente rounded-xl px-6 py-12 text-center">
      <div className="text-6xl text-gray-400 mb-4">
        <UserPlus size={56} />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">No family members yet</h2>
      <p className="text-gray-600 mb-6">
        Add your first family member to start creating personalized wellness plans.
      </p>
      <button
        onClick={() => setModalOpen(true)}
        className="bg-green-600 from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition-all duration-200"
       >
        + Add First Member
      </button>
      <AddFamilyMemberModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
    
    // className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-all"
  );
};

export default NoFamilyMemberPrompt;
