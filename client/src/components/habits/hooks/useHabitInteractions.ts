import { useState, useCallback, useRef } from 'react';
import { reorderHabit, getHabits } from '../../../api/habits';
import type { Habit } from '../../../types';

interface ReorderPosition {
  x: number;
  y: number;
}

export function useHabitInteractions(setHabits: (habits: Habit[]) => void) {
  // Reorder State
  const [reorderingHabit, setReorderingHabit] = useState<Habit | null>(null);
  const [reorderPosition, setReorderPosition] = useState<ReorderPosition | null>(null);

  // Tooltip State
  const [hoveredHabitId, setHoveredHabitId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const hoverTimerRef = useRef<number | null>(null);

  // Deadline Tooltip State
  const [deadlineTooltip, setDeadlineTooltip] = useState<{ x: number; y: number; time: string } | null>(null);

  // Reorder Handlers
  const handleReorderStart = useCallback((habit: Habit, position: ReorderPosition) => {
    setReorderingHabit(habit);
    setReorderPosition(position);
  }, []);

  const handleReorderSelect = useCallback(async (targetHabitId: string | null) => {
    if (!reorderingHabit) return;

    try {
      await reorderHabit(reorderingHabit.id, targetHabitId);
      const updatedHabits = await getHabits();
      setHabits(updatedHabits);
    } catch (error) {
      console.error('Failed to reorder habit:', error);
    } finally {
      setReorderingHabit(null);
    }
  }, [reorderingHabit, setHabits]);

  const handleReorderClose = useCallback(() => {
    setReorderingHabit(null);
    setReorderPosition(null);
  }, []);

  // Tooltip Handlers
  const handleHabitNameMouseEnter = useCallback((event: React.MouseEvent, habitId: string, comment?: string | null) => {
    if (!comment) return;

    const rect = event.currentTarget.getBoundingClientRect();

    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
    }

    hoverTimerRef.current = window.setTimeout(() => {
      setHoveredHabitId(habitId);
      setTooltipPosition({
        x: rect.right,
        y: rect.top + rect.height / 2
      });
    }, 1500);
  }, []);

  const handleHabitNameMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      // Clear the timeout if it's pending
      window.clearTimeout(hoverTimerRef.current);
      // Reset the ref
      hoverTimerRef.current = null;
    }
    // Always clear state
    setHoveredHabitId(null);
    setTooltipPosition(null);
  }, []);

  // Deadline Handlers
  const handleDeadlineMouseEnter = useCallback((event: React.MouseEvent, deadlineTime: string) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setDeadlineTooltip({
      x: rect.right + 8,
      y: rect.top + rect.height / 2,
      time: deadlineTime
    });
  }, []);

  const handleDeadlineMouseLeave = useCallback(() => {
    setDeadlineTooltip(null);
  }, []);

  return {
    reorderingHabit,
    reorderPosition,
    hoveredHabitId,
    tooltipPosition,
    deadlineTooltip,
    handleReorderStart,
    handleReorderSelect,
    handleReorderClose,
    handleHabitNameMouseEnter,
    handleHabitNameMouseLeave,
    handleDeadlineMouseEnter,
    handleDeadlineMouseLeave
  };
}
