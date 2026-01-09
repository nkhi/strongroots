import { LeafIcon } from '@phosphor-icons/react';
import { useNook } from './useNook';
import { NookPanel } from './NookPanel';
import { useHoldProgress } from '../../hooks/useHoldProgress';
import { HOLD_DURATIONS } from '../../constants/holdDurations';
import styles from './Nook.module.css';

export function NookButton() {
    const nook = useNook();

    const { holdProps, Ring } = useHoldProgress({
        duration: HOLD_DURATIONS.NOOK_PANEL,
        trigger: 'hover',
        label: 'Music options',
        onComplete: nook.openPanel,
    });

    return (
        <div className={styles.buttonContainer}>
            <button
                className={`${styles.button} ${nook.isPlaying ? styles.active : ''}`}
                onClick={nook.toggle}
                title={nook.isPlaying ? 'Playing: ' + nook.currentHourDisplay : 'Click to play music'}
                {...holdProps}
            >
                <LeafIcon size={20} weight={nook.isPlaying ? 'duotone' : 'regular'} />
            </button>
            <Ring />
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
