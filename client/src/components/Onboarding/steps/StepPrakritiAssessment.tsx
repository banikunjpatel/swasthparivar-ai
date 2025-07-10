// src/components/FamilyMemberForm/StepPrakritiAssessment.tsx

import React from 'react';
import { PrakritiQuestions } from '../../../data/ayurvedic-data';


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

      {PrakritiQuestions.map((q, questionIndex) => (
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
