import React, { useState } from 'react';
import { Pencil, Trash } from 'lucide-react';
import NoFamilyMemberPrompt from '../Onboarding/NoFamilyMemberPrompt';
import AddFamilyMemberModal from '../Onboarding/AddFamilyMemberModal';
import apiClient from '../../apiCall/api';

interface FamilyMembersProps {
  members: FamilyMember[];
  onRefresh: () => void;
}

interface DoshaStats {
  vata: number;
  pitta: number;
  kapha: number;
}

interface FamilyMember {
  _id: string
  fullName: string;
  age: number;
  prakriti: 'VATA' | 'PITTA' | 'KAPHA';
  gender: 'male' | 'female' | 'other';
  doshaStats: DoshaStats;
  dietaryPreferences: string;
  medicalConditions?: string[];
  allergies?: string[];
}

const DoshaBar = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="text-sm text-gray-600 mb-1">{label}</div>
    <div className="w-full h-2 bg-green-100 rounded">
      <div
        className="h-2 bg-green-600 rounded"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  </div>
);

const FamilyMembers: React.FC<FamilyMembersProps> = ({ members, onRefresh }) => {
  const total = members.length;
  const vegetarians = members.filter((m) => m.dietaryPreferences === 'Vegetarian').length;
  const withConditions = members.filter((m) => m.medicalConditions?.length).length;
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const handleEditMember = (member: FamilyMember) => {
    setSelectedMember(member); // Set selected member first
    setModalOpen(true);        // Then open modal
  };

  return (
    <div className="p-6 bg-green-50 min-h-screen">

      {members.length > 0 ?
        (<>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Family Profile</h2>
              <p className="text-gray-600 text-sm">Manage your family members and their profiles</p>
            </div>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold shadow"
              onClick={() => {
                if (members.length >= 5) {
                  alert("You can only add up to 5 family members.");
                  return;
                }
                setModalOpen(true);
              }}
            >
              + Add Family Member
            </button>
            <AddFamilyMemberModal open={modalOpen} onClose={() => {
              setModalOpen(false);
              setSelectedMember(null);
              onRefresh();

            }} initialData={selectedMember} membersCount={members.length} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow text-center">
              <div className="text-2xl font-semibold text-green-600">{total}</div>
              <div className="text-sm text-gray-600">Family Members</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow text-center">
              <div className="text-2xl font-semibold text-green-600">{vegetarians}</div>
              <div className="text-sm text-gray-600">Vegetarians</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow text-center">
              <div className="text-2xl font-semibold text-green-600">{withConditions}</div>
              <div className="text-sm text-gray-600">With Health Conditions</div>
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {members.map((member, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow relative">
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Pencil className="w-4 h-4 text-gray-500 cursor-pointer hover:text-green-600"
                    onClick={() => {
                      handleEditMember(member); // Open modal with selected member data
                    }} />
                  <Trash
                    className="w-4 h-4 text-gray-500 cursor-pointer hover:text-red-500"
                    onClick={async () => {
                      if (window.confirm(`Are you sure you want to delete ${member.fullName}?`)) {
                        try {
                          await apiClient.deleteFamilyMember(member._id); // ensure `userId` exists
                          onRefresh();
                        } catch (error) {
                          console.error("Failed to delete family member", error);
                          alert("Failed to delete family member.");
                        }
                      }
                    }}
                  />
                </div>

                <div className="text-lg font-semibold text-gray-800 mb-1">
                  {member.fullName}
                </div>
                <div className="text-sm text-gray-600 mb-2">{member.age} years old</div>

                <div className="mb-2">
                  <span
                    className={`text-xs font-bold uppercase mr-2 ${member.prakriti === 'VATA'
                      ? 'text-blue-600'
                      : member.prakriti === 'PITTA'
                        ? 'text-red-600'
                        : 'text-green-600'
                      }`}
                  >
                    {member.prakriti} Primary
                  </span>
                  <span className="text-xs text-green-600 font-semibold">
                    {member.dietaryPreferences}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <DoshaBar label="Vata" value={member?.doshaStats?.vata ? member?.doshaStats?.vata : 0} />
                  <DoshaBar label="Pitta" value={member?.doshaStats?.pitta ? member?.doshaStats?.pitta : 0} />
                  <DoshaBar label="Kapha" value={member?.doshaStats?.kapha ? member?.doshaStats?.kapha : 0} />
                </div>

                {member.medicalConditions && member.medicalConditions.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">Health Conditions</div>
                    <div className="flex flex-wrap gap-2">
                      {member.medicalConditions.map((cond, idx) => (
                        <span
                          key={idx}
                          className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                        >
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* {member.foodPreferences && member.foodPreferences.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-medium text-gray-700 mb-1">Food Preferences</div>
                <div className="flex flex-wrap gap-2">
                  {member.foodPreferences.map((food, idx) => (
                    <span
                      key={idx}
                      className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                    >
                      {food}
                    </span>
                  ))}
                </div>
              </div>
            )} */}

                {member.allergies && member.allergies.length > 0 && (
                  <div className="mb-1">
                    <div className="text-sm font-medium text-gray-700 mb-1">Allergies</div>
                    <div className="flex flex-wrap gap-2">
                      {member.allergies.map((a, idx) => (
                        <span
                          key={idx}
                          className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div></>) :
        <NoFamilyMemberPrompt
          onAddFamily={function (): void {
            throw new Error('Function not implemented.');
          }}
          onRefresh={onRefresh}
        />
      }



    </div>
  );
};

export default FamilyMembers;

