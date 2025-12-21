import React from 'react';
import { DateUtility } from '../../utils';
import { CaretLeft, CaretRight, StrategyIcon, Ghost, Circle, Briefcase, LadderIcon } from '@phosphor-icons/react';
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
    weekCategory?: 'life' | 'work';
    onCategoryChange?: (category: 'life' | 'work') => void;
}

export function WeekView({
    renderColumn,
    weekDates,
    onPrevWeek,
    onNextWeek,
    onCurrentWeek,
    onClose,
    onGraveyardClick,
    isGraveyardOpen,
    customGridTemplate,
    weekCategory,
    onCategoryChange
}: WeekViewProps & { customGridTemplate?: string }) {

    return (
        <div className={styles.weekViewContainer}>
            <div
                className={styles.weekColumns}
                style={customGridTemplate ? { gridTemplateColumns: customGridTemplate } : undefined}
            >
                {weekDates.map((date, index) => {
                    const dateStr = DateUtility.formatDate(date);
                    const isToday = DateUtility.isToday(date);
                    return (
                        <div key={dateStr} className={`${styles.weekColumn} ${isToday ? 'today' : ''}`}>
                            {renderColumn({
                                date,
                                dateStr,
                                isToday,
                                isFocused: false,
                                isShrunk: customGridTemplate ? customGridTemplate.split(' ')[index] === '0.4fr' : false
                            })}
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


            {/* 3. Category Toggle - Right of Week Button */}
            {onCategoryChange && weekCategory && (
                <button
                    className={`${styles.modeToggleBtn} ${weekCategory === 'work' ? styles.workActive : styles.lifeActive}`}
                    onClick={() => onCategoryChange(weekCategory === 'life' ? 'work' : 'life')}
                    title={`Switch to ${weekCategory === 'life' ? 'Work' : 'Life'} Mode`}
                >
                    {weekCategory === 'life' ? (
                        <LadderIcon weight="duotone" size={20} />
                    ) : (
                        <Briefcase weight="fill" size={20} />
                    )}
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
