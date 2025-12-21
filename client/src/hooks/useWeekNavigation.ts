/**
 * useWeekNavigation Hook
 * 
 * Manages week view state for the Todos component.
 * Handles week start calculation, date generation, and navigation.
 * 
 * ## Features:
 * - Calculates week starting from Sunday
 * - Filters weekends in work mode (Monday-Friday only)
 * - Provides prev/next/current week navigation
 * 
 * ## Usage:
 * ```tsx
 * const { weekDates, handlePrevWeek, handleNextWeek } = useWeekNavigation({ workMode });
 * ```
 */

import { useState, useEffect, useCallback } from 'react';

export interface UseWeekNavigationOptions {
    workMode: boolean;
}

export interface UseWeekNavigationReturn {
    weekStart: Date;
    weekDates: Date[];
    handlePrevWeek: () => void;
    handleNextWeek: () => void;
    handleCurrentWeek: () => void;
}

/**
 * Get the start of the current week (Sunday at midnight).
 */
function getWeekStart(): Date {
    const d = new Date();
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function useWeekNavigation({ workMode }: UseWeekNavigationOptions): UseWeekNavigationReturn {
    const [weekStart, setWeekStart] = useState<Date>(getWeekStart);
    const [weekDates, setWeekDates] = useState<Date[]>([]);

    // Calculate week dates whenever start changes or mode changes
    useEffect(() => {
        let dates: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + i);
            dates.push(d);
        }

        // Filter out weekends for work mode (Monday-Friday only)
        if (workMode) {
            dates = dates.filter(d => {
                const day = d.getDay();
                return day !== 0 && day !== 6;
            });
        }

        setWeekDates(dates);
    }, [weekStart, workMode]);

    const handlePrevWeek = useCallback(() => {
        setWeekStart(prev => {
            const newStart = new Date(prev);
            newStart.setDate(newStart.getDate() - 7);
            return newStart;
        });
    }, []);

    const handleNextWeek = useCallback(() => {
        setWeekStart(prev => {
            const newStart = new Date(prev);
            newStart.setDate(newStart.getDate() + 7);
            return newStart;
        });
    }, []);

    const handleCurrentWeek = useCallback(() => {
        setWeekStart(getWeekStart());
    }, []);

    return {
        weekStart,
        weekDates,
        handlePrevWeek,
        handleNextWeek,
        handleCurrentWeek,
    };
}
