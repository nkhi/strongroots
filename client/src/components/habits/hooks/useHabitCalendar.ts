import { useState, useMemo, useEffect } from 'react';
import { DateUtility } from '../../../utils';
import type { Habit } from '../../../types';

interface UseHabitCalendarProps {
  habits: Habit[];
  defaultStartDate: Date;
  tableWrapperRef: React.RefObject<HTMLDivElement>;
}

export function useHabitCalendar({ habits, defaultStartDate, tableWrapperRef }: UseHabitCalendarProps) {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(() => {
    const today = new Date();
    const currentWeekStart = DateUtility.getWeekStart(today);
    return new Set([DateUtility.formatDate(currentWeekStart)]);
  });

  const activeStartDate = useMemo(() => {
    if (habits.length === 0) return defaultStartDate;
    
    const earliest = Math.min(...habits.map(h => new Date(h.createdDate + 'T00:00:00').getTime()));
    if (!isNaN(earliest)) {
      return new Date(earliest);
    }
    return defaultStartDate;
  }, [habits, defaultStartDate]);

  const dates = useMemo(() => {
    if (habits.length === 0) return [];
    
    // Use activeStartDate directly here
    const allDates = DateUtility.getAllDatesFromStart(activeStartDate);
    return allDates.map(d => new Date(d));
  }, [activeStartDate, habits.length]);

  useEffect(() => {
    if (habits.length > 0) {
      setTimeout(() => scrollToToday(), 50);
    }
  }, [habits]);

  const weeks = useMemo(() => {
    const weeksMap = new Map<string, Date[]>();
    dates.forEach(date => {
      const start = DateUtility.getWeekStart(date);
      const key = DateUtility.formatDate(start);
      if (!weeksMap.has(key)) weeksMap.set(key, []);
      weeksMap.get(key)!.push(date);
    });
    return Array.from(weeksMap.entries())
      .map(([key, days]) => ({
        key,
        start: days[0],
        end: days[days.length - 1],
        days: days.reverse() // Reverse days within each week (newest first)
      }))
      .reverse(); // Reverse weeks array (newest week first)
  }, [dates]);

  function toggleWeek(weekKey: string) {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekKey)) {
      newExpanded.delete(weekKey);
    } else {
      newExpanded.add(weekKey);
    }
    setExpandedWeeks(newExpanded);
  }

  function scrollToToday() {
    const todayCells = document.querySelectorAll('.day-date.today');
    
    if (todayCells.length > 0 && tableWrapperRef.current) {
      const todayHeader = todayCells[0].closest('th');
      if (todayHeader) {
        const todayLeft = (todayHeader as HTMLElement).offsetLeft;
        // Scroll to show today on the left with some padding
        tableWrapperRef.current.scrollLeft = Math.max(0, todayLeft - 200);
      }
    }
  }

  return {
    dates,
    weeks,
    expandedWeeks,
    toggleWeek,
    scrollToToday,
    startDate: activeStartDate
  };
}
