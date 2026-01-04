
import type { Habit } from '../../../types';
import styles from '../HabitTracker.module.css';
import { GRADE_COLORS, DEFAULT_SPARKLINE_COLOR, SPARKLINE_CONFIG } from './constants';

interface WeekSparklineProps {
    habit: Habit;
    week: { key: string; start: Date; end: Date };
    prevWeek?: { key: string; start: Date; end: Date };
    nextWeek?: { key: string; start: Date; end: Date };
    expandedWeeks: Set<string>;
    getHabitStats: (habitId: string, start: Date, end: Date) => any;
    onToggleWeek: (key: string) => void;
}

export function WeekSparkline({
    habit,
    week,
    prevWeek,
    nextWeek,
    expandedWeeks,
    getHabitStats,
    onToggleWeek
}: WeekSparklineProps) {
    const weekStart = new Date(week.key + 'T00:00:00');
    const stats = getHabitStats(habit.id, weekStart, week.end);

    const currentColor = GRADE_COLORS[stats.grade.class] || DEFAULT_SPARKLINE_COLOR;

    const isNextExpanded = nextWeek ? expandedWeeks.has(nextWeek.key) : true;
    const isPrevExpanded = prevWeek ? expandedWeeks.has(prevWeek.key) : true;

    // 1px in CSS = ~1.56 SVG units. Bottom center: 99.22.
    const getY = (p: number) => SPARKLINE_CONFIG.bottomCenter - (p * SPARKLINE_CONFIG.scaleY);
    const yCurr = getY(stats.percentage);

    let strokeElements: JSX.Element[] = [];
    let fillElements: JSX.Element[] = [];
    const maskId = `mask-fade-${habit.id}-${week.key}`;

    strokeElements.push(
        <defs key="defs-mask">
            <linearGradient id={`grad-mask-${habit.id}-${week.key}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="white" stopOpacity="0.5" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <mask id={maskId}>
                <rect x="-100" y="0" width="300" height="100" fill={`url(#grad-mask-${habit.id}-${week.key})`} />
            </mask>
        </defs>
    );

    // Since weeks are reversed: prevWeek is newer (left), nextWeek is older (right)
    // Connect to the right (nextWeek = older week)
    if (nextWeek && !isNextExpanded) {
        const nextWeekStart = new Date(nextWeek.key + 'T00:00:00');
        const nextStats = getHabitStats(habit.id, nextWeekStart, nextWeek.end);
        const nextColor = GRADE_COLORS[nextStats.grade.class] || '#4b5563';
        const yNext = getY(nextStats.percentage);

        const pathD = `M 50 ${yCurr} C 100 ${yCurr}, 100 ${yNext}, 150 ${yNext}`;
        const fillD = `${pathD} V 100 H 50 Z`;
        const gradId = `grad-${habit.id}-${week.key}-conn`;

        strokeElements.push(
            <defs key="defs-conn">
                <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1="50" y1="0" x2="150" y2="0">
                    <stop offset="0%" stopColor={currentColor} />
                    <stop offset="100%" stopColor={nextColor} />
                </linearGradient>
            </defs>
        );

        fillElements.push(
            <path key="conn-fill" d={fillD} fill={`url(#${gradId})`} mask={`url(#${maskId})`} style={{ pointerEvents: 'none' }} />
        );
        strokeElements.push(
            <path key="conn-stroke" d={pathD} className={styles.sparklinePath} style={{ stroke: `url(#${gradId})`, strokeWidth: 1.5625, opacity: 0.55 }} />
        );
    } else {
        const pathD = `M 50 ${yCurr} L 100 ${yCurr}`;
        const fillD = `${pathD} V 100 H 50 Z`;

        fillElements.push(
            <path key="end-fill" d={fillD} fill={currentColor} mask={`url(#${maskId})`} style={{ pointerEvents: 'none' }} />
        );
        strokeElements.push(
            <path key="end-stroke" d={pathD} className={styles.sparklinePath} style={{ stroke: currentColor, strokeWidth: 1.5625, opacity: 0.55 }} />
        );
    }

    // Connect to the left (prevWeek = newer week)
    if (!prevWeek || isPrevExpanded) {
        const pathD = `M 0 ${yCurr} L 50 ${yCurr}`;
        const fillD = `${pathD} V 100 H 0 Z`;

        fillElements.push(
            <path key="start-fill" d={fillD} fill={currentColor} mask={`url(#${maskId})`} style={{ pointerEvents: 'none' }} />
        );
        strokeElements.push(
            <path key="start-stroke" d={pathD} className={styles.sparklinePath} style={{ stroke: currentColor, strokeWidth: 1.5625, opacity: 0.55 }} />
        );
    }

    return (
        <td
            key={week.key}
            onClick={() => onToggleWeek(week.key)}
            style={{ cursor: 'pointer' }}
            className={styles.weekSummaryCell}
        >
            <svg className={styles.sparklineSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
                {fillElements}
                {strokeElements}
            </svg>
            <div className={`${styles.scoreContent} ${styles.hasTooltip}`} data-tooltip={`${stats.grade.letter} (${Math.round(stats.percentage)}%)`}>
                <span className={`${styles.scoreGrade} ${styles[stats.grade.class]}`}>
                    {stats.successCount}/{stats.totalCount}
                </span>
            </div>
        </td>
    );
}
