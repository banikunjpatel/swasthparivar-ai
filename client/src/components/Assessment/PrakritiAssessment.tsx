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
import { useAuth } from "../../hooks/useAuth";

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
  const { user } = useAuth();

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
    // Transform answers to backend format
    const questions = quizQuestions.map((q) => {
      const answer = answers[q.id];
      return {
        question: q.question,
        answer: answer || "",
      };
    });

    // Get profile data from member (if provided) or user context
    const profile = {
      name: member?.fullName || user?.name || "User",
      age: member?.age || user?.age || undefined,
      gender: member?.gender || undefined,
      region: member?.state || user?.location || undefined,
    };

    // Call prakriti assessment API
    const response = await apiClient.calculatePrakriti({
      profile,
      questions,
    });

    if (response.error) {
      console.error("Prakriti assessment failed:", response.error);
      return;
    }

    console.log("Prakriti assessment result:", response.data);

    // If member is provided, update member with complete prakriti assessment
    if (member && response.data) {
      // Structure the prakriti assessment data according to backend schema
      const prakritiAssessment = {
        primaryDosha: response.data.primaryDosha || 'unknown',
        secondaryDosha: response.data.secondaryDosha || null,
        distribution: {
          vata: response.data.distribution?.vata || 0,
          pitta: response.data.distribution?.pitta || 0,
          kapha: response.data.distribution?.kapha || 0,
        },
        guidance: {
          foods_to_favor: response.data.guidance?.foods_to_favor || [],
          foods_to_avoid: response.data.guidance?.foods_to_avoid || [],
          lifestyle_tips: response.data.guidance?.lifestyle_tips || [],
        },
        notes: response.data.notes || null,
        version: "1.0",
      };

      try {
        await apiClient.updateFamilyMember(member._id, {
          prakriti: prakritiAssessment,
        });

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
    <div className="max-w-3xl mx-auto pb-10">
      <ProgressBar current={currentQuestion + 1} total={quizQuestions.length} />

      <AnimatePresence mode="wait">
        <QuestionCard
          key={currentQuestion}
          question={quizQuestions[currentQuestion]}
          selectedAnswer={answers[quizQuestions[currentQuestion].id] || null}
          onAnswerSelect={handleAnswerSelect}
        />
      </AnimatePresence>

      <div className="flex justify-between items-center mt-8 gap-4">
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
