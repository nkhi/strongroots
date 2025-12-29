import { useMemo, useCallback } from 'react';
import type { Habit, HabitEntry } from '../../../types';
import { DateUtility, getGrade } from '../../../utils';

interface UseHabitStatsProps {
  habits: Habit[];
  entries: Map<string, HabitEntry>;
  weeks: { key: string; start: Date; end: Date; days: Date[] }[];
  startDate: Date;
}

export function useHabitStats({ habits, entries, weeks, startDate }: UseHabitStatsProps) {

  const getEntry = useCallback((date: Date, habitId: string): HabitEntry | undefined => {
    const dateStr = DateUtility.formatDate(date);
    const key = `${dateStr}_${habitId}`;
    return entries.get(key);
  }, [entries]);

  const getHabitStats = useCallback((habitId: string, weekStart: Date, weekEnd: Date) => {
    const habit = habits.find(h => h.id === habitId);
    const isWeekdays = habit?.defaultTime === 'weekdays';

    let successCount = 0;
    let totalCount = 0;

    let curr = new Date(weekStart);
    while (curr <= weekEnd) {
      const isWeekend = curr.getDay() === 0 || curr.getDay() === 6;
      if (isWeekdays && isWeekend) {
        curr.setDate(curr.getDate() + 1);
        continue;
      }

      const entry = getEntry(curr, habitId);
      if (entry && (entry.state === 1 || entry.state === 3)) {
        successCount++;
      }
      totalCount++;
      curr.setDate(curr.getDate() + 1);
    }

    const percentage = totalCount === 0 ? 0 : (successCount / totalCount) * 100;
    return {
      successCount,
      totalCount,
      percentage,
      grade: getGrade(percentage)
    };
  }, [habits, getEntry]);

  const getDayStats = useCallback((date: Date) => {
    let successCount = 0;
    let totalCount = 0;
    const breakdown: Record<string, { success: number; total: number }> = {};

    habits.forEach(habit => {
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      if (habit.defaultTime === 'weekdays' && isWeekend) {
        return;
      }

      if (!breakdown[habit.defaultTime]) {
        breakdown[habit.defaultTime] = { success: 0, total: 0 };
      }

      const entry = getEntry(date, habit.id);
      const isSuccess = entry && (entry.state === 1 || entry.state === 3);

      if (isSuccess) {
        successCount++;
        breakdown[habit.defaultTime].success++;
      }
      totalCount++;
      breakdown[habit.defaultTime].total++;
    });

    const percentage = totalCount === 0 ? 0 : (successCount / totalCount) * 100;
    return { percentage, totalCount, successCount, breakdown };
  }, [habits, getEntry]);

  const chartData = useMemo(() => {
    return weeks.map(week => {
      const weekStart = new Date(week.key + 'T00:00:00');
      const weekEnd = week.end;

      const dataPoint: any = {
        name: `${weekStart.toLocaleDateString('en-US', { month: 'short' })} ${DateUtility.getDayNumber(weekStart)}`,
      };

      habits.forEach(habit => {
        const isWeekdays = habit.defaultTime === 'weekdays';
        let successCount = 0;
        let totalCount = 0;
        let curr = new Date(weekStart);
        while (curr <= weekEnd) {
          const isWeekend = curr.getDay() === 0 || curr.getDay() === 6;
          if (isWeekdays && isWeekend) {
            curr.setDate(curr.getDate() + 1);
            continue;
          }

          const entry = getEntry(curr, habit.id);

          if (entry && (entry.state === 1 || entry.state === 3)) {
            successCount++;
          }
          totalCount++;
          curr.setDate(curr.getDate() + 1);
        }

        const percentage = totalCount === 0 ? 0 : (successCount / totalCount) * 100;
        dataPoint[habit.id] = Math.round(percentage);
      });

      return dataPoint;
    });
  }, [weeks, habits, getEntry]);

  const getCurrentStreak = useCallback((habitId: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    let currentDate = new Date(today);
    let skippedToday = false;

    while (currentDate >= startDate) {
      const entry = getEntry(currentDate, habitId);

      if (!skippedToday && currentDate.getTime() === today.getTime()) {
        if (!entry || entry.state === 0) {
          currentDate.setDate(currentDate.getDate() - 1);
          skippedToday = true;
          continue;
        }
      }

      if (entry && (entry.state === 1 || entry.state === 3)) {
        streak++;
      } else {
        break;
      }
      currentDate.setDate(currentDate.getDate() - 1);
    }
    return streak;
  }, [getEntry, startDate]);

  const getFailedStreak = useCallback((habitId: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    let currentDate = new Date(today);
    let skippedToday = false;

    while (currentDate >= startDate) {
        const entry = getEntry(currentDate, habitId);

        if(!skippedToday && currentDate.getTime() === today.getTime()) {
            if(!entry || entry.state === 0) {
                currentDate.setDate(currentDate.getDate() - 1);
                skippedToday = true;
                continue;
            }
        }

        if(entry && entry.state === 2) {
            streak++;
        } else {
            break;
        }
        currentDate.setDate(currentDate.getDate() - 1);
    }
    return streak;
  }, [getEntry, startDate]);

  return {
    getHabitStats,
    getDayStats,
    chartData,
    getCurrentStreak,
    getFailedStreak
  };
}
