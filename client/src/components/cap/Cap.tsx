import React from 'react';
import { SpinnerGap } from '@phosphor-icons/react';
import styles from './Cap.module.css';
import { CAP_URL } from '../../config';
import { useCapService } from './useCapService';

export const Cap: React.FC = () => {
    const { isRunning } = useCapService({ keepAlive: true });

    if (!isRunning) {
        return (
            <div className={styles.loadingContainer}>
                <SpinnerGap size={24} className={styles.spinner} />
            </div>
        );
    }

    return (
        <div className={styles.capContainer}>
            <div className={styles.capLoadingOverlay} />
            <iframe
                src={CAP_URL}
                className={styles.capFrame}
                title="Cap"
            />
        </div>
    );
};
