import { Button } from "@mui/material";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface SuccessConfirmationProps {
  onReturnHome: () => void;
}

export const SuccessConfirmation = ({ onReturnHome }: SuccessConfirmationProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mb-6"
      >
        <CheckCircle className="w-24 h-24 text-primary" strokeWidth={1.5} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-foreground mb-3"
      >
        Assessment Complete!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-lg text-muted-foreground mb-8 max-w-md"
      >
        Your Prakriti profile has been updated successfully. We'll use this to personalize your wellness journey.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={onReturnHome}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-xl"
        >
          Return to Dashboard
        </Button>
      </motion.div>
    </motion.div>
  );
};
