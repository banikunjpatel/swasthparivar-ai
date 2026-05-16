import { motion } from "framer-motion";
import { useState } from "react";
import { Edit2, Check } from "lucide-react";
import { QuizQuestion } from "../../data/quizQuestions";
import { Button } from "@mui/material";
import { cn } from "../../utils/transformMealPlan";

interface ReviewAnswersProps {
  questions: QuizQuestion[];
  answers: Record<number, string>;
  onUpdateAnswer: (questionId: number, answer: string) => void;
  onSubmit: () => void;
}

export const ReviewAnswers = ({ questions, answers, onUpdateAnswer, onSubmit }: ReviewAnswersProps) => {
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);

  const handleEdit = (questionId: number) => {
    setEditingQuestion(questionId);
  };

  const handleSave = () => {
    setEditingQuestion(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Review Your Answers</h1>
        <p className="text-muted-foreground">
          Please review your responses before submitting. You can edit any answer.
        </p>
      </div>

      <div className="space-y-6 mb-8">
        {questions.map((question, index) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <span className="text-sm font-medium text-primary">Question {question.id}</span>
                <h3 className="text-lg font-semibold text-foreground mt-1">{question.question}</h3>
              </div>
              
              {editingQuestion !== question.id && (
                <Button
                  variant="text"
                  size="small"
                  onClick={() => handleEdit(question.id)}
                  className="text-primary hover:text-primary hover:bg-accent"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>

            {editingQuestion === question.id ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {question.options.map((option, optIndex) => {
                    const isSelected = answers[question.id] === option.label;
                    return (
                      <div
                        key={optIndex}
                        onClick={() => onUpdateAnswer(question.id, option.label)}
                        className={cn(
                          "flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                          isSelected 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="relative w-16 h-16 mb-2">
                          <img src={option.image} alt={option.text} className="w-full h-full object-cover rounded" />
                          <div className="absolute -top-1 -left-1 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                            {option.label}
                          </div>
                        </div>
                        <span className={cn(
                          "text-sm font-medium text-center",
                          isSelected ? "text-primary" : "text-foreground"
                        )}>
                          {option.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <Button
                  onClick={handleSave}
                  className="mt-4 bg-primary hover:bg-primary/90"
                  size="small"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Save Changes
                </Button>
              </div>
            ) : (
              <div className="bg-accent/30 rounded-lg p-4 border-l-4 border-primary">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {answers[question.id]}
                  </div>
                  <p className="text-foreground font-medium">
                    {question.options.find(opt => opt.label === answers[question.id])?.text || answers[question.id]}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={onSubmit}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Submit to Update Dosha Profile
        </Button>
      </motion.div>
    </motion.div>
  );
};
