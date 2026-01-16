import { Tray } from '@phosphor-icons/react';
import { MemoryPanel } from './MemoryPanel';

interface MemoryButtonProps {
    isPanelOpen: boolean;
    onToggle: () => void;
    className?: string;
}

export function MemoryButton({ isPanelOpen, onToggle, className }: MemoryButtonProps) {
    return (
        <>
            <button
                className={className}
                onClick={onToggle}
                title="Good Moments"
            >
                <Tray size={24} weight={isPanelOpen ? 'duotone' : 'regular'} className="navIcon" />
            </button>
            {isPanelOpen && (
                <MemoryPanel onClose={onToggle} />
            )}
        </>
    );
}
