import { useEffect, useRef, useState, useMemo } from 'react';
import { useHabitData } from './hooks/useHabitData';
import { useHabitCalendar } from './hooks/useHabitCalendar';
import { useHabitStats } from './hooks/useHabitStats';
import { useVlogRecorder } from './hooks/useVlogRecorder';
import { useHabitInteractions } from './hooks/useHabitInteractions';
import { useEntryComment } from '../../hooks/useEntryComment';
import { useHabitDeadlineToast } from '../../hooks/useHabitDeadlineToast';
import VlogModal from './components/VlogModal';
import { HabitDeadlineToast } from './components/HabitDeadlineToast';
import { CommentPanel } from './components/CommentPanel';
import { ReorderOverlay } from './components/ReorderOverlay';
import { HabitTrackerHeader } from './components/HabitTrackerHeader';
import { HabitRow } from './components/HabitRow';
import { HabitTooltips } from './components/HabitTooltips';
import styles from './HabitTracker.module.css';

import { HABIT_TRACKER_CONFIG } from './components/constants';
import { CRITICAL_FILTER, UNFINISHED_FILTER } from './components/TimeFilterButtons';

export function HabitTracker() {
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const theadRef = useRef<HTMLTableSectionElement>(null);
  const { toasts: deadlineToasts, showDeadlineToast, dismissToast: dismissDeadlineToast } = useHabitDeadlineToast();

  const {
    habits,
    setHabits,
    entries,
    handleEntriesChange,
    getEntry,
    loadData,
    isLoading: isDataLoading,
    cycleState
  } = useHabitData({
    startDate: HABIT_TRACKER_CONFIG.startDate,
    onDeadlineToast: showDeadlineToast
  });

  const {
    weeks,
    expandedWeeks,
    toggleWeek,
    startDate: activeStartDate
  } = useHabitCalendar({
    habits,
    defaultStartDate: HABIT_TRACKER_CONFIG.startDate,
    tableWrapperRef
  });

  const {
    getHabitStats,
    getDayStats,
    chartData,
    getCurrentStreak,
    getFailedStreak
  } = useHabitStats({
    habits,
    entries,
    weeks,
    startDate: activeStartDate
  });

  const {
    vlogs,
    viewingVlog,
    setViewingVlog,
    loomSupported,
    handleVlogClick,
    loadVlogs
  } = useVlogRecorder({
    startDate: activeStartDate
  });

  const {
    reorderingHabit,
    reorderPosition,
    hoveredHabitId,
    tooltipPosition,
    deadlineTooltip,
    handleReorderStart,
    handleReorderSelect,
    handleReorderClose,
    handleHabitNameMouseEnter,
    handleHabitNameMouseLeave,
    handleDeadlineMouseEnter,
    handleDeadlineMouseLeave
  } = useHabitInteractions(setHabits);

  const { getCellHandlers, commentPanel, cellTooltip, wasLongPress, Ring } = useEntryComment({
    entries,
    habits,
    onEntriesChange: handleEntriesChange
  });


  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string | null>(null);
  const [dynamicRowHeight, setDynamicRowHeight] = useState<number | null>(null);


  useEffect(() => {
    loadData();
  }, [loadData]);


  const dates = useMemo(() => {

    return weeks.flatMap(w => w.days);
  }, [weeks]);

  useEffect(() => {
    if (dates.length > 0) {
      loadVlogs(dates);
    }
  }, [weeks, loadVlogs]); // Trigger when weeks structure changes


  const filteredHabits = useMemo(() => {
    if (!selectedTimeFilter) return habits;
    if (selectedTimeFilter === CRITICAL_FILTER) {
      return habits.filter(habit => getFailedStreak(habit.id) > 2);
    }
    if (selectedTimeFilter === UNFINISHED_FILTER) {
      const today = new Date();
      return habits.filter(habit => {
        const entry = getEntry(today, habit.id);
        return !entry || entry.state === 0;
      });
    }
    return habits.filter(habit => habit.defaultTime === selectedTimeFilter);
  }, [habits, selectedTimeFilter, getFailedStreak, getEntry]);

  useEffect(() => {
    if (!selectedTimeFilter) {
      setDynamicRowHeight(null);
      return;
    }

    // Flag to prevent stale callbacks from running after cleanup
    let isActive = true;

    const calculateRowHeight = () => {
      // Don't run if effect has been cleaned up
      if (!isActive) {
        return;
      }
      if (!tableWrapperRef.current || !theadRef.current || filteredHabits.length === 0) {
        return;
      }

      const wrapperHeight = tableWrapperRef.current.clientHeight;
      const theadHeight = theadRef.current.clientHeight;
      const availableHeight = wrapperHeight - theadHeight;

      const calculatedHeight = Math.floor(availableHeight / filteredHabits.length);
      const boundedHeight = Math.max(48, calculatedHeight);

      setDynamicRowHeight(boundedHeight);
    };

    const rafId = requestAnimationFrame(() => {
      calculateRowHeight();
    });

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(calculateRowHeight);
    });

    if (tableWrapperRef.current) {
      resizeObserver.observe(tableWrapperRef.current);
    }

    return () => {
      isActive = false; // Prevent any pending callbacks from running
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [selectedTimeFilter, filteredHabits.length]);


  if (isDataLoading || habits.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        {/* <p>Loading habits data...</p> */}
      </div>
    );
  }

  return (
    <>
      <div className={styles.tableWrapper} ref={tableWrapperRef}>
        <table className={styles.habitTable}>
          <HabitTrackerHeader
            ref={theadRef}
            weeks={weeks}
            expandedWeeks={expandedWeeks}
            vlogs={vlogs}
            loomSupported={loomSupported}
            selectedTimeFilter={selectedTimeFilter}
            onFilterChange={setSelectedTimeFilter}
            chartData={chartData}
            habits={habits}
            onToggleWeek={toggleWeek}
            onVlogClick={handleVlogClick}
            getDayStats={getDayStats}
          />
          <tbody id="table-body">
            {filteredHabits
              .sort((a, b) => a.order - b.order)
              .map(habit => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  weeks={weeks}
                  expandedWeeks={expandedWeeks}
                  getEntry={getEntry}
                  cycleState={cycleState}
                  getHabitStats={getHabitStats}
                  getCurrentStreak={getCurrentStreak}
                  getFailedStreak={getFailedStreak}
                  onToggleWeek={toggleWeek}
                  getCellHandlers={getCellHandlers}
                  wasLongPress={wasLongPress}
                  onHabitNameMouseEnter={handleHabitNameMouseEnter}
                  onHabitNameMouseLeave={handleHabitNameMouseLeave}
                  onReorderStart={handleReorderStart}
                  onDeadlineMouseEnter={handleDeadlineMouseEnter}
                  onDeadlineMouseLeave={handleDeadlineMouseLeave}
                  dynamicRowHeight={dynamicRowHeight}
                />
              ))}
          </tbody>
        </table>
      </div>

      {viewingVlog && (
        <VlogModal
          vlog={viewingVlog}
          onClose={() => setViewingVlog(null)}
        />
      )}

      <HabitTooltips
        hoveredHabitId={hoveredHabitId}
        tooltipPosition={tooltipPosition}
        cellTooltip={cellTooltip}
        deadlineTooltip={deadlineTooltip}
        habits={habits}
      />


      {commentPanel && <CommentPanel {...commentPanel} />}
      <Ring />


      {reorderingHabit && reorderPosition && (
        <ReorderOverlay
          habits={habits}
          movingHabit={reorderingHabit}
          position={reorderPosition}
          onSelect={handleReorderSelect}
          onClose={handleReorderClose}
        />
      )}


      <HabitDeadlineToast toasts={deadlineToasts} onDismiss={dismissDeadlineToast} />
    </>
  );
}
