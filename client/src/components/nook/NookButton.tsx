import { useRef, useCallback } from 'react';
import { LeafIcon } from '@phosphor-icons/react';
import { useNook } from './useNook';
import { NookPanel } from './NookPanel';
import styles from './Nook.module.css';

export function NookButton() {
    const nook = useNook();
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const didLongPress = useRef(false);

    const handleMouseDown = useCallback(() => {
        didLongPress.current = false;
        longPressTimer.current = setTimeout(() => {
            didLongPress.current = true;
            nook.openPanel();
        }, 500);
    }, [nook]);

    const handleMouseUp = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
        if (!didLongPress.current) {
            nook.toggle();
        }
    }, [nook]);

    const handleMouseLeave = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }, []);

    return (
        <div className={styles.buttonContainer}>
            <button
                className={`${styles.button} ${nook.isPlaying ? styles.active : ''}`}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                title={nook.isPlaying ? 'Playing: ' + nook.currentHourDisplay : 'Click to play music'}
            >
                <LeafIcon size={20} weight={nook.isPlaying ? 'duotone' : 'regular'} />
            </button>
            {nook.isPanelOpen && (
                <NookPanel
                    currentHour={nook.currentHour}
                    currentHourDisplay={nook.currentHourDisplay}
                    volume={nook.volume}
                    setVolume={nook.setVolume}
                    weatherMode={nook.weatherMode}
                    setWeatherMode={nook.setWeatherMode}
                    onClose={nook.closePanel}
                />
            )}
        </div>
    );
}
