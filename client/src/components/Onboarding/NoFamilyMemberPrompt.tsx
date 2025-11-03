// src/components/Onboarding/NoFamilyMemberPrompt.tsx

import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import AddFamilyMemberModal from './AddFamilyMemberModal';
import { getUserId } from '../../hooks/useAuth';
import LoginPromptDialog from '../../utils/LoginPromptDialog';

interface Props {
  onAddFamily: () => void;
  onRefresh: () => void;
}

const NoFamilyMemberPrompt: React.FC<Props> = ({ onAddFamily, onRefresh }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const userId = getUserId();
  const handleAddFamilyClick = () => {
    if (!userId) {
      setShowLoginPrompt(true);
    } else {
      setModalOpen(true);
    }
  };
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
        onClick={handleAddFamilyClick}
        className="bg-green-600 from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition-all duration-200"
      >
        + Add First Member
      </button>
      <AddFamilyMemberModal open={modalOpen} onClose={() => { setModalOpen(false); onRefresh(); }} membersCount={0} />
      <div>
        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <LoginPromptDialog
              open={showLoginPrompt}
              title="Please sign in First"
              description="You need to be signed in to add family members."
              onClose={() => setShowLoginPrompt(false)}
            />
            {/* <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm text-center">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Please sign in First</h2>
              <p className="text-sm text-gray-600 mb-4">You need to be signed in to add family members.</p>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-2"
                onClick={() => {
                  setShowLoginPrompt(false);
                  window.location.href = '/login'; // or use navigate('/login') if using react-router
                }}
              >
                Login
              </button>
              <button
                className="text-gray-500 text-sm underline"
                onClick={() => setShowLoginPrompt(false)}
              >
                Cancel
              </button>
            </div> */}
          </div>
        )}
      </div>
    </div>




    // className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-all"
  );
};

export default NoFamilyMemberPrompt;
