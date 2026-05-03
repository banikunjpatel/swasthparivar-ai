import React, { useState } from 'react';
import { Pencil, Trash } from 'lucide-react';
import NoFamilyMemberPrompt from '../Onboarding/NoFamilyMemberPrompt';
import AddFamilyMemberModal from '../Onboarding/AddFamilyMemberModal';
import apiClient from '../../apiCall/api';
import { PrakritiQuiz } from '../Assessment/PrakritiAssessment';
import PrakritiDetailsCard from '../Assessment/PrakritiDetailsCard';

interface FamilyMembersProps {
  members: FamilyMember[];
  onRefresh: () => void;
}

/* ---------------- Dosha Distribution ---------------- */

interface DoshaDistribution {
  vata: number;
  pitta: number;
  kapha: number;
}

/* ---------------- Guidance ---------------- */

interface PrakritiGuidance {
  foods_to_favor: string[];
  foods_to_avoid: string[];
  lifestyle_tips: string[];
}

/* ---------------- Assessment ---------------- */

interface PrakritiAssessment {
  /** Primary dosha: vata | pitta | kapha | tridoshic */
  primaryDosha: 'vata' | 'pitta' | 'kapha' | 'tridoshic';

  /** Secondary dosha if applicable */
  secondaryDosha?: 'vata' | 'pitta' | 'kapha';

  distribution: DoshaDistribution;
  guidance: PrakritiGuidance;

  /** Optional clinician / system notes */
  notes?: string;

  /** ISO string from backend */
  assessedAt?: string;

  /** Assessment version / algorithm */
  version?: string;
}


interface FamilyMember {
  _id: string;
  fullName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  dietaryPreferences: string;
  state?: string;
  prakriti?: PrakritiAssessment;
}

/* ------------------ Small Reusable UI ------------------ */

// const DoshaBar = ({ label, value }: { label: string; value: number }) => (
//   <div>
//     <div className="text-sm text-gray-600 mb-1">{label}</div>
//     <div className="w-full h-2 bg-green-100 rounded">
//       <div
//         className="h-2 bg-green-600 rounded"
//         style={{ width: `${value}%` }}
//       />
//     </div>
//   </div>
// );

const PrakritiBadge = ({ assessed }: { assessed: boolean }) => (
  <span
    className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${assessed
      ? 'bg-green-100 text-green-700'
      : 'bg-yellow-100 text-yellow-700'
      }`}
  >
    {assessed ? 'Assessed ✔' : 'Not Assessed'}
  </span>
);

const PrakritiCTA = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="w-full mt-4 py-2 rounded-xl border border-green-600
               text-green-700 font-semibold
               hover:bg-green-600 hover:text-white
               transition flex items-center justify-center gap-2"
  >
    🌿 Take Prakriti Assessment
  </button>
);

/* ------------------ Prakriti Dialog ------------------ */

const PrakritiAssessmentDialog = ({
  open,
  member,
  onClose,
}: {
  open: boolean;
  member: FamilyMember | null;
  onClose: () => void;
}) => {
  if (!open || !member) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div
        className="
          bg-white
          w-full max-w-4xl
          h-[95vh]
          rounded-2xl
          shadow-xl
          flex flex-col
          relative
        "
      >
        {/* Header */}
        <div className="px-8 py-4 border-b flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">
            Prakriti Assessment
          </h2>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="
              text-gray-500 hover:text-gray-800
              transition
              text-xl
              leading-none
            "
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 overscroll-contain">
          <PrakritiQuiz member={member} onComplete={onClose} />
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t flex-shrink-0">
          <p className="text-sm text-gray-500">
            Answer honestly for accurate results
          </p>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null;
  return (
    <div className="text-sm text-gray-600">
      <span className="font-medium text-gray-700">{label}:</span> {value}
    </div>
  );
};

/* ------------------ MAIN COMPONENT ------------------ */

const FamilyMembers: React.FC<FamilyMembersProps> = ({
  members,
  onRefresh,
}) => {
  const total = members.length;
  const vegetarians = members.filter(
    (m) => m.dietaryPreferences === 'Vegetarian'
  ).length;

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] =
    useState<FamilyMember | null>(null);

  const [prakritiModalOpen, setPrakritiModalOpen] = useState(false);
  const [activeMember, setActiveMember] =
    useState<FamilyMember | null>(null);

  const isAssessed = (m: FamilyMember) =>
    m?.prakriti?.primaryDosha !== undefined;

  return (
    <div className="p-6 bg-green-50 min-h-screen">
      {members.length > 0 ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Family Profile
              </h2>
              <p className="text-gray-600 text-sm">
                Manage your family members and their profiles
              </p>
            </div>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold shadow"
              onClick={() => setModalOpen(true)}
            >
              + Add Family Member
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow text-center">
              <div className="text-2xl font-semibold text-green-600">
                {total}
              </div>
              <div className="text-sm text-gray-600">
                Family Members
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow text-center">
              <div className="text-2xl font-semibold text-green-600">
                {vegetarians}
              </div>
              <div className="text-sm text-gray-600">
                Vegetarians
              </div>
            </div>

          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {members.map((member) => (
              <div
                key={member._id}
                className="bg-white p-4 rounded-xl shadow relative"
              >
                {/* Edit / Delete */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Pencil
                    className="w-4 h-4 cursor-pointer"
                    onClick={() => {
                      setSelectedMember(member);
                      setModalOpen(true);
                    }}
                  />
                  <Trash
                    className="w-4 h-4 cursor-pointer"
                    onClick={async () => {
                      if (
                        window.confirm(
                          `Delete ${member.fullName}?`
                        )
                      ) {
                        await apiClient.deleteFamilyMember(
                          member._id
                        );
                        onRefresh();
                      }
                    }}
                  />
                </div>

                {/* Name + Badge */}
                <div className="text-lg font-semibold text-gray-800 flex items-center">
                  {member.fullName}
                  <PrakritiBadge assessed={isAssessed(member)} />
                </div>

                <div className="text-sm text-gray-600 mb-2">
                  {member.age} years old, {
                      member.gender.charAt(0).toUpperCase() + member.gender.slice(1)
                    }
                </div>

                {/* Basic Info */}
                {/* <div className="space-y-1 mb-3">
                  <InfoRow
                    label="Gender"
                    value={
                      member.gender.charAt(0).toUpperCase() + member.gender.slice(1)
                    }
                  />
                  <InfoRow label="State" value={member?.state} />
                </div> */}

                {/* Dietary Preference */}
                {/* <div className="mb-3">
                  <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {member.dietaryPreferences}
                  </span>
                </div> */}

                {/* Prakriti Section */}
                {isAssessed(member) ? (
                  <PrakritiDetailsCard
                    primaryDosha={member.prakriti?.primaryDosha || 'unknown'}
                    secondaryDosha={member.prakriti?.secondaryDosha || 'unknown'}
                    distribution={member.prakriti?.distribution || {
                      vata: 0,
                      pitta: 0,
                      kapha: 0,
                    }}
                    guidance={member.prakriti?.guidance || {
                      foods_to_favor: [],
                      foods_to_avoid: [],
                      lifestyle_tips: [],
                    }}
                  />

                ) : (
                  <PrakritiCTA
                    onClick={() => {
                      setActiveMember(member);
                      setPrakritiModalOpen(true);
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <NoFamilyMemberPrompt onAddFamily={() => { }} onRefresh={onRefresh} />
      )}

      {/* Modals */}
      <AddFamilyMemberModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedMember(null);
          onRefresh();
        }}
        initialData={
          selectedMember
            ? {
              _id: selectedMember._id,
              fullName: selectedMember.fullName,
              age: selectedMember.age,
              gender: selectedMember.gender,
              dietaryPreferences: selectedMember.dietaryPreferences,
              userId: selectedMember._id,
            }
            : null
        }
        membersData={members.map((m) => ({ ...m, userId: m._id }))}
      />

      <PrakritiAssessmentDialog
        open={prakritiModalOpen}
        member={activeMember}
        onClose={() => {
          setPrakritiModalOpen(false);
          setActiveMember(null);
          onRefresh(); // Refresh member list after assessment
        }}
      />
    </div>
  );
};

export default FamilyMembers;
