import { motion } from "framer-motion";
import { QuizQuestion } from "../../data/quizQuestions";
import { cn } from "../../utils/transformMealPlan";

interface QuestionCardProps {
  question: QuizQuestion;
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
}

export const QuestionCard = ({ question, selectedAnswer, onAnswerSelect }: QuestionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <h2 className="text-base md:text-lg font-semibold text-foreground mb-3 text-center px-2">
        {question.question}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === option.label;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => onAnswerSelect(option.label)}
              className={cn(
                "relative flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 bg-card hover:shadow-md",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border/50 hover:border-primary/50"
              )}
            >
              {/* Label badge */}
              <div className={cn(
                "absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {option.label}
              </div>

              {/* Image — reduced height */}
              <div className="w-full h-36 md:h-40 mb-2 rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
                <img
                  src={option.image}
                  alt={option.text}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Title */}
              <h3 className={cn(
                "text-sm font-semibold text-center mb-1 transition-colors leading-tight",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {option.text}
              </h3>

              {/* Description */}
              <p className="text-xs text-muted-foreground text-center leading-snug">
                {option.description}
              </p>

              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                >
                  <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
