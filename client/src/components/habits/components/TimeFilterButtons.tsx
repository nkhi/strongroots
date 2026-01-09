import { WarningIcon } from '@phosphor-icons/react';
import { HABIT_TIME_CONFIG, FILTER_TIME_TYPES, type HabitDefaultTime } from './constants';
import styles from '../HabitTracker.module.css';
import { useState } from 'react';
import ChartModal from './ChartModal';
import { useHoldProgress } from '../../../hooks/useHoldProgress';
import { HOLD_DURATIONS } from '../../../constants/holdDurations';

export const CRITICAL_FILTER = 'critical';

interface TimeFilterButtonsProps {
    selectedTimeFilter: string | null;
    onFilterChange: (filter: string | null) => void;
    chartData: any;
    habits: any;
}

interface FilterButtonProps {
    isActive: boolean;
    color: string;
    title: string;
    onClick: () => void;
    children: React.ReactNode;
}

function FilterButton({ isActive, color, title, onClick, children }: FilterButtonProps) {
    const { holdProps, Ring } = useHoldProgress({
        duration: HOLD_DURATIONS.TIME_FILTER,
        trigger: 'hover',
        color,
        onComplete: onClick,
    });

    return (
        <>
            <button
                className={`${styles.timeFilterBtn} ${isActive ? styles.active : ''}`}
                title={title}
                data-color={color}
                {...holdProps}
            >
                {children}
            </button>
            <Ring />
        </>
    );
}

export function TimeFilterButtons({ selectedTimeFilter, onFilterChange, chartData, habits }: TimeFilterButtonsProps) {
    const [showChart, setShowChart] = useState(false);

    const handleFilterClick = (timeType: HabitDefaultTime) => {
        onFilterChange(selectedTimeFilter === timeType ? null : timeType);
    };

    const handleCriticalClick = () => {
        onFilterChange(selectedTimeFilter === CRITICAL_FILTER ? null : CRITICAL_FILTER);
    };

    return (
        <>
            <div className={styles.timeFilterButtons}>
                {FILTER_TIME_TYPES.map((timeType) => {
                    const config = HABIT_TIME_CONFIG[timeType];
                    const IconComponent = config.icon;
                    const isActive = selectedTimeFilter === timeType;

                    if (!IconComponent) return null;

                    return (
                        <FilterButton
                            key={timeType}
                            isActive={isActive}
                            color={config.color}
                            title={config.label}
                            onClick={() => handleFilterClick(timeType)}
                        >
                            <IconComponent size={18} weight="duotone" />
                        </FilterButton>
                    );
                })}

                {/* Critical Streak Filter - Warning Icon */}
                <FilterButton
                    isActive={selectedTimeFilter === CRITICAL_FILTER}
                    color="#facc15"
                    title="Critical streaks (failed 3+ days)"
                    onClick={handleCriticalClick}
                >
                    <WarningIcon size={18} weight="duotone" />
                </FilterButton>

                {/* Separator */}
                <span className={styles.filterSeparator} />
            </div>


            {showChart && (
                <ChartModal
                    data={chartData}
                    habits={habits}
                    onClose={() => setShowChart(false)}
                />
            )}
        </>
    );
}
