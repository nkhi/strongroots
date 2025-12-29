import { useEffect, useRef, useState } from 'react';
import type { Habit } from '../../../types';
import { HabitTimeIcon } from './habitTimeConfig';
import styles from './ReorderOverlay.module.css';

interface ReorderOverlayProps {
    habits: Habit[];
    movingHabit: Habit;
    position: { x: number; y: number };
    onSelect: (targetHabitId: string | null) => void;
    onClose: () => void;
}

export function ReorderOverlay({ habits, movingHabit, position, onSelect, onClose }: ReorderOverlayProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const [adjustedPosition, setAdjustedPosition] = useState(position);

    // Adjust position to keep panel in viewport
    useEffect(() => {
        if (panelRef.current) {
            const rect = panelRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            let newX = position.x;
            let newY = position.y;

            // Adjust if panel goes below viewport
            if (position.y + rect.height > viewportHeight - 20) {
                newY = viewportHeight - rect.height - 20;
            }

            // Adjust if panel goes above viewport
            if (newY < 20) {
                newY = 20;
            }

            // Adjust if panel goes past right edge
            if (position.x + rect.width > viewportWidth - 20) {
                newX = position.x - rect.width - 16; // Flip to left side
            }

            setAdjustedPosition({ x: newX, y: newY });
        }
    }, [position]);

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        // Delay adding listener to prevent immediate close
        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 0);
        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    // Sort habits by order
    const sortedHabits = [...habits].sort((a, b) => a.order - b.order);

    return (
        <>
            {/* Backdrop just for visual dimming, no blocking */}
            <div className={styles.backdrop} onClick={onClose} />

            <div
                className={styles.panel}
                ref={panelRef}
                style={{
                    left: adjustedPosition.x,
                    top: adjustedPosition.y
                }}
            >
                <div className={styles.header}>
                    <span className={styles.headerText}>
                        Move <span className={styles.habitPill}>{movingHabit.name}</span> before:
                    </span>
                </div>

                <div className={styles.habitList}>
                    {sortedHabits.map((habit) => {
                        const isMovingHabit = habit.id === movingHabit.id;

                        return (
                            <button
                                key={habit.id}
                                className={`${styles.habitItem} ${isMovingHabit ? styles.movingHabit : ''}`}
                                onClick={() => !isMovingHabit && onSelect(habit.id)}
                                disabled={isMovingHabit}
                            >
                                <span className={styles.orderNumber}>{habit.order}</span>
                                <span className={styles.habitIcon}>
                                    <HabitTimeIcon defaultTime={habit.defaultTime} size={14} />
                                </span>
                                <span className={styles.habitName}>{habit.name}</span>
                                {isMovingHabit && <span className={styles.currentBadge}>this</span>}
                            </button>
                        );
                    })}

                    {/* Option to move to end */}
                    <button
                        className={`${styles.habitItem} ${styles.moveToEnd}`}
                        onClick={() => onSelect(null)}
                    >
                        <span className={styles.orderNumber}>↓</span>
                        <span className={styles.habitName}>Move to end</span>
                    </button>
                </div>
            </div>
        </>
    );
}
