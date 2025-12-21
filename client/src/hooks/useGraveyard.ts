/**
 * useGraveyard Hook
 * 
 * Manages graveyard (archived tasks) state and operations.
 * The graveyard is a holding area for tasks that are removed from the daily view
 * but not permanently deleted. Tasks can be "resurrected" back to a specific date.
 * 
 * ## Features:
 * - Panel open/close state
 * - Loading state for async operations
 * - CRUD operations: send to graveyard, resurrect, delete
 * - Optimistic updates with rollback on error
 * 
 * ## Usage:
 * ```tsx
 * const graveyard = useGraveyard({ workMode, onTasksChange });
 * // graveyard.sendToGraveyard(dateStr, taskId)
 * // graveyard.resurrectFromGraveyard(taskId, targetDate)
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import type { Task } from '../types';
import {
    getGraveyardTasks,
    getWorkGraveyardTasks,
    graveyardTask as apiGraveyardTask,
    resurrectTask as apiResurrectTask,
    deleteTask as apiDeleteTask,
} from '../api/tasks';

export interface UseGraveyardOptions {
    workMode: boolean;
    /** Callback when main tasks need updating (for optimistic updates) */
    tasks: Record<string, Task[]>;
    setTasks: React.Dispatch<React.SetStateAction<Record<string, Task[]>>>;
}

export interface UseGraveyardReturn {
    // Panel state
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    isLoading: boolean;
    tasks: Task[];

    // Operations (all have optimistic updates)
    sendToGraveyard: (dateStr: string, taskId: string) => Promise<void>;
    resurrectFromGraveyard: (taskId: string, targetDate: string) => Promise<void>;
    deleteGraveyardTask: (taskId: string) => Promise<void>;
}

export function useGraveyard({ workMode, tasks, setTasks }: UseGraveyardOptions): UseGraveyardReturn {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [graveyardTasks, setGraveyardTasks] = useState<Task[]>([]);

    // Load graveyard tasks when panel opens
    useEffect(() => {
        if (!isOpen) return;

        async function loadGraveyardTasks() {
            setIsLoading(true);
            try {
                const data = workMode
                    ? await getWorkGraveyardTasks()
                    : await getGraveyardTasks();
                setGraveyardTasks(data || []);
            } catch (error) {
                console.error('Failed to load graveyard tasks:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadGraveyardTasks();
    }, [isOpen, workMode]);

    /**
     * Move a task from a date to the graveyard.
     * Optimistic: immediately updates UI, rolls back on API failure.
     */
    const sendToGraveyard = useCallback(async (dateStr: string, taskId: string) => {
        const currentDayTasks = tasks[dateStr] || [];
        const task = currentDayTasks.find(t => t.id === taskId);
        if (!task) return;

        // Optimistic update
        setTasks(prev => ({
            ...prev,
            [dateStr]: (prev[dateStr] || []).filter(t => t.id !== taskId)
        }));
        setGraveyardTasks(prev => [{ ...task, date: null, state: 'active' }, ...prev]);

        try {
            await apiGraveyardTask(taskId);
        } catch (error) {
            console.error('Failed to graveyard task:', error);
            // Rollback
            setTasks(prev => ({ ...prev, [dateStr]: [...(prev[dateStr] || []), task] }));
            setGraveyardTasks(prev => prev.filter(t => t.id !== taskId));
        }
    }, [tasks, setTasks]);

    /**
     * Resurrect a task from graveyard to a specific date.
     * Optimistic: immediately updates UI, rolls back on API failure.
     */
    const resurrectFromGraveyard = useCallback(async (taskId: string, targetDate: string) => {
        const task = graveyardTasks.find(t => t.id === taskId);
        if (!task) return;

        // Optimistic update
        setGraveyardTasks(prev => prev.filter(t => t.id !== taskId));
        setTasks(prev => ({
            ...prev,
            [targetDate]: [...(prev[targetDate] || []), { ...task, date: targetDate, state: 'active' }]
        }));

        try {
            await apiResurrectTask(taskId, targetDate);
        } catch (error) {
            console.error('Failed to resurrect task:', error);
            // Rollback
            setGraveyardTasks(prev => [task, ...prev]);
            setTasks(prev => ({
                ...prev,
                [targetDate]: (prev[targetDate] || []).filter(t => t.id !== taskId)
            }));
        }
    }, [graveyardTasks, setTasks]);

    /**
     * Permanently delete a task from the graveyard.
     * Optimistic: immediately updates UI, rolls back on API failure.
     */
    const deleteGraveyardTask = useCallback(async (taskId: string) => {
        const task = graveyardTasks.find(t => t.id === taskId);
        if (!task) return;

        // Optimistic update
        setGraveyardTasks(prev => prev.filter(t => t.id !== taskId));

        try {
            await apiDeleteTask(taskId);
        } catch (error) {
            console.error('Failed to delete graveyard task:', error);
            // Rollback
            setGraveyardTasks(prev => [task, ...prev]);
        }
    }, [graveyardTasks]);

    return {
        isOpen,
        setIsOpen,
        isLoading,
        tasks: graveyardTasks,
        sendToGraveyard,
        resurrectFromGraveyard,
        deleteGraveyardTask,
    };
}
