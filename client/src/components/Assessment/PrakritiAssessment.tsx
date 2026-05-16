import { useState } from "react";
import { ProgressBar } from "./ProgressBar";
import { QuestionCard } from "./QuestionCard";
import { ReviewAnswers } from "./ReviewAnswers";
import { SuccessConfirmation } from "./SuccessConfirmation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { quizQuestions } from "../../data/quizQuestions";
import { Button } from "@mui/material";
import { apiClient } from "../../apiCall/api";

type QuizStage = 'questions' | 'review' | 'success';

interface FamilyMember {
  _id: string;
  fullName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  dietaryPreferences: string;
  state?: string;
}

interface PrakritiQuizProps {
  member?: FamilyMember | null;
  onComplete?: () => void;
}

export const PrakritiQuiz = ({ member, onComplete }: PrakritiQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [stage, setStage] = useState<QuizStage>('questions');

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [quizQuestions[currentQuestion].id]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setStage('review');
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleUpdateAnswer = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (!member) {
      console.error("No member provided for assessment");
      return;
    }

    // Transform answers to the new format: { "1": "A", "2": "B", ... }
    const answersMap: Record<string, string> = {};
    Object.entries(answers).forEach(([questionId, answer]) => {
      answersMap[questionId] = answer;
    });

    console.log('Submitting rule-based assessment with answers:', answersMap);

    // Call new rule-based prakriti assessment API
    const response = await apiClient.calculatePrakritiRuleBased({
      memberId: member._id,
      answers: answersMap,
    });

    if (response.error) {
      console.error("Prakriti assessment failed:", response.error);
      return;
    }

    console.log("Prakriti assessment result:", response.data);

    // Update member with complete prakriti assessment
    if (response.data) {
      // Structure the prakriti assessment data according to backend schema
      const prakritiAssessment = {
        primaryDosha: response.data.primaryDosha || 'unknown',
        secondaryDosha: response.data.secondaryDosha || null,
        distribution: {
          vata: response.data.distribution?.vata || 0,
          pitta: response.data.distribution?.pitta || 0,
          kapha: response.data.distribution?.kapha || 0,
        },
        elements: response.data.elements ? {
          fire: response.data.elements.fire || 0,
          water: response.data.elements.water || 0,
          earth: response.data.elements.earth || 0,
          air: response.data.elements.air || 0,
          space: response.data.elements.space || 0,
        } : undefined,
        guidance: {
          foods_to_favor: response.data.guidance?.foods_to_favor || [],
          foods_to_avoid: response.data.guidance?.foods_to_avoid || [],
          lifestyle_tips: response.data.guidance?.lifestyle_tips || [],
        },
        notes: response.data.notes || null,
        version: "2.0-rule-based",
      };

      console.log('Saving prakriti assessment with elements:', prakritiAssessment);

      try {
        const updateResponse = await apiClient.updateFamilyMember(member._id, {
          prakriti: prakritiAssessment,
        });

        console.log('Member update response:', updateResponse);

        // Call onComplete callback to refresh member list
        if (onComplete) {
          onComplete();
        }
      } catch (error) {
        console.error("Failed to update member prakriti assessment:", error);
      }
    }

    setStage('success');
  };

  const handleReturnHome = () => {
    // Reset quiz state
    setCurrentQuestion(0);
    setAnswers({});
    setStage('questions');
  };

  const isCurrentAnswered = answers[quizQuestions[currentQuestion]?.id];

  if (stage === 'success') {
    return <SuccessConfirmation onReturnHome={handleReturnHome} />;
  }

  if (stage === 'review') {
    return (
      <ReviewAnswers
        questions={quizQuestions}
        answers={answers}
        onUpdateAnswer={handleUpdateAnswer}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-4">
      <ProgressBar current={currentQuestion + 1} total={quizQuestions.length} />

      <AnimatePresence mode="wait">
        <QuestionCard
          key={currentQuestion}
          question={quizQuestions[currentQuestion]}
          selectedAnswer={answers[quizQuestions[currentQuestion].id] || null}
          onAnswerSelect={handleAnswerSelect}
        />
      </AnimatePresence>

      <div className="flex justify-between items-center mt-4 gap-4">
        <Button
          onClick={handleBack}
          variant="outlined"
          disabled={currentQuestion === 0}
          className="flex items-center gap-2 border-border hover:border-primary hover:bg-accent"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!isCurrentAnswered}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8"
        >
          {currentQuestion === quizQuestions.length - 1 ? 'Review Answers' : 'Next'}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
