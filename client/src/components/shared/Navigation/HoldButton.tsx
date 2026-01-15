import React from 'react';
import { useHoldProgress } from '../../../hooks/useHoldProgress';
import { HOLD_DURATIONS } from '../../../constants/holdDurations';

interface HoldButtonProps {
    onClick: () => void;
    color: string;
    label: string;
    children: React.ReactNode;
    className?: string;
}

export function HoldButton({ onClick, color, label, children, className }: HoldButtonProps) {
    const { holdProps, Ring } = useHoldProgress({
        duration: HOLD_DURATIONS.NAV_LINK,
        trigger: 'hover',
        color,
        label,
        onComplete: onClick,
    });

    return (
        <>
            <button className={className} {...holdProps}>
                {children}
            </button>
            <Ring />
        </>
    );
}
