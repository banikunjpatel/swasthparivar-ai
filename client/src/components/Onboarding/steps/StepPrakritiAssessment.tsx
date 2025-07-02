// src/components/FamilyMemberForm/StepPrakritiAssessment.tsx

import React, { useState, useEffect } from 'react';

interface PrakritiQuestion {
  id: number;
  question: string;
  options: string[];
}

const QUESTIONS: PrakritiQuestion[] = [
  {
    id: 1,
    question: 'How would you describe your body build and weight tendencies?',
    options: [
      'Thin, finds it hard to gain weight',
      'Medium build, maintains weight easily',
      'Large, solid build, gains weight easily',
    ],
  },
  {
    id: 2,
    question: 'How is your energy throughout the day?',
    options: [
      'Bursts of energy, then fatigue',
      'Intense but short bursts',
      'Slow to start but lasts long — steady energy',
    ],
  },
  {
    id: 3,
    question: 'How would you describe your digestion and appetite?',
    options: [
      'Variable appetite, may skip meals',
      'Strong appetite, gets irritable if missed',
      'Slow digestion, often feels heavy after meals',
    ],
  },
  {
    id: 4,
    question: 'How does your skin and hair generally feel?',
    options: [
      'Dry, rough, prone to cracking',
      'Warm, prone to acne or redness',
      'Soft, smooth, moist and cool',
    ],
  },
  {
    id: 5,
    question: 'What is your typical emotional reaction under stress?',
    options: [
      'Anxiety, worry, overthinking',
      'Frustration, anger, impatience',
      'Irritated or angry',
    ],
  },
  {
    id: 6,
    question: 'How would you describe your sleep quality?',
    options: [
      'Light, interrupted, hard to fall asleep',
      'Deep but disturbed by dreams or heat',
      'Sleeps soundly but not for long',
    ],
  },
  {
    id: 7,
    question: 'Which type of weather do you prefer?',
    options: [
      'Warm, humid weather',
      'Cold weather',
      'Cool and dry weather',
    ],
  },
  {
    id: 8,
    question: 'Which statement best reflects your personality style?',
    options: [
      'Creative, spontaneous, quick to learn',
      'Focused, confident, likes leading',
      'Calm, supportive, loyal',
    ],
  },
  {
    id: 9,
    question: 'Which lifestyle trait best matches you?',
    options: [
      'Flexible, changes plans often',
      'I like discipline and order',
      'I prefer routines and slow pace',
    ],
  },
];


interface StepPrakritiAssessmentProps {
  selectedAnswers: string[]; 
  setSelectedAnswers: (answers: string[]) => void;
}

const StepPrakritiAssessment: React.FC<StepPrakritiAssessmentProps> = ({
  selectedAnswers,
  setSelectedAnswers,
}) => {
  const handleAnswerChange = (questionIndex: number, selectedOption: any) => {
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[questionIndex] = selectedOption;
    setSelectedAnswers(updatedAnswers);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Prakriti Assessment</h2>
      <p className="text-gray-600 mb-4">Answer the following questions to determine the prakriti.</p>

      {QUESTIONS.map((q, questionIndex) => (
        <div key={q.id} className="bg-white border rounded-lg shadow p-4 mb-4">
          <p className="text-gray-800 font-medium mb-2">{q.question}</p>
          <div className="space-y-2">
            {q.options.map((option, optionIndex) => (
              <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${questionIndex}`}
                  value={option}
                  checked={selectedAnswers[questionIndex] === option}
                  onChange={() => handleAnswerChange(questionIndex, option)}
                  className="accent-green-600"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StepPrakritiAssessment;
