import React, { useState } from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import apiClient from '../../apiCall/api';

export interface DailyTask {
  taskId: string;
  season: string;
  dayNumber: number;
  element: string;
  title: string;
  description: string;
  quote?: string;
  cycle?: string;
  completed: boolean;
}

interface DailyTaskCardProps {
  task: DailyTask;
  onComplete?: (taskId: string) => void;
}

const ELEMENT_META: Record<string, { icon: string }> = {
  Fire:  { icon: '🔥' },
  Water: { icon: '💧' },
  Earth: { icon: '🌱' },
  Air:   { icon: '🌬️' },
  Space: { icon: '✨' },
};

const DailyTaskCard: React.FC<DailyTaskCardProps> = ({ task, onComplete }) => {
  const [completed, setCompleted] = useState(task.completed);
  const [loading, setLoading] = useState(false);

  const meta = ELEMENT_META[task.element] ?? ELEMENT_META.Fire;

  // Sync completed state with task.completed prop
  React.useEffect(() => {
    setCompleted(task.completed);
  }, [task.completed]);

  const handleMarkDone = async () => {
    if (completed || loading) return;
    setLoading(true);
    try {
      const userId = await apiClient.getCurrentUserId();
      const res = await apiClient.completeTask(task.taskId, userId);
      if (!res.error) {
        setCompleted(true);
        onComplete?.(task.taskId);
      }
    } catch (err) {
      console.error('Failed to complete task', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm bg-secondary">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <p className="text-xs font-semibold tracking-widest text-secondary-foreground uppercase mb-3">
          Today's Practice
        </p>

        {/* Phase badge */}
        <div className="inline-flex items-center gap-2 bg-secondary-foreground/10 rounded-full px-3 py-1.5 mb-4">
          <span className="text-xs font-bold text-secondary-foreground tracking-wide uppercase">
            Day {task.dayNumber} — {task.element} Phase
          </span>
        </div>

        {/* Element tag */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-secondary-foreground/15 text-secondary-foreground border border-secondary-foreground/20">
            <span>{meta.icon}</span>
            {task.element}
          </span>
          {task.cycle && (
            <span className="text-xs text-secondary-foreground">• {task.cycle}</span>
          )}
        </div>

        {/* Task title */}
        <p className="text-secondary-foreground font-semibold text-base leading-snug mb-2">
          {task.title}
        </p>

        {/* Task description */}
        {task.description && (
          <p className="text-secondary-foreground text-sm leading-relaxed mb-4">
            {task.description}
          </p>
        )}

        {/* Mark as Done */}
        <button
          onClick={handleMarkDone}
          disabled={completed || loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all
            ${completed
              ? 'bg-secondary-foreground/20 text-secondary-foreground cursor-default'
              : 'bg-secondary-foreground/10 text-secondary-foreground hover:bg-secondary-foreground/20 active:scale-95 cursor-pointer'
            }`}
        >
          {completed
            ? <><CheckCircle className="w-4 h-4" /> Done</>
            : <><Circle className="w-4 h-4" /> {loading ? 'Saving…' : 'Mark as Done'}</>
          }
        </button>
      </div>

      {/* Quote footer */}
      {task.quote && (
        <div className="mx-6 mb-5 mt-2 border-t border-secondary-foreground/15 pt-3">
          <p className="text-xs italic text-secondary-foreground leading-relaxed">
            "{task.quote}"
          </p>
        </div>
      )}
    </div>
  );
};

export default DailyTaskCard;
