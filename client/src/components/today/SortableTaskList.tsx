/**
 * SortableTaskList Component
 * 
 * A reusable component that renders a sortable list of tasks.
 * Integrates with @dnd-kit's SortableContext for drag-and-drop.
 * 
 * ## Features:
 * - Automatic sorting by fractional order
 * - Droppable container with visual feedback
 * - Keyboard accessible
 * - Clean separation from business logic
 * 
 * ## Usage:
 * ```tsx
 * <SortableTaskList
 *   containerId={createContainerId(dateStr, category, state)}
 *   tasks={tasks}
 *   renderTask={(task) => <TaskItem task={task} />}
 *   isDropTarget={isDropTarget}
 * />
 * ```
 */

import React, { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task } from '../../types';
import { sortByOrder } from '../../utils/orderUtils';
import styles from './Todos.module.css';

// ============================================
// Types
// ============================================

export interface SortableTaskListProps {
    /** Unique container ID (format: "date_category_state") */
    containerId: string;

    /** Tasks to render in this list */
    tasks: Task[];

    /** Render function for each task */
    renderTask: (task: Task) => React.ReactNode;

    /** Whether this list is currently a drop target */
    isDropTarget?: boolean;

    /** Optional class name for the list container */
    className?: string;

    /** Optional empty state content */
    emptyContent?: React.ReactNode;
}

// ============================================
// Component
// ============================================

export function SortableTaskList({
    containerId,
    tasks,
    renderTask,
    isDropTarget = false,
    className,
    emptyContent,
}: SortableTaskListProps) {
    // Sort tasks by order
    const sortedTasks = useMemo(() => sortByOrder(tasks), [tasks]);

    // Get task IDs for SortableContext
    const taskIds = useMemo(
        () => sortedTasks.map(t => t.id),
        [sortedTasks]
    );

    // Make this container droppable
    const { setNodeRef, isOver } = useDroppable({
        id: containerId,
    });

    // Combine active states
    const showDropIndicator = isDropTarget || isOver;

    return (
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            <div
                ref={setNodeRef}
                className={`
          ${styles.sortableTaskList}
          ${showDropIndicator ? styles.dropTarget : ''}
          ${className || ''}
        `.trim()}
                data-droppable={containerId}
            >
                {sortedTasks.length > 0 ? (
                    sortedTasks.map(task => renderTask(task))
                ) : (
                    emptyContent
                )}
            </div>
        </SortableContext>
    );
}
