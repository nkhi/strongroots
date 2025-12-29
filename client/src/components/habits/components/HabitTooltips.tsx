import styles from '../HabitTracker.module.css';
import type { Habit } from '../../../types';

interface HabitTooltipsProps {
    hoveredHabitId: string | null;
    tooltipPosition: { x: number; y: number } | null;
    habits: Habit[];
    cellTooltip: { x: number; y: number; comment: string } | null;
    deadlineTooltip: { x: number; y: number; time: string } | null;
}

export function HabitTooltips({
    hoveredHabitId,
    tooltipPosition,
    habits,
    cellTooltip,
    deadlineTooltip
}: HabitTooltipsProps) {
    return (
        <>
            {/* Habit Name Comment Tooltip */}
            {hoveredHabitId && tooltipPosition && (
                <div
                    className={styles.habitCommentTooltip}
                    style={{
                        left: tooltipPosition.x,
                        top: tooltipPosition.y
                    }}
                >
                    {habits.find(h => h.id === hoveredHabitId)?.comment}
                </div>
            )}

            {/* Cell Comment Tooltip */}
            {cellTooltip && (
                <div
                    className={styles.cellCommentTooltip}
                    style={{
                        left: cellTooltip.x,
                        top: cellTooltip.y
                    }}
                >
                    {cellTooltip.comment}
                </div>
            )}

            {/* Deadline Tooltip */}
            {deadlineTooltip && (
                <div
                    className={styles.deadlineTooltip}
                    style={{
                        left: deadlineTooltip.x,
                        top: deadlineTooltip.y
                    }}
                >
                    {deadlineTooltip.time}
                </div>
            )}
        </>
    );
}
