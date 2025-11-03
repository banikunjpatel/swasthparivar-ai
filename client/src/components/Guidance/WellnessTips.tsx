// src/components/WellnessTips.tsx

import React, { useState } from 'react';

interface Member {
    _id: string;
    fullName: string;
    prakriti: 'vata' | 'pitta' | 'kapha';
}

interface WellnessTipsProps {
    season: 'spring' | 'summer' | 'monsoon' | 'autumn' | 'winter' | 'pre-winter';
    members: Member[];
}

const seasonalTips: Record<
    'spring' | 'summer' | 'monsoon' | 'autumn' | 'winter' | 'pre-winter',
    string[]
> = {
    spring: ['Practice daily oil massage (Abhyanga)', 'Detoxify with light meals and warm teas'],
    summer: [
        'Stay hydrated with coconut water and fresh fruit juices',
        'Practice Sheetali pranayama (cooling breath)',
        'Eat cooling foods like cucumber, watermelon, and mint',
        'Avoid excessive sun exposure during peak hours',
    ],
    monsoon: ['Avoid raw foods, prefer warm and cooked meals', 'Stay dry and avoid damp places'],
    autumn: ['Use cooling oils like coconut or sandalwood for massage', 'Eat sweet, bitter and astringent foods'],
    winter: ['Stay warm with soups and stews', 'Practice warming yoga and breathing techniques'],
    'pre-winter': ['Start oil massages early', 'Eat nourishing, grounding foods'],
};

const prakritiTips: Record<'vata' | 'pitta' | 'kapha', string[]> = {
    vata: ['Follow routine and sleep early', 'Eat warm, moist and oily foods', 'Avoid cold and dry foods'],
    pitta: [
        'Avoid excessive heat and spicy foods',
        'Practice cooling pranayama like Sheetali',
        'Engage in moderate, non-competitive activities',
    ],
    kapha: [
        'Engage in vigorous, energizing exercise',
        'Eat light, warm, and spicy foods',
        'Wake up early, before 6 AM',
    ],
};

const todayTip = {
    title: 'Morning Ritual',
    description:
        'Start your day with a glass of warm water mixed with a pinch of turmeric and lemon juice. This simple Ayurvedic practice helps detoxify your system and boosts immunity.',
};

const WellnessTips: React.FC<WellnessTipsProps> = ({ season, members }) => {
    const [selectedMemberId, setSelectedMemberId] = useState<string>('all');

    const filteredMembers =
        selectedMemberId === 'all' ? members : members.filter((m) => m._id === selectedMemberId);

    return (
        <div className="p-6 rounded-md shadow-md bg-green-50">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">🌿 Wellness & Ayurvedic Tips</h2>

            {/* Today's Tip */}
            <div className="bg-green-100 border border-green-300 p-4 rounded-md shadow-sm mb-6">
                <h3 className="text-xl font-bold text-green-800 mb-4">✨ Today's Wellness Tip</h3>
                <div className='bg-white p-4 shadow-md'>
                    <strong>🌞 {todayTip.title}</strong>
                    <p>{todayTip.description}</p>
                </div>
            </div>

            {/* Seasonal Tips */}
            <div className="bg-white p-4 rounded-md shadow-md mb-6">
                <h3 className="text-xl font-bold mb-2">🌞 {season.charAt(0).toUpperCase() + season.slice(1)} Wellness Guide</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-disc pl-5">
                    {seasonalTips[season].map((tip, index) => (
                        <li key={index}>{tip}</li>
                    ))}
                </ul>
            </div>

            {/* Member Filter */}
            <div className="mb-4">
                <label className="font-semibold mr-2">Personalized Tips by Constitution:</label>
                <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="all">All Members</option>
                    {members.map((m) => (
                        <option key={m._id} value={m._id}>
                            {m.fullName}
                        </option>
                    ))}
                </select>
            </div>

            {/* Tips by Prakriti */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredMembers.map((member) => {
                    const bgGradient =
                        member.prakriti === 'pitta'
                            ? 'bg-gradient-to-r from-red-500 to-orange-400'
                            : member.prakriti === 'kapha'
                                ? 'bg-gradient-to-r from-green-500 to-blue-400'
                                : 'bg-gradient-to-r from-purple-400 to-indigo-500';

                    return (
                        <div
                            key={member._id}
                            className="p-4 rounded-xl shadow-md bg-white transition-transform hover:scale-[1.01]"
                        >
                            {/* Constitution Header */}
                            <div className="flex flex-col items-start">
                                <div
                                    className={`text-white px-4 py-1 rounded-full font-semibold text-xl mb-2 ${bgGradient}`}
                                >
                                    {member.prakriti.charAt(0).toUpperCase() + member.prakriti.slice(1)} Constitution
                                </div>

                                <div className="px-3 py-1 text-sm bg-gray-200 rounded-full text-gray-800 inline-block mb-3 mt-2">
                                    {member.fullName}
                                </div>
                            </div>

                            {/* Tips List */}
                            <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
                                {prakritiTips[member.prakriti].map((tip, index) => (
                                    <li key={index}>{tip}</li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WellnessTips;
