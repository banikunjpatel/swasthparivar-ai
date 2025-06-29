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
    question: 'How would you describe your body frame?',
    options: ['Thin and light', 'Medium and muscular', 'Broad and heavy'],
  },
  {
    id: 2,
    question: 'Your skin tends to be...',
    options: ['Dry and rough', 'Oily and sensitive', 'Smooth and moist'],
  },
  {
    id: 3,
    question: 'How is your appetite?',
    options: ['Variable', 'Strong', 'Slow'],
  },
  {
    id: 4,
    question: 'Your sleep pattern is...',
    options: ['Light and interrupted', 'Moderate', 'Heavy and long'],
  },
  {
    id: 5,
    question: 'Your nature is mostly...',
    options: ['Restless', 'Aggressive', 'Calm'],
  },
  {
    id: 6,
    question: 'Your digestion is...',
    options: ['Irregular', 'Strong', 'Slow'],
  },
  {
    id: 7,
    question: 'You get tired...',
    options: ['Easily', 'Sometimes', 'Rarely'],
  },
  {
    id: 8,
    question: 'You react to stress by...',
    options: ['Worrying', 'Getting angry', 'Withdrawing'],
  },
];

interface StepPrakritiAssessmentProps {
  selectedAnswers: number[]; // index of selected option per question
  setSelectedAnswers: (answers: number[]) => void;
}

const StepPrakritiAssessment: React.FC<StepPrakritiAssessmentProps> = ({
  selectedAnswers,
  setSelectedAnswers,
}) => {
  const handleAnswerChange = (questionIndex: number, optionIndex: number) => {
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[questionIndex] = optionIndex;
    setSelectedAnswers(updatedAnswers);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Prakriti Assessment</h2>
      <p className="text-gray-600 mb-4">Answer the following questions to determine the prakriti.</p>

      {QUESTIONS.map((q, i) => (
        <div key={q.id} className="bg-white border rounded-lg shadow p-4 mb-4">
          <p className="text-gray-800 font-medium mb-2">{q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, optIndex) => (
              <label
                key={optIndex}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  checked={selectedAnswers[i] === optIndex}
                  onChange={() => handleAnswerChange(i, optIndex)}
                  className="text-green-600"
                />
                <span className="text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StepPrakritiAssessment;
