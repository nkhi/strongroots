import React from 'react';
import styles from './Immich.module.css';
import { IMMICH_URL } from '../../config';

export const Immich: React.FC = () => {
    return (
        <div className={styles.immichContainer}>
            <div className={styles.immichLoadingOverlay} />
            <iframe
                src={IMMICH_URL}
                className={styles.immichFrame}
                title="Immich"
            />
        </div>
    );
};
