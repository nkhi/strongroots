import React from 'react';
import { HeartIcon } from '@phosphor-icons/react';
import type { Habit } from '../../types';
import { HabitTimeIcon, HABIT_TIME_CONFIG } from './habitTimeConfig';
import styles from './HabitNameCell.module.css';

interface HabitNameCellProps {
    habit: Habit;
    streak: number;
    onMouseEnter: (e: React.MouseEvent, habitId: string, comment?: string | null) => void;
    onMouseLeave: () => void;
}

export function HabitNameCell({ habit, streak, onMouseEnter, onMouseLeave }: HabitNameCellProps) {
    // Parsing Logic
    // Allowed if defaultTime is 'routine' OR id is in range 32-38
    const isRoutine = habit.defaultTime === 'routine';
    const idNum = parseInt(habit.id, 10);
    const isIdInRange = !isNaN(idNum) && idNum >= 32 && idNum <= 38;
    const isParsingAllowed = isRoutine || isIdInRange;

    let displayName = habit.name;
    let timeBadge: string | null = null;

    if (isParsingAllowed) {
        // Check for "Name [Time]"
        let timeMatch = habit.name.match(/^(.*?)\[(.*?)\]$/);
        if (timeMatch) {
            displayName = timeMatch[1].trim();
            timeBadge = timeMatch[2].trim();
        } else {
            // Check for "[Time] Name"
            timeMatch = habit.name.match(/^\[(.*?)\]\s*(.*)$/);
            if (timeMatch) {
                timeBadge = timeMatch[1].trim();
                displayName = timeMatch[2].trim();
            }
        }
    }

    // Determine Badge Color based on config
    // logic: use config color for badge border/text if available
    const timeConfig = HABIT_TIME_CONFIG[habit.defaultTime];
    const badgeStyle = timeBadge && timeConfig ? {
        borderColor: timeConfig.color === 'transparent' ? undefined : timeConfig.color,
        color: timeConfig.color === 'transparent' ? undefined : timeConfig.color,
        background: timeConfig.color === 'transparent' ? undefined : `${timeConfig.color}20` // 20 hex = ~12% opacity
    } : undefined;


    // Render Logic
    const renderIconArea = () => {
        if (isRoutine && timeBadge) {
            return (
                <span className={`${styles.timeBadge} ${styles.routineBadge}`} style={badgeStyle}>
                    {timeBadge}
                </span>
            );
        }

        return (
            <span className={styles.timeIcon} style={{ color: timeConfig?.color || '#9ca3af' }}>
                <HabitTimeIcon defaultTime={habit.defaultTime} size={20} />
            </span>
        );
    };

    return (
        <div className={styles.habitName}>
            {renderIconArea()}

            <div className={styles.habitNameText}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span
                        className={habit.comment ? styles.habitNameWithComment : undefined}
                        onMouseEnter={(e) => onMouseEnter(e, habit.id, habit.comment)}
                        onMouseLeave={onMouseLeave}
                    >
                        {displayName}
                    </span>

                    {/* If not a special routine replacement, show badge here if it exists */}
                    {!(isRoutine && timeBadge) && timeBadge && (
                        <span className={styles.timeBadge} style={badgeStyle}>
                            {timeBadge}
                        </span>
                    )}
                </div>

                {streak > 0 && (
                    <span className={styles.streakBadge}>
                        <span className={styles.streakIcon}>
                            <HeartIcon size={12} weight="fill" />
                        </span>
                        <span>{streak}</span>
                    </span>
                )}
            </div>
        </div>
    );
}
