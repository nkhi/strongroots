import React from 'react';
import { DateUtility } from '../../utils';
import { CaretLeft, CaretRight, StrategyIcon, Ghost, Circle } from '@phosphor-icons/react';
import type { DayWeekColumnData } from '../shared/DayWeek';
import styles from './WeekView.module.css';
import dayWeekStyles from '../shared/DayWeek.module.css';

interface WeekViewProps {
    renderColumn: (data: DayWeekColumnData) => React.ReactNode;
    weekDates: Date[];
    onPrevWeek: () => void;
    onNextWeek: () => void;
    onCurrentWeek: () => void;
    onClose: () => void;
    onGraveyardClick?: () => void;
    isGraveyardOpen?: boolean;
}

export function WeekView({
    renderColumn,
    weekDates,
    onPrevWeek,
    onNextWeek,
    onCurrentWeek,
    onClose,
    onGraveyardClick,
    isGraveyardOpen
}: WeekViewProps) {

    return (
        <div className={styles.weekViewContainer}>
            <div className={styles.weekColumns}>
                {weekDates.map(date => {
                    const dateStr = DateUtility.formatDate(date);
                    const isToday = DateUtility.isToday(date);
                    return (
                        <div key={dateStr} className={`${styles.weekColumn} ${isToday ? 'today' : ''}`}>
                            {renderColumn({ date, dateStr, isToday, isFocused: false })}
                        </div>
                    );
                })}
            </div>

            {/* Navigation Controls (Floating Bottom Left) */}

            {/* 1. Week Toggle (Acts as Back/Close) - Bottom most */}
            <button
                className={`${dayWeekStyles.zoomFloatingBtn} ${styles.weekActiveBtn}`}
                onClick={onClose}
                title="Back to Day View"
            >
                <StrategyIcon weight="fill" size={20} />
                <span>Week</span>
            </button>

            {/* 2. Graveyard Toggle */}
            {onGraveyardClick && (
                <button
                    className={`${dayWeekStyles.graveyardFloatingBtn} ${isGraveyardOpen ? dayWeekStyles.active : ''}`}
                    onClick={onGraveyardClick}
                    title="Task Graveyard"
                >
                    <Ghost weight="duotone" size={20} />
                    <span>Grave</span>
                </button>
            )}

            {/* 3. Week Navigation Pill - Positioned where "Today" usually is */}
            <div className={styles.weekNavPill}>
                <button
                    className={styles.navArrowBtn}
                    onClick={onPrevWeek}
                    title="Previous Week"
                >
                    <CaretLeft size={16} weight="bold" />
                </button>

                <button
                    className={styles.navLabelBtn}
                    onClick={onCurrentWeek}
                    title="Go to Current Week"
                >
                    <Circle weight="fill" size={8} className={styles.navDotIcon} />
                </button>

                <button
                    className={styles.navArrowBtn}
                    onClick={onNextWeek}
                    title="Next Week"
                >
                    <CaretRight size={16} weight="bold" />
                </button>
            </div>
        </div>
    );
}
