import { useState, useRef, useEffect } from 'react';
import { Square, ArrowRight } from '@phosphor-icons/react';
import type { Question } from '../../types';
import styles from './JournalV2.module.css';

interface QuestionStackProps {
    questions: Question[];
    onAnswerSubmit: (questionId: string, answer: string) => void;
    getAnswer: (questionId: string) => string;
}

export function QuestionStack({ questions, onAnswerSubmit, getAnswer }: QuestionStackProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const activeQuestion = questions[currentIndex];
    const remainingCount = questions.length - currentIndex - 1;

    // Reset current answer when active question changes
    useEffect(() => {
        if (activeQuestion) {
            setCurrentAnswer(getAnswer(activeQuestion.id));
        }
    }, [activeQuestion?.id]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [currentAnswer]);

    const handleSubmit = () => {
        if (!activeQuestion || !currentAnswer.trim()) return;

        setIsAnimating(true);
        onAnswerSubmit(activeQuestion.id, currentAnswer);

        setTimeout(() => {
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setCurrentAnswer('');
            }
            setIsAnimating(false);
        }, 400);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    };

    if (!activeQuestion) return null;

    // Determine which cards to show behind (max 2)
    const stackCards = questions.slice(currentIndex + 1, currentIndex + 3);

    return (
        <div className={styles.questionStackContainer}>
            <div className={styles.questionStack}>
                {/* Background stack cards (rotated, peeking) */}
                {stackCards.map((q, i) => {
                    const stackIndex = i === 0 ? 'stackCard0' : 'stackCard1';
                    return (
                        <div
                            key={q.id}
                            className={`${styles.stackCard} ${styles[stackIndex]}`}
                        >
                            <div className={styles.stackCardInner}>
                                <Square size={18} color="rgba(255, 255, 255, 0.3)" />
                                <span className={styles.stackCardText}>{q.text}</span>
                            </div>
                        </div>
                    );
                })}

                {/* Active card (front) */}
                <div className={`${styles.activeCard} ${isAnimating ? styles.animatingOut : ''}`}>
                    <div className={styles.questionHeader}>
                        <Square size={20} color="rgba(255, 255, 255, 0.4)" />
                        <span className={styles.questionText}>{activeQuestion.text}</span>
                    </div>

                    <textarea
                        ref={textareaRef}
                        className={styles.answerTextarea}
                        placeholder="Write your answer here..."
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={3}
                    />

                    <div className={styles.cardActions}>
                        <button
                            className={styles.submitBtn}
                            onClick={handleSubmit}
                            disabled={!currentAnswer.trim()}
                        >
                            <span>Submit</span>
                            <ArrowRight size={16} weight="bold" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress indicator */}
            {remainingCount > 0 && (
                <div className={styles.progressIndicator}>
                    {remainingCount} more question{remainingCount !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
}
