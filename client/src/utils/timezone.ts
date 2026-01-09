/**
 * Timezone Utility Module
 * 
 * Centralized timezone handling for the application.
 * All dates from the server are in UTC. This module provides utilities to:
 * - Convert UTC dates to the user's local timezone
 * - Group events by their local date (not UTC date)
 * - Support future timezone switching (e.g., when traveling)
 * 
 * The user's timezone is stored in localStorage and defaults to the browser's timezone.
 */

const TIMEZONE_STORAGE_KEY = 'user-timezone';
const DEFAULT_TIMEZONE = 'America/New_York';

/**
 * Get the browser's timezone, falling back to Eastern Time if detection fails
 */
function getBrowserTimezone(): string {
    try {
        const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return detected || DEFAULT_TIMEZONE;
    } catch {
        return DEFAULT_TIMEZONE;
    }
}

// IANA timezone identifier (e.g., 'America/New_York', 'America/Los_Angeles', 'Europe/London')
let currentTimezone: string = getStoredTimezone() || getBrowserTimezone();

/**
 * Get the stored timezone from localStorage
 */
function getStoredTimezone(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TIMEZONE_STORAGE_KEY);
}

/**
 * Get the current user timezone
 */
export function getUserTimezone(): string {
    return currentTimezone;
}

/**
 * Set the user's timezone preference
 * @param timezone - IANA timezone identifier (e.g., 'America/New_York')
 */
export function setUserTimezone(timezone: string): void {
    // Validate the timezone by trying to use it
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: timezone });
        currentTimezone = timezone;
        if (typeof window !== 'undefined') {
            localStorage.setItem(TIMEZONE_STORAGE_KEY, timezone);
        }
    } catch {
        console.error(`Invalid timezone: ${timezone}`);
    }
}

/**
 * Reset to browser's default timezone (falls back to Eastern if detection fails)
 */
export function resetToSystemTimezone(): void {
    currentTimezone = getBrowserTimezone();
    if (typeof window !== 'undefined') {
        localStorage.removeItem(TIMEZONE_STORAGE_KEY);
    }
}

/**
 * Get the local date string (YYYY-MM-DD) for a UTC date/time in the user's timezone.
 * 
 * This is the key function for fixing the calendar event grouping bug.
 * 
 * @param utcDate - Date object or ISO string in UTC
 * @returns Local date string in YYYY-MM-DD format
 * 
 * @example
 * // Event at 2026-01-09T00:30:00Z (UTC)
 * // In Eastern time (UTC-5), this is 2026-01-08 at 7:30 PM
 * getLocalDateString('2026-01-09T00:30:00Z') // Returns '2026-01-08'
 */
export function getLocalDateString(utcDate: Date | string): string {
    const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;

    // Use Intl.DateTimeFormat to get the date parts in the user's timezone
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: currentTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    // en-CA locale uses YYYY-MM-DD format
    return formatter.format(date);
}

/**
 * Get a Date object representing the start of day in the user's timezone.
 * 
 * @param dateStr - Date string in YYYY-MM-DD format (represents a day in local time)
 * @returns Date object set to midnight local time
 */
export function getStartOfLocalDay(dateStr: string): Date {
    // Parse the date parts
    const [year, month, day] = dateStr.split('-').map(Number);

    // Create a date string that will be interpreted in the user's timezone
    const localDateStr = new Date(year, month - 1, day, 0, 0, 0, 0);

    return localDateStr;
}

/**
 * Get a Date object representing the end of day in the user's timezone.
 * 
 * @param dateStr - Date string in YYYY-MM-DD format (represents a day in local time)
 * @returns Date object set to 23:59:59.999 local time
 */
export function getEndOfLocalDay(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, 23, 59, 59, 999);
}

/**
 * Format a UTC time for display in the user's timezone.
 * 
 * @param utcDate - Date object or ISO string in UTC
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted time string
 */
export function formatLocalTime(
    utcDate: Date | string,
    options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' }
): string {
    const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
    return new Intl.DateTimeFormat('en-US', {
        ...options,
        timeZone: currentTimezone,
    }).format(date);
}

/**
 * Format a UTC date for display in the user's timezone.
 * 
 * @param utcDate - Date object or ISO string in UTC
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatLocalDate(
    utcDate: Date | string,
    options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
): string {
    const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
    return new Intl.DateTimeFormat('en-US', {
        ...options,
        timeZone: currentTimezone,
    }).format(date);
}

/**
 * Check if a UTC datetime falls on a specific local date.
 * 
 * @param utcDate - Date object or ISO string in UTC
 * @param localDateStr - Date string in YYYY-MM-DD format (local date to check against)
 * @returns true if the UTC datetime falls on the given local date
 */
export function isOnLocalDate(utcDate: Date | string, localDateStr: string): boolean {
    return getLocalDateString(utcDate) === localDateStr;
}

/**
 * Get common timezone options for a future timezone picker UI
 */
export const COMMON_TIMEZONES = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
] as const;

/**
 * Get the timezone offset in hours for display purposes
 * 
 * @returns String like "UTC-5" or "UTC+1"
 */
export function getTimezoneOffsetLabel(): string {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: currentTimezone,
        timeZoneName: 'shortOffset',
    });

    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find(p => p.type === 'timeZoneName');
    return offsetPart?.value || currentTimezone;
}
