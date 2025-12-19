import { useRef, useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Calendar, Trash, X, Ghost, CaretDown, SpinnerGap, ArrowsCounterClockwise, SelectionForegroundIcon } from '@phosphor-icons/react';
import { DateUtility } from '../../utils';
import type { Task } from '../../types';
import { GRAVEYARD_CONTAINER_ID } from '../../hooks/useTaskDragAndDrop';
import { DraggableTask } from './DraggableTask';
import styles from './Graveyard.module.css';

interface GraveyardProps {
    isOpen: boolean;
    tasks: Task[];
    isOverGraveyard?: boolean;
    onClose: () => void;
    onResurrect: (taskId: string, targetDate: string) => void;
    onDelete: (taskId: string) => void;
    isLoading?: boolean;
    workMode?: boolean;
}

/**
 * Graveyard Panel - Compact side panel for graveyarded tasks.
 * Tasks are grouped by category (life/work) with collapsible accordions.
 * Now acts as a droppable target for drag-and-drop.
 */
export function Graveyard({
    isOpen,
    tasks,
    isOverGraveyard = false,
    onClose,
    onResurrect,
    onDelete,
    isLoading = false,
    workMode = false
}: GraveyardProps) {
    const [lifeExpanded, setLifeExpanded] = useState(true);
    const [workExpanded, setWorkExpanded] = useState(true);
    const panelRef = useRef<HTMLDivElement>(null);

    // Dragging state

    // Dragging state
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); // Mouse start position
    const [initialPos, setInitialPos] = useState({ x: 0, y: 0 }); // Element start position

    // Make this panel a droppable target
    const { setNodeRef, isOver } = useDroppable({
        id: GRAVEYARD_CONTAINER_ID,
    });

    const showDropIndicator = isOverGraveyard || isOver;

    const lifeTasks = tasks.filter(t => t.category !== 'work');
    const workTasks = tasks.filter(t => t.category === 'work');

    // Drag Logic
    const handleMouseDown = (e: React.MouseEvent) => {
        // Prevent drag if clicking on buttons
        if ((e.target as HTMLElement).closest('button')) return;

        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setInitialPos({ ...position });
        e.preventDefault();
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;
            setPosition({
                x: initialPos.x + dx,
                y: initialPos.y + dy
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);

            // Bounds check & snap back
            if (panelRef.current) {
                const rect = panelRef.current.getBoundingClientRect();
                const margin = 24; // Keep 24px padding from edges
                const winW = window.innerWidth;
                const winH = window.innerHeight;

                let deltaX = 0;
                let deltaY = 0;

                // Horizontal bounds
                if (rect.left < margin) {
                    deltaX = margin - rect.left;
                } else if (rect.right > winW - margin) {
                    deltaX = (winW - margin) - rect.right;
                }

                // Vertical bounds
                if (rect.top < margin) {
                    deltaY = margin - rect.top;
                } else if (rect.bottom > winH - margin) {
                    deltaY = (winH - margin) - rect.bottom;
                }

                if (deltaX !== 0 || deltaY !== 0) {
                    setPosition(prev => ({
                        x: prev.x + deltaX,
                        y: prev.y + deltaY
                    }));
                }
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart, initialPos]);

    const resetPosition = () => {
        setPosition({ x: 0, y: 0 });
    };

    // Calculate transform styles
    const getTransformStyle = () => {
        if (!isOpen) return 'translateX(450px)'; // Hide offscreen (slightly more than width)
        return `translate(${position.x}px, ${position.y}px)`;
    };

    return (
        <div
            ref={panelRef}
            className={`${styles.graveyardPanel} ${isOpen ? styles.open : ''}`}
            style={{
                transform: getTransformStyle(),
                transition: isDragging ? 'none' : undefined // Disable transition while dragging for performance
            }}
        >
            {/* Drag Handle Area */}
            <div
                className={styles.dragHandle}
                onMouseDown={handleMouseDown}
                title="Drag to move"
            />

            {/* Close button in top left */}
            <button className={styles.closeBtn} onClick={onClose} title="Close">
                <X size={14} />
            </button>

            {/* Reset Position Button - Top Right */}
            {(position.x !== 0 || position.y !== 0) && (
                <button
                    className={styles.resetBtn}
                    onClick={resetPosition}
                    title="Reset Position"
                >
                    <SelectionForegroundIcon size={14} />
                </button>
            )}

            <div
                ref={setNodeRef}
                className={`${styles.graveyardList} ${showDropIndicator ? styles.dropTarget : ''}`}
            >
                {isLoading ? (
                    <div className={styles.loadingContainer}>
                        <SpinnerGap size={24} className={styles.spinner} />
                    </div>
                ) : tasks.length === 0 ? (
                    <div className={styles.graveyardEmpty}>
                        <Ghost size={32} weight="duotone" className={styles.graveyardEmptyIcon} />
                        <span className={styles.graveyardEmptyText}>
                            {showDropIndicator ? 'Drop here to shelve' : 'No tasks'}
                        </span>
                    </div>
                ) : workMode ? (
                    // Work Mode: Simple flat list of ONLY work tasks
                    <div className={styles.categoryTasks}>
                        {workTasks.map(task => (
                            <DraggableTask key={task.id} task={task}>
                                <GraveyardTask
                                    task={task}
                                    onResurrect={onResurrect}
                                    onDelete={onDelete}
                                />
                            </DraggableTask>
                        ))}
                    </div>
                ) : (
                    // Normal Mode: Accordions for Life/Work
                    <>
                        {/* Life Accordion */}
                        {lifeTasks.length > 0 && (
                            <div className={styles.categorySection}>
                                <button
                                    className={styles.categoryHeader}
                                    onClick={() => setLifeExpanded(!lifeExpanded)}
                                >
                                    <CaretDown
                                        size={12}
                                        className={`${styles.caretIcon} ${lifeExpanded ? styles.expanded : ''}`}
                                    />
                                    {/* <Heart size={12} weight="fill" className={styles.lifeIcon} /> */}
                                    <span>Life</span>
                                    <span className={styles.categoryCount}>{lifeTasks.length}</span>
                                </button>
                                {lifeExpanded && (
                                    <div className={styles.categoryTasks}>
                                        {lifeTasks.map(task => (
                                            <DraggableTask key={task.id} task={task}>
                                                <GraveyardTask
                                                    task={task}
                                                    onResurrect={onResurrect}
                                                    onDelete={onDelete}
                                                />
                                            </DraggableTask>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Divider */}
                        {lifeTasks.length > 0 && workTasks.length > 0 && (
                            <div className={styles.divider} />
                        )}

                        {/* Work Accordion */}
                        {workTasks.length > 0 && (
                            <div className={styles.categorySection}>
                                <button
                                    className={styles.categoryHeader}
                                    onClick={() => setWorkExpanded(!workExpanded)}
                                >
                                    <CaretDown
                                        size={12}
                                        className={`${styles.caretIcon} ${workExpanded ? styles.expanded : ''}`}
                                    />
                                    {/* <Briefcase size={12} weight="fill" className={styles.workIcon} /> */}
                                    <span>Work</span>
                                    <span className={styles.categoryCount}>{workTasks.length}</span>
                                </button>
                                {workExpanded && (
                                    <div className={styles.categoryTasks}>
                                        {workTasks.map(task => (
                                            <DraggableTask key={task.id} task={task}>
                                                <GraveyardTask
                                                    task={task}
                                                    onResurrect={onResurrect}
                                                    onDelete={onDelete}
                                                />
                                            </DraggableTask>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

interface GraveyardTaskProps {
    task: Task;
    onResurrect: (taskId: string, targetDate: string) => void;
    onDelete: (taskId: string) => void;
}

function GraveyardTask({ task, onResurrect, onDelete }: GraveyardTaskProps) {
    const dateInputRef = useRef<HTMLInputElement>(null);
    const todayStr = DateUtility.formatDate(new Date());

    const handleCalendarClick = () => {
        dateInputRef.current?.showPicker?.();
        dateInputRef.current?.focus();
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDate = e.target.value;
        if (selectedDate) {
            onResurrect(task.id, selectedDate);
        }
    };

    return (
        <div className={styles.graveyardTask}>
            <span className={styles.taskText}>{task.text}</span>
            <div className={styles.taskActions}>
                <input
                    ref={dateInputRef}
                    type="date"
                    defaultValue={todayStr}
                    onChange={handleDateChange}
                    className={styles.hiddenDateInput}
                />
                <button
                    className={styles.actionBtn}
                    onClick={handleCalendarClick}
                    title="Pick date to resurrect"
                >
                    <Calendar size={14} />
                </button>
                <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => onDelete(task.id)}
                    title="Delete permanently"
                >
                    <Trash size={14} />
                </button>
            </div>
        </div>
    );
}
