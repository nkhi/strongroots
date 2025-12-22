import { CheckSquare } from '@phosphor-icons/react';
import type { Question } from '../../types';
import styles from './JournalV2.module.css';

interface CompletedStackProps {
    questions: Question[];
    getAnswer: (questionId: string) => string;
}

export function CompletedStack({ questions }: CompletedStackProps) {
    // Show up to 3 stacked card edges
    const visibleCount = Math.min(questions.length, 3);

    return (
        <div className={styles.completedStackContainer}>
            <div
                className={styles.completedStack}
                style={{
                    '--card-count': visibleCount
                } as React.CSSProperties}
            >
                {/* Render stacked card edges - just empty cards */}
                {Array.from({ length: visibleCount }).map((_, index) => (
                    <div
                        key={index}
                        className={styles.stackedEdge}
                        style={{
                            '--card-index': index
                        } as React.CSSProperties}
                    >
                        {/* Only show checkmark on top card */}
                        {index === visibleCount - 1 && (
                            <CheckSquare size={14} weight="duotone" color="#34D399" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
