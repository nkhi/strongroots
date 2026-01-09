import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CalendarEvent } from '../types';
import { fetchWithErrorReporting } from './errorReporter';
import { API_BASE_URL } from '../config';
import { queryKeys } from './queryKeys';
import { getLocalDateString } from '../utils/timezone';

// ============ Types ============

export interface CalendarEventsResponse {
    success: boolean;
    data: CalendarEvent[];
}

export interface CalendarSyncResponse {
    success: boolean;
    added: number;
    updated: number;
    deleted: number;
    total: number;
}

// ============ REST API Functions ============

export async function getCalendarEvents(date: Date): Promise<CalendarEvent[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const url = `${API_BASE_URL}/api/calendar?start=${startOfDay.toISOString()}&end=${endOfDay.toISOString()}`;
    const response = await fetchWithErrorReporting(url);

    if (!response.ok) throw new Error('Failed to fetch calendar events');

    const json: CalendarEventsResponse = await response.json();
    return json.data || [];
}

export async function syncCalendarEvents(
    daysBack = 7,
    daysForward = 28
): Promise<CalendarSyncResponse> {
    const response = await fetchWithErrorReporting(`${API_BASE_URL}/api/calendar/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daysBack, daysForward })
    });

    if (!response.ok) throw new Error('Calendar sync failed');

    return response.json();
}

export async function getCalendarEventsRange(
    startDate: Date,
    endDate: Date
): Promise<CalendarEvent[]> {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const url = `${API_BASE_URL}/api/calendar?start=${start.toISOString()}&end=${end.toISOString()}`;
    const response = await fetchWithErrorReporting(url);

    if (!response.ok) throw new Error('Failed to fetch calendar events');

    const json: CalendarEventsResponse = await response.json();
    return json.data || [];
}

// ============ TanStack Query Hooks ============

function formatDateKey(date: Date): string {
    // Use timezone-aware date string for cache keys
    return getLocalDateString(date);
}

export function useCalendarEventsForDate(date: Date, enabled = true) {
    const dateStr = formatDateKey(date);
    return useQuery({
        queryKey: queryKeys.calendar.events(dateStr),
        queryFn: () => getCalendarEvents(date),
        enabled,
    });
}

export function useCalendarEventsRange(startDate: Date, endDate: Date, enabled = true) {
    const startStr = formatDateKey(startDate);
    const endStr = formatDateKey(endDate);
    return useQuery({
        queryKey: queryKeys.calendar.range(startStr, endStr),
        queryFn: () => getCalendarEventsRange(startDate, endDate),
        enabled,
    });
}

export function useSyncCalendar() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ daysBack, daysForward }: { daysBack?: number; daysForward?: number } = {}) =>
            syncCalendarEvents(daysBack, daysForward),
        onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.calendar.all }),
    });
}
