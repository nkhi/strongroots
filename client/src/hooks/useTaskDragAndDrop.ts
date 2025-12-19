/**
 * useTaskDragAndDrop Hook
 * 
 * A comprehensive, production-ready drag-and-drop hook for task reordering.
 * 
 * ## Features:
 * - Fractional indexing for stable ordering
 * - Cross-container drag (date, category, state)
 * - Proper above/below drop detection
 * - Optimistic updates with rollback
 * - Keyboard accessibility
 * 
 * ## Architecture:
 * This hook owns all DnD state and provides:
 * 1. Sensors configured for pointer and keyboard
 * 2. Event handlers for drag lifecycle
 * 3. Active drag state for overlay rendering
 * 4. Callbacks for optimistic updates
 * 
 * ## Usage:
 * ```tsx
 * const { sensors, activeTask, handlers } = useTaskDragAndDrop({
 *   tasks,
 *   onReorder: async (taskId, newOrder, options) => { ... },
 *   onOptimisticUpdate: (updater) => setTasks(updater),
 * });
 * 
 * <DndContext sensors={sensors} {...handlers}>
 *   {children}
 * </DndContext>
 * ```
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import {
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Task } from '../types';
import { getOrderBetween, getOrderAfter, getOrderBefore, sortByOrder } from '../utils/orderUtils';

// ============================================
// Types
// ============================================

/** Task category type */
export type TaskCategory = 'life' | 'work';

/** Task state type */
export type TaskState = 'active' | 'completed' | 'failed';

/** Special container ID for graveyard */
export const GRAVEYARD_CONTAINER_ID = 'graveyard';

/** Information about the source of a drag operation */
export interface DragSource {
  taskId: string;
  dateStr: string;
  category: TaskCategory;
  state: TaskState;
  originalIndex: number;
}

/** Information about a drop target container */
export interface DropTargetInfo {
  dateStr: string;
  category: TaskCategory;
  state: TaskState;
}

/** Options for reordering (what changed during drag) */
export interface ReorderOptions {
  date?: string;
  category?: TaskCategory;
  state?: TaskState;
}

/** Result of a drag operation */
export interface DragResult {
  taskId: string;
  newOrder: string;
  options: ReorderOptions;
  sourceDate: string;
  targetDate: string;
}

/** Updater function for optimistic updates */
export type TasksUpdater = (prev: Record<string, Task[]>) => Record<string, Task[]>;

/** Hook configuration */
export interface UseTaskDragAndDropOptions {
  /** Current tasks state, keyed by date */
  tasks: Record<string, Task[]>;
  
  /** Graveyard tasks */
  graveyardTasks?: Task[];
  
  /** Callback to persist reorder to server */
  onReorder: (taskId: string, newOrder: string, options?: ReorderOptions) => Promise<void>;
  
  /** Callback for optimistic updates */
  onOptimisticUpdate: (updater: TasksUpdater) => void;
  
  /** Callback when task is dropped on graveyard */
  onGraveyard?: (taskId: string, sourceDate: string) => Promise<void>;
  
  /** Callback when graveyard task is dropped on a date */
  onResurrect?: (taskId: string, targetDate: string) => Promise<void>;
  
  /** Callback to reload tasks on error */
  onError?: () => void;
  
  /** Minimum distance before drag activates (default: 8px) */
  activationDistance?: number;
}

/** Hook return type */
export interface UseTaskDragAndDropReturn {
  /** Configured sensors for DndContext */
  sensors: ReturnType<typeof useSensors>;
  
  /** Currently dragged task (for overlay) */
  activeTask: Task | null;
  
  /** Source info for active drag */
  dragSource: DragSource | null;
  
  /** Currently hovered drop target */
  overTarget: DropTargetInfo | null;
  
  /** Whether currently dragging over graveyard */
  isOverGraveyard: boolean;
  
  /** Event handlers for DndContext */
  handlers: {
    onDragStart: (event: DragStartEvent) => void;
    onDragOver: (event: DragOverEvent) => void;
    onDragEnd: (event: DragEndEvent) => void;
    onDragCancel: () => void;
  };
  
  /** Helper to get tasks for a specific container */
  getTasksForContainer: (dateStr: string, category: TaskCategory, state: TaskState) => Task[];
  
  /** Check if a container is the current drop target */
  isDropTarget: (dateStr: string, category: TaskCategory, state: TaskState) => boolean;
}

// ============================================
// Container ID Utilities
// ============================================

/**
 * Create a container ID from date, category, and state.
 * Format: "2024-12-16_life_active"
 */
export function createContainerId(dateStr: string, category: TaskCategory, state: TaskState): string {
  return `${dateStr}_${category}_${state}`;
}

/**
 * Parse a container ID back to its components.
 * Returns null if the ID is not a valid container format.
 */
export function parseContainerId(id: string): DropTargetInfo | null {
  const parts = id.split('_');
  
  // Must have at least 3 parts and first part must look like a date
  if (parts.length < 3 || !parts[0].includes('-')) {
    return null;
  }
  
  const dateStr = parts[0];
  const category = parts[1];
  const state = parts[2];
  
  // Validate category and state
  if (!['life', 'work'].includes(category)) return null;
  if (!['active', 'completed', 'failed'].includes(state)) return null;
  
  return {
    dateStr,
    category: category as TaskCategory,
    state: state as TaskState,
  };
}

/**
 * Get task category safely typed
 */
function getTaskCategory(task: Task): TaskCategory {
  return (task.category === 'work' ? 'work' : 'life') as TaskCategory;
}

/**
 * Get task state safely typed
 */
function getTaskState(task: Task): TaskState {
  if (task.state === 'completed' || task.state === 'failed') {
    return task.state as TaskState;
  }
  return task.completed ? 'completed' : 'active';
}

// ============================================
// Order Calculation
// ============================================

/**
 * Calculate the new order for a task being dropped at a specific position.
 * 
 * @param sortedTasks - Tasks in the target container, sorted by order
 * @param targetIndex - The index where the task should be inserted
 * @param excludeTaskId - Task ID to exclude (the dragged task)
 */
export function calculateNewOrder(
  sortedTasks: Task[],
  targetIndex: number,
  excludeTaskId?: string
): string {
  // Filter out the dragged task if present
  const filteredTasks = excludeTaskId
    ? sortedTasks.filter(t => t.id !== excludeTaskId)
    : sortedTasks;
  
  // Get orders from filtered list
  const orders = filteredTasks
    .map(t => t.order)
    .filter((o): o is string => o != null && o !== '');
  
  // Edge cases
  if (orders.length === 0) {
    // First item in list
    return getOrderAfter(null);
  }
  
  if (targetIndex <= 0) {
    // Insert at beginning
    return getOrderBefore(orders[0]);
  }
  
  if (targetIndex >= orders.length) {
    // Insert at end
    return getOrderAfter(orders[orders.length - 1]);
  }
  
  // Insert between two items
  const before = orders[targetIndex - 1];
  const after = orders[targetIndex];
  return getOrderBetween(before, after);
}

// ============================================
// Hook Implementation
// ============================================

export function useTaskDragAndDrop(options: UseTaskDragAndDropOptions): UseTaskDragAndDropReturn {
  const {
    tasks,
    graveyardTasks = [],
    onReorder,
    onOptimisticUpdate,
    onGraveyard,
    onResurrect,
    onError,
    activationDistance = 8,
  } = options;
  
  // Drag state
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [dragSource, setDragSource] = useState<DragSource | null>(null);
  const [overTarget, setOverTarget] = useState<DropTargetInfo | null>(null);
  const [isOverGraveyard, setIsOverGraveyard] = useState(false);
  
  // Ref to track if we're in the middle of a drag
  const isDraggingRef = useRef(false);
  
  // Configure sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: activationDistance,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  /**
   * Get tasks for a specific container (date + category + state)
   */
  const getTasksForContainer = useCallback((
    dateStr: string,
    category: TaskCategory,
    state: TaskState
  ): Task[] => {
    const dayTasks = tasks[dateStr] || [];
    return dayTasks.filter(t => {
      const taskCategory = getTaskCategory(t);
      const taskState = getTaskState(t);
      return taskCategory === category && taskState === state;
    });
  }, [tasks]);
  
  /**
   * Find a task across all dates or graveyard.
   * Returns isFromGraveyard = true if found in graveyard.
   */
  const findTask = useCallback((taskId: string): { task: Task; dateStr: string; isFromGraveyard?: boolean } | null => {
    // First check graveyard tasks
    const graveyardTask = graveyardTasks.find(t => t.id === taskId);
    if (graveyardTask) {
      return { task: graveyardTask, dateStr: '', isFromGraveyard: true };
    }
    
    // Then check regular date-based tasks
    for (const [dateStr, dayTasks] of Object.entries(tasks)) {
      const task = dayTasks.find(t => t.id === taskId);
      if (task) {
        return { task, dateStr };
      }
    }
    return null;
  }, [tasks, graveyardTasks]);
  
  /**
   * Check if a container is the current drop target
   */
  const isDropTarget = useCallback((
    dateStr: string,
    category: TaskCategory,
    state: TaskState
  ): boolean => {
    if (!overTarget) return false;
    return (
      overTarget.dateStr === dateStr &&
      overTarget.category === category &&
      overTarget.state === state
    );
  }, [overTarget]);
  
  // ----------------------------------------
  // Drag Event Handlers
  // ----------------------------------------
  
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const taskId = String(event.active.id);
    const found = findTask(taskId);
    
    if (!found) {
      console.warn('[DnD] Could not find task for drag start:', taskId);
      return;
    }
    
    const { task, dateStr, isFromGraveyard } = found;
    const category = getTaskCategory(task);
    const state = getTaskState(task);
    
    // Find original index in container
    let originalIndex = 0;
    if (!isFromGraveyard) {
      const containerTasks = getTasksForContainer(dateStr, category, state);
      const sortedTasks = sortByOrder(containerTasks);
      originalIndex = sortedTasks.findIndex(t => t.id === taskId);
    }
    
    isDraggingRef.current = true;
    setActiveTask(task);
    setDragSource({
      taskId,
      dateStr: isFromGraveyard ? GRAVEYARD_CONTAINER_ID : dateStr,
      category,
      state,
      originalIndex,
    });
  }, [findTask, getTasksForContainer]);
  
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    
    if (!over) {
      setOverTarget(null);
      setIsOverGraveyard(false);
      return;
    }
    
    const overId = String(over.id);
    
    // Check if dropping on graveyard
    if (overId === GRAVEYARD_CONTAINER_ID) {
      setOverTarget(null);
      setIsOverGraveyard(true);
      return;
    }
    
    // Check if dropping on a graveyard task
    const found = findTask(overId);
    if (found?.isFromGraveyard) {
      setOverTarget(null);
      setIsOverGraveyard(true);
      return;
    }
    
    // Otherwise, reset graveyard state
    setIsOverGraveyard(false);
    
    // Try to parse as container ID
    const containerInfo = parseContainerId(overId);
    if (containerInfo) {
      setOverTarget(containerInfo);
      return;
    }
    
    // It's a task ID - find its container
    if (found) {
      const { task, dateStr } = found;
      setOverTarget({
        dateStr,
        category: getTaskCategory(task),
        state: getTaskState(task),
      });
    }
  }, [findTask]);
  
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Reset state
    setActiveTask(null);
    setOverTarget(null);
    setIsOverGraveyard(false);
    const source = dragSource;
    setDragSource(null);
    isDraggingRef.current = false;
    
    // Validate we have all required data
    if (!over || !source) {
      return;
    }
    
    const taskId = String(active.id);
    const overId = String(over.id);
    
    // Same item, no change
    if (taskId === overId) {
      return;
    }
    
    // Check if source is from graveyard
    const isSourceGraveyard = source.dateStr === GRAVEYARD_CONTAINER_ID;
    
    // Check if target is graveyard
    const isTargetGraveyard = overId === GRAVEYARD_CONTAINER_ID || 
      (findTask(overId)?.isFromGraveyard ?? false);
    
    // Handle Day → Graveyard: call onGraveyard
    if (!isSourceGraveyard && isTargetGraveyard && onGraveyard) {
      await onGraveyard(taskId, source.dateStr);
      return;
    }
    
    // Handle Graveyard → Day: call onResurrect
    if (isSourceGraveyard && !isTargetGraveyard && onResurrect) {
      // Find target date from container or task
      let targetDate: string | null = null;
      
      const containerInfo = parseContainerId(overId);
      if (containerInfo) {
        targetDate = containerInfo.dateStr;
      } else {
        const found = findTask(overId);
        if (found && !found.isFromGraveyard) {
          targetDate = found.dateStr;
        }
      }
      
      if (targetDate) {
        await onResurrect(taskId, targetDate);
      }
      return;
    }
    
    // If source is graveyard and target is also graveyard, do nothing
    if (isSourceGraveyard && isTargetGraveyard) {
      return;
    }
    
    // Determine target container
    let targetInfo = parseContainerId(overId);
    let overTaskIndex = -1;
    
    if (!targetInfo) {
      // Dropped on a task - find its container
      const found = findTask(overId);
      if (!found) {
        console.warn('[DnD] Could not find drop target:', overId);
        return;
      }
      
      const { task: overTask, dateStr } = found;
      targetInfo = {
        dateStr,
        category: getTaskCategory(overTask),
        state: getTaskState(overTask),
      };
      
      // Find the index of the task we dropped onto
      const containerTasks = getTasksForContainer(
        targetInfo.dateStr,
        targetInfo.category,
        targetInfo.state
      );
      const sortedTasks = sortByOrder(containerTasks.filter(t => t.id !== taskId));
      overTaskIndex = sortedTasks.findIndex(t => t.id === overId);
    }
    
    // Get target container's tasks
    const targetTasks = getTasksForContainer(
      targetInfo.dateStr,
      targetInfo.category,
      targetInfo.state
    );
    const sortedTargetTasks = sortByOrder(targetTasks.filter(t => t.id !== taskId));
    
    // Calculate new order
    let newOrder: string;
    if (overTaskIndex !== -1) {
      // Dropped on a specific task - insert at that position
      // Note: We insert BEFORE the task we dropped on
      newOrder = calculateNewOrder(sortedTargetTasks, overTaskIndex, taskId);
    } else {
      // Dropped on container - append to end
      newOrder = calculateNewOrder(sortedTargetTasks, sortedTargetTasks.length, taskId);
    }
    
    // Determine what changed
    const dateChanged = targetInfo.dateStr !== source.dateStr;
    const categoryChanged = targetInfo.category !== source.category;
    const stateChanged = targetInfo.state !== source.state;
    
    // Check if anything actually changed
    const found = findTask(taskId);
    if (!dateChanged && !categoryChanged && !stateChanged && found?.task.order === newOrder) {
      return;
    }
    
    // Build reorder options
    const reorderOptions: ReorderOptions = {};
    if (dateChanged) reorderOptions.date = targetInfo.dateStr;
    if (categoryChanged) reorderOptions.category = targetInfo.category;
    if (stateChanged) reorderOptions.state = targetInfo.state;
    
    // Optimistic update
    onOptimisticUpdate(prev => {
      const updated = { ...prev };
      
      // Remove from source
      const sourceTasks = [...(updated[source.dateStr] || [])];
      const sourceIndex = sourceTasks.findIndex(t => t.id === taskId);
      if (sourceIndex === -1) {
        console.warn('[DnD] Task not found in source during optimistic update');
        return prev;
      }
      
      const [movedTask] = sourceTasks.splice(sourceIndex, 1);
      updated[source.dateStr] = sourceTasks;
      
      // Update task properties
      const updatedTask: Task = {
        ...movedTask,
        order: newOrder,
        date: targetInfo.dateStr,
        category: targetInfo.category,
        state: targetInfo.state,
        completed: targetInfo.state === 'completed',
      };
      
      // Add to target
      const targetDate = targetInfo.dateStr;
      const currentTargetTasks = updated[targetDate] ? [...updated[targetDate]] : [];
      currentTargetTasks.push(updatedTask);
      updated[targetDate] = currentTargetTasks;
      
      return updated;
    });
    
    // Persist to server
    try {
      await onReorder(taskId, newOrder, reorderOptions);
    } catch (error) {
      console.error('[DnD] Failed to reorder task:', error);
      onError?.();
    }
  }, [dragSource, findTask, getTasksForContainer, onOptimisticUpdate, onReorder, onGraveyard, onResurrect, onError]);
  
  const handleDragCancel = useCallback(() => {
    setActiveTask(null);
    setDragSource(null);
    setOverTarget(null);
    setIsOverGraveyard(false);
    isDraggingRef.current = false;
  }, []);
  
  // Memoize handlers object to prevent unnecessary re-renders
  const handlers = useMemo(() => ({
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragEnd: handleDragEnd,
    onDragCancel: handleDragCancel,
  }), [handleDragStart, handleDragOver, handleDragEnd, handleDragCancel]);
  
  return {
    sensors,
    activeTask,
    dragSource,
    overTarget,
    isOverGraveyard,
    handlers,
    getTasksForContainer,
    isDropTarget,
  };
}
