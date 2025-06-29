import React, { useState } from 'react';
import { CheckCircle, Circle, ArrowRight, RotateCcw } from 'lucide-react';
import { PRAKRITI_QUESTIONS } from '../../data/ayurvedic-data';
import { DoshaType, DoshaBalance } from '../../types';

interface PrakritiAssessmentProps {
  onComplete: (prakriti: DoshaType, balance: DoshaBalance) => void;
}

const PrakritiAssessment: React.FC<PrakritiAssessmentProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [isComplete, setIsComplete] = useState(false);

  const handleAnswer = (questionId: number, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const calculateResults = () => {
    const scores = { vata: 0, pitta: 0, kapha: 0 };

    PRAKRITI_QUESTIONS.forEach((question) => {
      const answerIndex = answers[question.id];
      if (answerIndex !== undefined) {
        const selectedOption = question.options[answerIndex];
        scores[selectedOption.dosha as keyof typeof scores] += selectedOption.points;
      }
    });

    const total = scores.vata + scores.pitta + scores.kapha;
    const balance: DoshaBalance = {
      vata: Math.round((scores.vata / total) * 100),
      pitta: Math.round((scores.pitta / total) * 100),
      kapha: Math.round((scores.kapha / total) * 100)
    };

    // Determine primary dosha
    let prakriti: DoshaType;
    const sortedDoshas = Object.entries(balance).sort(([, a], [, b]) => b - a);
    const [primary, primaryScore] = sortedDoshas[0];
    const [secondary, secondaryScore] = sortedDoshas[1];

    if (primaryScore - secondaryScore < 10) {
      prakriti = `${primary}-${secondary}` as DoshaType;
    } else {
      prakriti = primary as DoshaType;
    }

    // ✅ Save to localStorage for guest users
    localStorage.setItem('guestAssessment', JSON.stringify({
      prakriti,
      currentDosha: balance,
      timestamp: new Date().toISOString()
    }));

    setIsComplete(true);
    onComplete(prakriti, balance);
  };

  const resetAssessment = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setIsComplete(false);
  };

  const nextQuestion = () => {
    if (currentQuestion < PRAKRITI_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const question = PRAKRITI_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / PRAKRITI_QUESTIONS.length) * 100;
  const isAnswered = answers[question?.id] !== undefined;

  if (isComplete) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Assessment Complete!</h2>
          <p className="text-gray-600 mb-6">Your Prakriti has been determined and saved{` `}
            {`(locally for guests)`}.</p>
          <button
            onClick={resetAssessment}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Assessment
          </button>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentQuestion + 1} of {PRAKRITI_QUESTIONS.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">{question.question}</h3>
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = answers[question.id] === index;
            return (
              <button
                key={index}
                onClick={() => handleAnswer(question.id, index)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                <div className="flex items-center">
                  {isSelected ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                  )}
                  <span className={isSelected ? 'font-medium' : ''}>{option.text}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          onClick={nextQuestion}
          disabled={!isAnswered}
          className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {currentQuestion === PRAKRITI_QUESTIONS.length - 1 ? 'Complete' : 'Next'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default PrakritiAssessment;
