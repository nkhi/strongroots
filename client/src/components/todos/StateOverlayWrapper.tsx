/**
 * StateOverlayWrapper Component
 * 
 * Hover overlay for changing task state (completed/failed).
 * Shows clickable dots when hovering over the task checkbox area.
 * 
 * ## Behavior:
 * - Click checkbox: cycles through states (via onToggle)
 * - Hover 400ms: shows overlay with complete/fail buttons
 * - Click overlay button: sets specific state
 * 
 * ## Usage:
 * ```tsx
 * <StateOverlayWrapper taskId={id} dateStr={date} currentState={state} onSetState={fn} onToggle={fn}>
 *   <Checkbox />
 * </StateOverlayWrapper>
 * ```
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Check, X } from '@phosphor-icons/react';
import type { TaskState } from './taskUtils';
import styles from './Todos.module.css';

interface StateOverlayProps {
    taskId: string;
    dateStr: string;
    currentState: TaskState;
    onSetState: (dateStr: string, taskId: string, newState: TaskState) => void;
    onToggle: () => void;
    children: React.ReactNode;
}

export function StateOverlayWrapper({
    taskId,
    dateStr,
    currentState,
    onSetState,
    onToggle,
    children
}: StateOverlayProps) {
    const [showOverlay, setShowOverlay] = useState(false);
    const [isHoveringOverlay, setIsHoveringOverlay] = useState(false);
    const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimers = useCallback(() => {
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
        }
    }, []);

    const handleMouseEnter = useCallback(() => {
        clearTimers();
        hoverTimerRef.current = setTimeout(() => {
            setShowOverlay(true);
        }, 400);
    }, [clearTimers]);

    const handleMouseLeave = useCallback(() => {
        clearTimers();
        hideTimerRef.current = setTimeout(() => {
            if (!isHoveringOverlay) {
                setShowOverlay(false);
            }
        }, 100);
    }, [clearTimers, isHoveringOverlay]);

    const handleOverlayEnter = useCallback(() => {
        setIsHoveringOverlay(true);
        clearTimers();
    }, [clearTimers]);

    const handleOverlayLeave = useCallback(() => {
        setIsHoveringOverlay(false);
        setShowOverlay(false);
    }, []);

    const handleStateClick = useCallback((e: React.MouseEvent, newState: 'completed' | 'failed') => {
        e.stopPropagation();
        onSetState(dateStr, taskId, newState);
        setShowOverlay(false);
        setIsHoveringOverlay(false);
        clearTimers();
    }, [dateStr, taskId, onSetState, clearTimers]);

    useEffect(() => {
        return () => { clearTimers(); };
    }, [clearTimers]);

    return (
        <div
            className={styles.stateOverlayWrapper}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div onClick={onToggle}>
                {children}
            </div>
            {showOverlay && (
                <div
                    className={styles.stateOverlay}
                    onMouseEnter={handleOverlayEnter}
                    onMouseLeave={handleOverlayLeave}
                >
                    <button
                        type="button"
                        className={`${styles.overlayDot} ${styles.successDot} ${currentState === 'completed' ? styles.active : ''}`}
                        onClick={(e) => handleStateClick(e, 'completed')}
                        title="Mark as completed"
                    >
                        <Check size={12} weight="bold" />
                    </button>
                    <button
                        type="button"
                        className={`${styles.overlayDot} ${styles.failDot} ${currentState === 'failed' ? styles.active : ''}`}
                        onClick={(e) => handleStateClick(e, 'failed')}
                        title="Mark as failed"
                    >
                        <X size={12} weight="bold" />
                    </button>
                </div>
            )}
        </div>
    );
}
