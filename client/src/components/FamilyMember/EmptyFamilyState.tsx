import React from 'react';
import { Users } from 'lucide-react';

interface EmptyFamilyStateProps {
  onAddMember: () => void;
}

export const EmptyFamilyState: React.FC<EmptyFamilyStateProps> = ({ onAddMember }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full p-8 mb-6">
        <Users className="w-16 h-16 text-emerald-600" />
      </div>
      
      <h3 className="text-2xl font-semibold text-gray-800 mb-2">
        No Family Members Yet
      </h3>
      
      <p className="text-gray-600 text-center mb-8 max-w-md">
        Start building your family's wellness profile by adding your first member
      </p>
      
      <button
        onClick={onAddMember}
        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg"
      >
        Add First Member
      </button>
    </div>
  );
};
