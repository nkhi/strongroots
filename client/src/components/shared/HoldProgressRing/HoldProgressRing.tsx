import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './HoldProgressRing.module.css';

interface HoldProgressRingProps {
    /** Duration in ms for full circle */
    duration: number;
    /** Screen position for the ring center */
    position: { x: number; y: number };
    /** Ring diameter in pixels */
    size?: number;
    /** Stroke width in pixels */
    strokeWidth?: number;
    /** Ring color */
    color?: string;
}

export function HoldProgressRing({
    duration,
    position,
    size = 24,
    strokeWidth = 3,
    color = '#3B82F6',
}: HoldProgressRingProps) {
    const circleRef = useRef<SVGCircleElement>(null);

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        const circle = circleRef.current;
        if (!circle) return;

        // Reset to full offset (invisible)
        circle.style.transition = 'none';
        circle.style.strokeDashoffset = `${circumference}`;

        // Force reflow to ensure the reset takes effect
        circle.getBoundingClientRect();

        // Start animation to 0 (fully visible)
        circle.style.transition = `stroke-dashoffset ${duration}ms linear`;
        circle.style.strokeDashoffset = '0';
    }, [duration, circumference]);

    const ring = (
        <div
            className={styles.container}
            style={{
                left: position.x,
                top: position.y,
                width: size,
                height: size,
            }}
        >
            <svg
                width={size}
                height={size}
                className={styles.svg}
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
        </div>
    );

    return createPortal(ring, document.body);
}
