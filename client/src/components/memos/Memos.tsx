import React from 'react';
import styles from './Memos.module.css';
import { MEMOS_URL } from '../../config';

export const Memos: React.FC = () => {
    return (
        <div className={styles.memosContainer}>
            <div className={styles.memosLoadingOverlay} />
            <iframe
                src={MEMOS_URL}
                className={styles.memosFrame}
                title="Memos"
            />
        </div>
    );
};
