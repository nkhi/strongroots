import { useState, useEffect, useMemo } from 'react';
import { useCalendarEvents } from './useCalendarEvents';

// lol
export function useCarrotInterviews() {
    const [now, setNow] = useState(new Date());

    // Ensure we are always looking at the current date's events
    const date = useMemo(() => new Date(now), [now]);

    const { events, loading, refetch } = useCalendarEvents(date, true);

    const karatEvents = useMemo(() => {
        const interviewRegex = /^Interview: \d{6}/;
        // Filter for today's events that match the pattern
        return events.filter(event => {
            if (!event.start_time || !event.summary) return false;

            const eventDate = new Date(event.start_time);
            const isToday = eventDate.getDate() === now.getDate() &&
                eventDate.getMonth() === now.getMonth() &&
                eventDate.getFullYear() === now.getFullYear();

            return isToday && interviewRegex.test(event.summary);
        });
    }, [events, now]);

    const remainingCount = useMemo(() => {
        return karatEvents.filter(event => new Date(event.end_time) > now).length;
    }, [karatEvents, now]);

    // Schedule updates for when interviews end
    useEffect(() => {
        // Find the next event end time that is in the future
        const nextEndTime = karatEvents
            .map(e => new Date(e.end_time).getTime())
            .filter(t => t > now.getTime())
            .sort((a, b) => a - b)[0];

        // Also schedule an update for midnight (day rollover)
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const msUntilMidnight = tomorrow.getTime() - now.getTime();

        const timers: NodeJS.Timeout[] = [];

        // Timer for next interview end
        if (nextEndTime) {
            const msUntilEnd = nextEndTime - now.getTime();
            // Add a small buffer (1s) to ensure we're past the end time
            if (msUntilEnd > 0) {
                const timer = setTimeout(() => {
                    setNow(new Date());
                }, msUntilEnd + 1000);
                timers.push(timer);
            }
        }

        // Timer for midnight
        if (msUntilMidnight > 0) {
            const midnightTimer = setTimeout(() => {
                setNow(new Date());
            }, msUntilMidnight + 1000);
            timers.push(midnightTimer);
        }

        return () => {
            timers.forEach(t => clearTimeout(t));
        };
    }, [karatEvents, now]);

    return {
        remainingCount,
        loading,
        refetch
    };
}
