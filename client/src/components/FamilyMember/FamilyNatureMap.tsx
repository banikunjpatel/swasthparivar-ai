import React, { useEffect, useState } from 'react';
import { Users, Plus, Sparkles, TrendingUp, TrendingDown, Pencil, Trash2 } from 'lucide-react';
import { ElementProgressBar } from './ElementProgressBar';
import { apiClient } from '../../apiCall/api';

interface Member {
  _id: string;
  fullName: string;
  age?: number;
  prakriti?: {
    primaryDosha: string;
    elements?: {
      fire: number;
      water: number;
      earth: number;
      air: number;
      space: number;
    };
  };
}

interface FamilyMemberSummary {
  name: string;
  age?: number;
  prakriti?: string;
  element?: string;
}

interface CombinedElements {
  fire: number;
  water: number;
  earth: number;
  air: number;
  space: number;
}

interface FamilyNatureData {
  familyName: string;
  memberCount: number;
  createdAt?: string;
  members: FamilyMemberSummary[];
  combinedElements?: CombinedElements;
  strongest?: string;
  weakest?: string;
}

interface FamilyNatureMapProps {
  members: Member[];
  onAddMember: () => void;
  onRefresh: () => void;
  onEditMember?: (memberId: string) => void;
  onDeleteMember?: (memberId: string) => void;
}

const ELEMENT_ICONS: Record<string, string> = {
  fire: '🔥',
  water: '💧',
  earth: '🌱',
  air: '🌬️',
  space: '✨',
};

const ELEMENT_NAMES: Record<string, string> = {
  fire: 'Tejas · Fire',
  water: 'Jala · Water',
  earth: 'Prithvi · Earth',
  air: 'Vayu · Air',
  space: 'Akasha · Space',
};

const ELEMENT_COLORS = {
  fire: 'from-orange-500 to-orange-700',
  water: 'from-blue-500 to-blue-700',
  earth: 'from-green-500 to-green-700',
  air: 'from-sky-500 to-sky-700',
  space: 'from-teal-500 to-teal-700',
};

const ELEMENT_DESCRIPTIONS = {
  fire: 'Strong digestion and metabolism',
  water: 'Good emotional flow and nourishment',
  earth: 'Physical stability and grounding',
  air: 'Active movement and circulation',
  space: 'Mental clarity and rest',
};

export const FamilyNatureMap: React.FC<FamilyNatureMapProps> = ({
  members,
  onAddMember,
  onRefresh,
  onEditMember,
  onDeleteMember,
}) => {
  const [familyData, setFamilyData] = useState<FamilyNatureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFamilyNature();
  }, [members]);

  const loadFamilyNature = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = await apiClient.getCurrentUserId();

      if (!userId) {
        setError('User ID not found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await apiClient.getFamilyNature(userId);

      if (response.data) {
        setFamilyData(response.data);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (error) {
      setError('Failed to load family data');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={loadFamilyNature}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!familyData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">No family data available</p>
      </div>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{familyData.familyName}</h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-emerald-50 text-sm sm:text-base">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {familyData.memberCount} {familyData.memberCount === 1 ? 'member' : 'members'}
              </span>
              {familyData.createdAt && (
                <span className="hidden sm:inline">· Discovered {formatDate(familyData.createdAt)}</span>
              )}
            </div>
            {familyData.createdAt && (
              <span className="block sm:hidden text-emerald-50 text-xs mt-1">
                Discovered {formatDate(familyData.createdAt)}
              </span>
            )}
          </div>
          <button
            onClick={onAddMember}
            className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-medium hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add Member
          </button>
        </div>
      </div>

      {/* How Your Family is Naturally Made */}
      <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          <span className="text-base sm:text-xl">How Your Family is Naturally Made</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {familyData.members.map((member, index) => {
            const fullMember = members.find(m => m.fullName === member.name);

            const hasAssessment = member.prakriti;
            const memberAge = member.age || 0;
            const isEligibleForAssessment = memberAge >= 13;

            // Get dominant element and its percentage
            let dominantElement: string | null = null;
            let dominantPercentage = 0;

            if (fullMember?.prakriti?.elements) {
              const elements = fullMember.prakriti.elements;
              const elementEntries = Object.entries(elements) as [string, number][];
              const [element, percentage] = elementEntries.reduce((max, current) =>
                current[1] > max[1] ? current : max
              );
              dominantElement = element;
              dominantPercentage = percentage;
            } else if (hasAssessment && member.prakriti) {
              // Fallback: derive from dosha if elements not available
              const doshaToElement: Record<string, string> = {
                'vata': 'air',
                'pitta': 'fire',
                'kapha': 'earth',
                'tridoshic': 'space'
              };
              dominantElement = doshaToElement[member.prakriti.toLowerCase()] || null;
            }

            return (
              <div
                key={index}
                className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 border-2 border-gray-200 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md"
              >
                {/* Member Name & Age + Actions */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg sm:text-xl">{member.name}</h4>
                    {member.age && (
                      <p className="text-gray-500 text-xs sm:text-sm mt-1">{member.age} years old</p>
                    )}
                  </div>
                  {fullMember && (
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        onClick={() => onEditMember?.(fullMember._id)}
                        title="Edit member"
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteMember?.(fullMember._id)}
                        title="Delete member"
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {hasAssessment ? (
                  <div className="space-y-3 sm:space-y-4">
                    {/* Primary Prakriti */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Nature Type
                      </p>
                      <div className="inline-flex items-center bg-gradient-to-r from-emerald-100 to-teal-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-emerald-300">
                        <span className="text-xl sm:text-2xl mr-2">🌿</span>
                        <span className="font-bold text-emerald-800 text-base sm:text-lg">
                          {member.prakriti
                            ? member.prakriti.charAt(0).toUpperCase() + member.prakriti.slice(1)
                            : (fullMember?.prakriti?.primaryDosha
                              ? fullMember.prakriti.primaryDosha.charAt(0).toUpperCase() + fullMember.prakriti.primaryDosha.slice(1)
                              : '—')}
                        </span>
                      </div>
                    </div>

                    {/* Dominant Element */}
                    {dominantElement && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Dominant Element
                        </p>
                        <div className={`bg-gradient-to-r ${ELEMENT_COLORS[dominantElement as keyof typeof ELEMENT_COLORS]} p-2.5 sm:p-3 rounded-lg`}>
                          <div className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <span className="text-2xl sm:text-3xl">{ELEMENT_ICONS[dominantElement]}</span>
                              <span className="font-bold text-sm sm:text-lg leading-tight">
                                {ELEMENT_NAMES[dominantElement]}
                              </span>
                            </div>
                            {dominantPercentage > 0 && (
                              <span className="font-bold text-lg sm:text-xl">
                                {Math.round(dominantPercentage)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {isEligibleForAssessment ? (
                      <div className="space-y-3">
                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-4 text-center">
                          <p className="text-gray-500 text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                            Prakriti assessment not completed
                          </p>
                          {fullMember && (
                            <button
                              onClick={() => {
                                const event = new CustomEvent('startPrakritiAssessment', {
                                  detail: { member: fullMember }
                                });
                                window.dispatchEvent(event);
                              }}
                              className="w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs sm:text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            >
                              <span className="text-base sm:text-lg">🌿</span>
                              Start Assessment
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-lg p-3 sm:p-4">
                        <div className="text-center">
                          <span className="text-3xl sm:text-4xl mb-2 block">✨</span>
                          <p className="text-amber-800 text-sm sm:text-base font-bold mb-1">
                            Naturally Emerging
                          </p>
                          <p className="text-amber-600 text-xs">
                            Prakriti assessment available at age 13+
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Combined Nature Section */}
      {familyData.combinedElements && (
        <>
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
              Your Family's Combined Nature
            </h3>

            <div className="space-y-2 sm:space-y-3">
              {(Object.keys(familyData.combinedElements) as Array<keyof CombinedElements>).map((element) => (
                <ElementProgressBar
                  key={element}
                  element={element}
                  percentage={familyData.combinedElements![element]}
                />
              ))}
            </div>
          </div>

          {/* Strength and Weakness Cards */}
          {familyData.strongest && familyData.weakest && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className={`bg-gradient-to-br ${ELEMENT_COLORS[familyData.strongest as keyof typeof ELEMENT_COLORS]} rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg`}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                  <h4 className="text-base sm:text-lg font-semibold">Family Strength</h4>
                </div>
                <p className="text-xl sm:text-2xl font-bold mb-1">
                  {ELEMENT_NAMES[familyData.strongest as keyof typeof ELEMENT_NAMES]}
                </p>
                <p className="text-white/90 text-xs sm:text-sm">
                  {ELEMENT_DESCRIPTIONS[familyData.strongest as keyof typeof ELEMENT_DESCRIPTIONS]}
                </p>
              </div>

              <div className={`bg-gradient-to-br ${ELEMENT_COLORS[familyData.weakest as keyof typeof ELEMENT_COLORS]} rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg opacity-75`}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" />
                  <h4 className="text-base sm:text-lg font-semibold">Needs Most</h4>
                </div>
                <p className="text-xl sm:text-2xl font-bold mb-1">
                  {ELEMENT_NAMES[familyData.weakest as keyof typeof ELEMENT_NAMES]}
                </p>
                <p className="text-white/90 text-xs sm:text-sm">
                  Focus on nurturing this element for balance
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
