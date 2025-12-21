/**
 * Task Utilities
 * 
 * Pure functions for task data manipulation. No React hooks or state.
 * These are the building blocks used by both Todos.tsx and useTaskDragAndDrop.
 * 
 * ## Contents:
 * - getTaskCategory: Extract typed category from task
 * - getTaskState: Extract typed state from task  
 * - getCountsForCategory: Count tasks by state for status bars
 * - calculatePuntDays: Compute days since task creation
 * - getNextWorkday: Skip weekends for work mode punting
 */

import type { Task } from '../../types';

// ============================================
// Types
// ============================================

/** Task category - either 'work' or 'life' */
export type TaskCategory = 'work' | 'life';

/** Task state - active, completed, or failed */
export type TaskState = 'active' | 'completed' | 'failed';

/** Counts for tasks in a category, split by state */
export interface TaskCounts {
    active: number;
    punted: number;
    completed: number;
    failed: number;
}

// ============================================
// Category & State Helpers
// ============================================

/**
 * Get task category, defaulting to 'life' if unset.
 * Tasks without a category are considered 'life' tasks.
 */
export function getTaskCategory(task: Task): TaskCategory {
    return task.category === 'work' ? 'work' : 'life';
}

/**
 * Get task state, handling legacy 'completed' boolean.
 * Priority: explicit state > completed boolean > default 'active'
 */
export function getTaskState(task: Task): TaskState {
    if (task.state === 'completed' || task.state === 'failed') {
        return task.state;
    }
    return task.completed ? 'completed' : 'active';
}

// ============================================
// Counting & Statistics
// ============================================

/**
 * Count tasks by state for status bar display.
 * Separates punted active tasks (puntDays > 0) from fresh active tasks.
 */
export function getCountsForCategory(taskList: Task[]): TaskCounts {
    let active = 0;
    let punted = 0;
    let completed = 0;
    let failed = 0;

    taskList.forEach(t => {
        const state = getTaskState(t);
        if (state === 'completed') {
            completed++;
        } else if (state === 'failed') {
            failed++;
        } else if ((t.puntDays || 0) > 0) {
            punted++;
        } else {
            active++;
        }
    });

    return { active, punted, completed, failed };
}

// ============================================
// Punt Day Calculation
// ============================================

/**
 * Count business days (Mon-Fri) between two dates.
 * Used for work tasks to show "work days punted" instead of calendar days.
 */
function countWorkdays(start: Date, end: Date): number {
    let count = 0;
    const current = new Date(start);
    while (current < end) {
        const day = current.getUTCDay();
        if (day !== 0 && day !== 6) count++;
        current.setUTCDate(current.getUTCDate() + 1);
    }
    return count;
}

/**
 * Calculate how many days a task has been punted.
 * Used for optimistic UI updates before server confirms.
 * 
 * @param createdAt - ISO string of when task was created
 * @param targetDateStr - YYYY-MM-DD of the target date
 * @param category - 'work' counts business days only, 'life' counts calendar days
 * @returns Number of days between creation and target (min 0)
 */
export function calculatePuntDays(createdAt: string, targetDateStr: string, category: TaskCategory = 'life'): number {
    const createdDate = new Date(createdAt.split('T')[0] + 'T00:00:00Z');
    const targetDate = new Date(targetDateStr + 'T00:00:00Z');

    if (category === 'work') {
        return countWorkdays(createdDate, targetDate);
    }
    return Math.max(0, Math.floor((targetDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));
}

/**
 * Get the next workday, skipping weekends.
 * Used in work mode to punt Friday tasks to Monday.
 * 
 * @param date - Starting date (will be mutated if weekend)
 * @returns The same Date object, advanced past any weekend days
 */
export function getNextWorkday(date: Date): Date {
    while (date.getUTCDay() === 0 || date.getUTCDay() === 6) {
        date.setUTCDate(date.getUTCDate() + 1);
    }
    return date;
}
