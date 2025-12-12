import React from 'react';
import styles from './Memos.module.css';

export const Memos: React.FC = () => {
    return (
        <div className={styles.memosContainer}>
            <div className={styles.memosLoadingOverlay} />
            <iframe
                src={`http://${window.location.hostname}:5230/`}
                className={styles.memosFrame}
                title="Memos"
            />
        </div>
    );
};
