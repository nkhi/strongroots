import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

type TriggerMode = 'hover' | 'click';

interface UseHoldProgressOptions {
    /** Duration in ms before action triggers */
    duration: number;
    /** Optional delay in ms before the ring starts showing/filling */
    startDelay?: number;
    /** Callback when hold completes */
    onComplete: () => void;
    /** 
     * Preferred trigger mode:
     * - 'hover': Start on mouse enter (desktop), falls back to click on touch devices
     * - 'click': Start on mouse down / touch start
     */
    trigger?: TriggerMode;
    /** Whether the feature is enabled */
    enabled?: boolean;
    /** Ring color (defaults to blue) */
    color?: string;
    /** Label text to show next to the ring (e.g., "Opening Nook") */
    label?: string;
}

interface HoldProps {
    onMouseEnter?: (e: React.MouseEvent) => void;
    onMouseMove?: (e: React.MouseEvent) => void;
    onMouseDown?: (e: React.MouseEvent) => void;
    onMouseUp?: () => void;
    onMouseLeave: () => void;
    onTouchStart?: (e: React.TouchEvent) => void;
    onTouchMove?: (e: React.TouchEvent) => void;
    onTouchEnd?: () => void;
    onTouchCancel?: () => void;
    onContextMenu: (e: React.MouseEvent) => void;
    style: React.CSSProperties;
}

interface UseHoldProgressReturn {
    /** Props to spread onto the target element (handlers + cursor style) */
    holdProps: HoldProps;
    /** Pre-configured ring component - just render <Ring /> */
    Ring: () => React.ReactNode;
    /** Whether currently holding (for advanced use cases) */
    isHolding: boolean;
}

/**
 * Detect if the device has a primary input that supports hover.
 */
function hasHoverCapability(): boolean {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(hover: hover)').matches;
}

/**
 * Internal ring component that uses a ref for position to avoid animation restarts
 */
function HoldRingPortal({
    duration,
    positionRef,
    size = 16,
    strokeWidth = 2.5,
    color = '#3B82F6',
    label,
}: {
    duration: number;
    positionRef: React.RefObject<{ x: number; y: number } | null>;
    size?: number;
    strokeWidth?: number;
    color?: string;
    label?: string;
}) {
    const circleRef = useRef<SVGCircleElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [showOnLeft, setShowOnLeft] = useState(false);

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Start animation on mount
    useEffect(() => {
        const circle = circleRef.current;
        if (!circle) return;

        circle.style.transition = 'none';
        circle.style.strokeDashoffset = `${circumference}`;
        circle.getBoundingClientRect();
        circle.style.transition = `stroke-dashoffset ${duration}ms linear`;
        circle.style.strokeDashoffset = '0';
    }, [duration, circumference]);

    // Determine if we should show label on left (if too close to right edge)
    useEffect(() => {
        if (!label || !positionRef.current) return;

        const pillWidth = 150; // Approximate pill width
        const screenWidth = window.innerWidth;
        const cursorX = positionRef.current.x;

        // If cursor is in the right 1/3 of the screen, show label on left
        setShowOnLeft(cursorX > screenWidth - pillWidth - 50);
    }, [label, positionRef]);

    // Update position on animation frame
    useEffect(() => {
        let animationId: number;

        const updatePosition = () => {
            if (containerRef.current && positionRef.current) {
                containerRef.current.style.left = `${positionRef.current.x}px`;
                containerRef.current.style.top = `${positionRef.current.y}px`;
            }
            animationId = requestAnimationFrame(updatePosition);
        };

        updatePosition();

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [positionRef]);

    const initialPos = positionRef.current || { x: 0, y: 0 };

    // If no label, render just the ring centered on cursor
    if (!label) {
        return createPortal(
            <div
                ref={containerRef}
                style={{
                    position: 'fixed',
                    pointerEvents: 'none',
                    zIndex: 99999,
                    transform: 'translate(-50%, -50%)',
                    left: initialPos.x,
                    top: initialPos.y,
                    width: size,
                    height: size,
                }}
            >
                <svg
                    width={size}
                    height={size}
                    style={{ transform: 'rotate(-90deg)', display: 'block' }}
                >
                    <circle
                        ref={circleRef}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference}
                    />
                </svg>
            </div>,
            document.body
        );
    }

    // With label, render pill container
    const pillPadding = 6;
    const pillGap = 8;

    return createPortal(
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                pointerEvents: 'none',
                zIndex: 99999,
                transform: showOnLeft
                    ? 'translate(-100%, -50%)'
                    : 'translate(0%, -50%)',
                left: initialPos.x,
                top: initialPos.y,
                display: 'flex',
                flexDirection: showOnLeft ? 'row-reverse' : 'row',
                alignItems: 'center',
                gap: `${pillGap}px`,
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(8px)',
                borderRadius: '999px',
                padding: `${pillPadding}px ${pillPadding + 4}px`,
                paddingLeft: showOnLeft ? `${pillPadding + 8}px` : `${pillPadding}px`,
                paddingRight: showOnLeft ? `${pillPadding}px` : `${pillPadding + 8}px`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
        >
            <svg
                width={size}
                height={size}
                style={{ transform: 'rotate(-90deg)', display: 'block', flexShrink: 0 }}
            >
                <circle
                    ref={circleRef}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                />
            </svg>
            <span
                style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '12px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
            >
                {label}
            </span>
        </div>,
        document.body
    );
}

export function useHoldProgress({
    duration,
    startDelay = 0,
    onComplete,
    trigger = 'click',
    enabled = true,
    color,
    label,
}: UseHoldProgressOptions): UseHoldProgressReturn {
    const [isHolding, setIsHolding] = useState(false);

    // Use ref for position to avoid re-renders that would restart animation
    const positionRef = useRef<{ x: number; y: number } | null>(null);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const previousCursorRef = useRef<string>('');
    const isActiveRef = useRef(false);
    const onCompleteRef = useRef(onComplete);
    const cooldownRef = useRef(false);

    const effectiveTrigger = useMemo(() => {
        if (trigger === 'hover' && !hasHoverCapability()) {
            return 'click';
        }
        return trigger;
    }, [trigger]);

    const isTouch = !hasHoverCapability();

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    const hideCursor = useCallback(() => {
        if (isTouch) return;
        previousCursorRef.current = document.body.style.cursor;
        document.body.style.cursor = 'none';
    }, [isTouch]);

    const restoreCursor = useCallback(() => {
        if (isTouch) return;
        document.body.style.cursor = previousCursorRef.current;
    }, [isTouch]);

    const startHold = useCallback((x: number, y: number) => {
        if (!enabled || cooldownRef.current) return;

        isActiveRef.current = true;
        positionRef.current = { x, y };

        const beginProgress = () => {
            if (!isActiveRef.current) return;
            setIsHolding(true);
            hideCursor();

            timerRef.current = setTimeout(() => {
                if (isActiveRef.current) {
                    timerRef.current = null;
                    isActiveRef.current = false;
                    positionRef.current = null;
                    setIsHolding(false);
                    restoreCursor();

                    cooldownRef.current = true;
                    setTimeout(() => {
                        cooldownRef.current = false;
                    }, 200);

                    onCompleteRef.current();
                }
            }, duration);
        };

        if (startDelay > 0) {
            delayTimerRef.current = setTimeout(beginProgress, startDelay);
        } else {
            beginProgress();
        }
    }, [enabled, duration, startDelay, hideCursor, restoreCursor]);

    const cancelHold = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        if (delayTimerRef.current) {
            clearTimeout(delayTimerRef.current);
            delayTimerRef.current = null;
        }
        isActiveRef.current = false;
        positionRef.current = null;
        setIsHolding(false);
        restoreCursor();
    }, [restoreCursor]);

    const updatePosition = useCallback((x: number, y: number) => {
        if (isActiveRef.current) {
            positionRef.current = { x, y };
        }
    }, []);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            if (delayTimerRef.current) {
                clearTimeout(delayTimerRef.current);
            }
            if (document.body.style.cursor === 'none') {
                document.body.style.cursor = previousCursorRef.current;
            }
        };
    }, []);

    const handleMouseEnter = useCallback((e: React.MouseEvent) => {
        if (effectiveTrigger === 'hover') {
            startHold(e.clientX, e.clientY);
        }
    }, [effectiveTrigger, startHold]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        updatePosition(e.clientX, e.clientY);
    }, [updatePosition]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (effectiveTrigger === 'click') {
            startHold(e.clientX, e.clientY);
        }
    }, [effectiveTrigger, startHold]);

    const handleMouseUp = useCallback(() => {
        if (effectiveTrigger === 'click' && isActiveRef.current) {
            cancelHold();
        }
    }, [effectiveTrigger, cancelHold]);

    const handleMouseLeave = useCallback(() => {
        if (isActiveRef.current) {
            cancelHold();
        }
    }, [cancelHold]);

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        if (isActiveRef.current) {
            cancelHold();
        }
    }, [cancelHold]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (effectiveTrigger === 'click' && e.touches.length === 1) {
            const touch = e.touches[0];
            startHold(touch.clientX, touch.clientY);
        }
    }, [effectiveTrigger, startHold]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            updatePosition(touch.clientX, touch.clientY);
        }
    }, [updatePosition]);

    const handleTouchEnd = useCallback(() => {
        if (isActiveRef.current) {
            cancelHold();
        }
    }, [cancelHold]);

    const holdProps: HoldProps = useMemo(() => {
        const baseHandlers = {
            onMouseLeave: handleMouseLeave,
            onContextMenu: handleContextMenu,
            onTouchEnd: handleTouchEnd,
            onTouchCancel: handleTouchEnd,
        };

        const modeHandlers = effectiveTrigger === 'hover'
            ? {
                onMouseEnter: handleMouseEnter,
                onMouseMove: handleMouseMove,
            }
            : {
                onMouseDown: handleMouseDown,
                onMouseMove: handleMouseMove,
                onMouseUp: handleMouseUp,
                onTouchStart: handleTouchStart,
                onTouchMove: handleTouchMove,
            };

        return {
            ...baseHandlers,
            ...modeHandlers,
            style: { cursor: isHolding && !isTouch ? 'none' : undefined },
        };
    }, [
        effectiveTrigger,
        isHolding,
        isTouch,
        handleMouseEnter,
        handleMouseMove,
        handleMouseDown,
        handleMouseUp,
        handleMouseLeave,
        handleContextMenu,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
    ]);

    // Stable Ring component that uses ref for position
    const Ring = useCallback(() => {
        if (!isHolding) return null;
        return <HoldRingPortal duration={duration} positionRef={positionRef} color={color} label={label} />;
    }, [isHolding, duration, color, label]);

    return {
        holdProps,
        Ring,
        isHolding,
    };
}
