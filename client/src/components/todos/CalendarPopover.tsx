/**
 * CalendarPopover Component
 * 
 * A hover-triggered popover that displays calendar information for a specific date.
 * Currently a placeholder for future Google Calendar integration.
 * 
 * Usage:
 * <CalendarPopover date={new Date()} />
 */

import { useState, useRef, useEffect } from 'react';
import { CalendarBlank, GoogleLogo } from '@phosphor-icons/react';
import styles from './CalendarPopover.module.css';

interface CalendarPopoverProps {
    date: Date;
}

export function CalendarPopover({ date }: CalendarPopoverProps) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        // Small delay before closing to allow moving to the popover
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 150);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div
            ref={wrapperRef}
            className={styles.calendarPopoverWrapper}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                type="button"
                className={styles.calendarBtn}
                aria-label="View calendar events"
                aria-expanded={isOpen}
            >
                <CalendarBlank size={18} weight="duotone" />
            </button>

            {isOpen && (
                <div className={styles.popoverPanel}>
                    <div className={styles.popoverHeader}>
                        <span className={styles.popoverTitle}>
                            <GoogleLogo size={16} weight="bold" className={styles.popoverTitleIcon} />
                            Calendar
                        </span>
                    </div>
                    <div className={styles.popoverContent}>
                        <div className={styles.placeholderContent}>
                            <CalendarBlank size={40} weight="duotone" className={styles.placeholderIcon} />
                            <p className={styles.placeholderText}>
                                Google Calendar events for {formattedDate} will appear here.
                            </p>
                            <span className={styles.placeholderHint}>
                                Coming soon...
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
