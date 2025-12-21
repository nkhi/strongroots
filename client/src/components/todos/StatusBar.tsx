/**
 * StatusBar Component
 * 
 * Visual task completion indicator showing colored segments.
 * Displays proportional segments for each task state.
 * 
 * ## Segments (left to right):
 * - Active (white): tasks not yet started
 * - Completed (green): successfully completed tasks
 * - Punted (yellow): tasks moved to a later date
 * - Failed (red): cancelled or failed tasks
 * 
 * ## Usage:
 * ```tsx
 * <StatusBar active={3} punted={1} completed={5} failed={0} />
 * ```
 */

import styles from './Todos.module.css';

interface StatusBarProps {
    active: number;
    punted: number;
    completed: number;
    failed: number;
}

export function StatusBar({ active, punted, completed, failed }: StatusBarProps) {
    const total = active + punted + completed + failed;
    if (total === 0) return null;

    const getPct = (val: number) => (val / total) * 100;

    return (
        <div className={styles.statusBar}>
            <div
                className={styles.statusSegment}
                style={{ width: `${getPct(active)}%`, backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
            />
            <div
                className={styles.statusSegment}
                style={{ width: `${getPct(completed)}%`, backgroundColor: 'rgba(52, 211, 153, 0.8)' }}
            />
            <div
                className={styles.statusSegment}
                style={{ width: `${getPct(punted)}%`, backgroundColor: 'rgba(251, 191, 36, 0.8)' }}
            />
            <div
                className={styles.statusSegment}
                style={{ width: `${getPct(failed)}%`, backgroundColor: 'rgba(255, 59, 48, 0.8)' }}
            />
        </div>
    );
}
