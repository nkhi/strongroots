import React from 'react';
import { useHoldProgress } from '../../../hooks/useHoldProgress';
import { HOLD_DURATIONS } from '../../../constants/holdDurations';

interface HoldLinkProps {
    href: string;
    color: string;
    label: string;
    children: React.ReactNode;
    className?: string;
}

export function HoldLink({ href, color, label, children, className }: HoldLinkProps) {
    const { holdProps, Ring } = useHoldProgress({
        duration: HOLD_DURATIONS.NAV_LINK,
        trigger: 'hover',
        color,
        label,
        onComplete: () => window.open(href, '_blank'),
    });

    return (
        <>
            <span className={className} {...holdProps}>
                {children}
            </span>
            <Ring />
        </>
    );
}
