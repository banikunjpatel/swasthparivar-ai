import React, { useState } from 'react';
import AddFamilyMemberModal from '../Onboarding/AddFamilyMemberModal';
import apiClient from '../../apiCall/api';
import { PrakritiQuiz } from '../Assessment/PrakritiAssessment';
import { EmptyFamilyState } from './EmptyFamilyState';
import { FamilyNatureMap } from './FamilyNatureMap';

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface FamilyMembersProps {
  members: FamilyMember[];
  onRefresh: () => void;
}

interface DoshaDistribution { vata: number; pitta: number; kapha: number; }
interface PrakritiGuidance {
  foods_to_favor: string[];
  foods_to_avoid: string[];
  lifestyle_tips: string[];
}
interface PrakritiAssessment {
  primaryDosha: 'vata' | 'pitta' | 'kapha' | 'tridoshic';
  secondaryDosha?: 'vata' | 'pitta' | 'kapha';
  distribution: DoshaDistribution;
  guidance: PrakritiGuidance;
  notes?: string;
  assessedAt?: string;
  version?: string;
}
interface FamilyMember {
  _id: string;
  fullName: string;
  age: number;
  birthdate?: string;
  gender: 'male' | 'female' | 'other';
  dietaryPreferences: string;
  state?: string;
  prakriti?: PrakritiAssessment;
}

/* ─── Prakriti Assessment Dialog ────────────────────────────────────────── */

const PrakritiAssessmentDialog = ({
  open, member, onClose,
}: {
  open: boolean;
  member: FamilyMember | null;
  onClose: () => void;
}) => {
  if (!open || !member) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center px-4 pb-4 pt-14 sm:pt-16">
      <div className="bg-white w-full max-w-3xl max-h-[calc(100dvh-3.5rem)] sm:max-h-[calc(100dvh-4rem)] rounded-2xl shadow-xl flex flex-col">
        <div className="px-6 py-3 border-b flex items-center justify-between shrink-0">
          <h2 className="text-base font-semibold text-gray-800">Body Type Assessment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none" aria-label="Close">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4 overscroll-contain">
          <PrakritiQuiz member={member} onComplete={onClose} />
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────────────── */

const FamilyMembers: React.FC<FamilyMembersProps> = ({ members, onRefresh }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [prakritiModalOpen, setPrakritiModalOpen] = useState(false);
  const [activeMember, setActiveMember] = useState<FamilyMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FamilyMember | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleEditMember = (memberId: string) => {
    setSelectedMember(members.find(m => m._id === memberId) ?? null);
    setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiClient.deleteFamilyMember(deleteTarget._id);
      onRefresh();
    } catch (err) {
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Listen for prakriti assessment events dispatched from FamilyNatureMap
  React.useEffect(() => {
    const handler = (event: any) => {
      const member = event.detail?.member;
      if (member) { setActiveMember(member); setPrakritiModalOpen(true); }
    };
    window.addEventListener('startPrakritiAssessment', handler);
    return () => window.removeEventListener('startPrakritiAssessment', handler);
  }, []);

  return (
    <div className="w-full space-y-6">
      {members.length === 0 ? (
        <EmptyFamilyState onAddMember={() => setModalOpen(true)} />
      ) : (
        <FamilyNatureMap
          members={members}
          onAddMember={() => setModalOpen(true)}
          onRefresh={onRefresh}
          onEditMember={handleEditMember}
          onDeleteMember={(id) => setDeleteTarget(members.find(m => m._id === id) ?? null)}
        />
      )}

      {/* Add / Edit modal */}
      <AddFamilyMemberModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedMember(null); onRefresh(); }}
        initialData={
          selectedMember
            ? {
              _id: selectedMember._id,
              fullName: selectedMember.fullName,
              age: selectedMember.age,
              birthdate: selectedMember.birthdate ?? '',
              gender: selectedMember.gender,
              dietaryPreferences: selectedMember.dietaryPreferences,
              state: selectedMember.state,
              userId: JSON.parse(localStorage.getItem('user') || '{}')?.userId ?? '',
            }
            : null
        }
        membersData={members.map(m => ({ ...m, userId: m._id }))}
      />

      {/* Prakriti quiz dialog */}
      <PrakritiAssessmentDialog
        open={prakritiModalOpen}
        member={activeMember}
        onClose={() => { setPrakritiModalOpen(false); setActiveMember(null); onRefresh(); }}
      />

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-red-600 text-lg">🗑️</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Remove Member</h3>
                <p className="text-sm text-gray-500">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to remove{' '}
              <span className="font-semibold text-gray-800">{deleteTarget.fullName}</span> from your family?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 active:scale-95 transition-all disabled:opacity-60"
              >
                {deleting ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyMembers;
