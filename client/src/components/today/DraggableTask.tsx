/**
 * DraggableTask Component
 * 
 * A wrapper component that makes a task item draggable using @dnd-kit.
 * This is the ONLY component used for making tasks draggable.
 * 
 * ## Features:
 * - Sortable with proper transform handling
 * - Visual feedback during drag
 * - Touch-friendly with proper touch-action
 * - Optional disabled state
 * 
 * ## Usage:
 * ```tsx
 * <DraggableTask task={task}>
 *   <TaskItemContent task={task} />
 * </DraggableTask>
 * ```
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types';
import styles from './Todos.module.css';

// ============================================
// Types
// ============================================

export interface DraggableTaskProps {
    /** The task data */
    task: Task;

    /** Content to render inside the draggable wrapper */
    children: React.ReactNode;

    /** Whether dragging is disabled for this task */
    disabled?: boolean;
}

// ============================================
// Component
// ============================================

export function DraggableTask({ task, children, disabled = false }: DraggableTaskProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isSorting,
    } = useSortable({
        id: task.id,
        data: {
            type: 'task',
            task,
        },
        disabled,
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: disabled ? 'default' : isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        zIndex: isDragging ? 1000 : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
        ${styles.draggableTask}
        ${isDragging ? styles.dragging : ''}
        ${isSorting ? styles.sorting : ''}
      `.trim()}
            {...attributes}
            {...listeners}
        >
            {children}
        </div>
    );
}

// ============================================
// Drag Overlay Component
// ============================================

export interface TaskDragOverlayProps {
    /** The task being dragged */
    task: Task;

    /** Render function to display the task content */
    children: React.ReactNode;
}

/**
 * TaskDragOverlay Component
 * 
 * Renders the floating overlay shown while dragging a task.
 * Should be used inside DndContext's <DragOverlay> component.
 */
export function TaskDragOverlay({ children }: TaskDragOverlayProps) {
    return (
        <div className={styles.taskDragOverlay}>
            {children}
        </div>
    );
}
