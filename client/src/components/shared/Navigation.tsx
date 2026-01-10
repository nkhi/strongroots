import React from 'react';
import { CalendarCheck, ListChecks, ButterflyIcon, LightbulbIcon, ListDashes, TreeIcon, HeartbeatIcon, CaretUpIcon, Carrot, SunDim, VideoCameraIcon, CalendarIcon } from '@phosphor-icons/react';
import { ServerStatus } from './ServerStatus';
import styles from './Navigation.module.css';
import { useDaylight } from '../daylight/DaylightContext';
import { NookButton } from '../nook/NookButton';
import { MemoryButton } from '../memories/MemoryButton';
import { useNavHotkeys } from '../../hooks/useNavHotkeys';
import { useHoldProgress } from '../../hooks/useHoldProgress';

import { HOLD_DURATIONS } from '../../constants/holdDurations';
import { useCarrotInterviews } from '../../hooks/useCarrotInterviews';
import { useCalendarEventsContext } from '../../contexts/CalendarEventsContext';

export type TabType = 'habits' | 'todos' | 'journal' | 'memos' | 'next' | 'lists' | 'daylight' | 'vlogs' | 'memories';

interface NavigationProps {
    activeTab: TabType;
    lastTab?: TabType;
    onTabChange: (tab: TabType) => void;
    workMode?: boolean;
}

// Wrapper for external links with hold progress
interface HoldLinkProps {
    href: string;
    color: string;
    label: string;
    children: React.ReactNode;
    className?: string;
}

function HoldLink({ href, color, label, children, className }: HoldLinkProps) {
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

// Wrapper for daylight button with hold progress
interface HoldButtonProps {
    onClick: () => void;
    color: string;
    label: string;
    children: React.ReactNode;
    className?: string;
}

function HoldButton({ onClick, color, label, children, className }: HoldButtonProps) {
    const { holdProps, Ring } = useHoldProgress({
        duration: HOLD_DURATIONS.NAV_LINK,
        trigger: 'hover',
        color,
        label,
        onComplete: onClick,
    });

    return (
        <>
            <button className={className} {...holdProps}>
                {children}
            </button>
            <Ring />
        </>
    );
}

export function Navigation({ activeTab, lastTab, onTabChange, workMode = false }: NavigationProps) {
    const { themeColors } = useDaylight();
    useNavHotkeys({ onTabChange, workMode });
    const [isMemoryPanelOpen, setIsMemoryPanelOpen] = React.useState(false);
    const { remainingCount } = useCarrotInterviews();
    const calendarContext = useCalendarEventsContext();

    // Prefetch calendar events on mount (±7 days)
    React.useEffect(() => {
        if (!calendarContext) return;
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - 7);
        const end = new Date(today);
        end.setDate(today.getDate() + 7);
        calendarContext.prefetchDateRange(start, end);
    }, [calendarContext]);

    const capUrl = import.meta.env.VITE_CAP_URL;

    const navStyle = (activeTab === 'daylight' && themeColors) ? {
        '--daylight-text-color': themeColors.text
    } as React.CSSProperties : {};

    const handleDaylightClick = () => {
        if (activeTab === 'daylight' && lastTab) {
            onTabChange(lastTab);
        } else {
            onTabChange('daylight');
        }
    };

    return (
        <div
            className={`${styles.navContainer} ${activeTab === 'daylight' ? styles.immersive : ''}`}
            style={navStyle}
        >
            <div className={styles.leftSection}>
                <HoldButton
                    onClick={handleDaylightClick}
                    className={styles.tabBtn}
                    color="#f59e0b"
                    label="Opening Daylight"
                >
                    <SunDim size={20} weight="duotone" />
                </HoldButton>

                <NookButton />

                <ServerStatus />
            </div>

            <div className={styles.tabSwitcher}>
                {!workMode && (
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'habits' ? styles.active : ''}`}
                        onClick={() => onTabChange('habits')}
                    >
                        <CalendarCheck size={24} weight={activeTab === 'habits' ? 'duotone' : 'regular'} className={styles.navIcon} />
                    </button>
                )}
                <button
                    className={`${styles.tabBtn} ${activeTab === 'todos' ? styles.active : ''}`}
                    onClick={() => onTabChange('todos')}
                >
                    <ListChecks size={24} weight={activeTab === 'todos' ? 'bold' : 'regular'} className={styles.navIcon} />
                </button>
                {!workMode && (
                    <>

                        <button
                            className={`${styles.tabBtn} ${activeTab === 'journal' ? styles.active : ''}`}
                            onClick={() => onTabChange('journal')}
                        >
                            <HeartbeatIcon size={24} weight={activeTab === 'journal' ? 'duotone' : 'regular'} className={styles.navIcon} />
                        </button>
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'memos' ? styles.active : ''}`}
                            onClick={() => onTabChange('memos')}
                        >
                            <LightbulbIcon size={24} weight={activeTab === 'memos' ? 'duotone' : 'regular'} className={styles.navIcon} />
                        </button>
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'lists' ? styles.active : ''}`}
                            onClick={() => onTabChange('lists')}
                        >
                            <ListDashes size={24} weight={activeTab === 'lists' ? 'duotone' : 'regular'} className={styles.navIcon} />
                        </button>
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'next' ? styles.active : ''}`}
                            onClick={() => onTabChange('next')}
                        >
                            <TreeIcon size={24} weight={activeTab === 'next' ? 'duotone' : 'regular'} className={styles.navIcon} />
                        </button>
                        <MemoryButton
                            isPanelOpen={isMemoryPanelOpen}
                            onToggle={() => setIsMemoryPanelOpen(!isMemoryPanelOpen)}
                            className={`${styles.tabBtn} ${isMemoryPanelOpen ? styles.active : ''}`}
                        />
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'vlogs' ? styles.active : ''}`}
                            onClick={() => window.open(capUrl, '_blank')}
                        >
                            <VideoCameraIcon size={24} weight={activeTab === 'vlogs' ? 'duotone' : 'regular'} className={styles.navIcon} />
                        </button>
                    </>
                )}
            </div>

            {!workMode && (
                <div className={styles.rightLinks}>
                    <HoldLink
                        href="https://central.karat.io/interviewer/dashboard"
                        className={styles.iconLink}
                        color="#25BCC2"
                        label="Opening Karat"
                    >

                        <div style={{ position: 'relative', display: 'flex' }}>
                            <Carrot size={20} weight="bold" />
                            {remainingCount > 0 && (
                                <span className={styles.caretBadge}>{remainingCount}</span>
                            )}
                        </div>
                    </HoldLink>
                    <HoldLink
                        href="https://app.monarchmoney.com/accounts?chartType=performance&dateRange=6M&timeframe=month"
                        className={styles.iconLink}
                        color="#f97316"
                        label="Opening Monarch"
                    >
                        <ButterflyIcon size={20} weight="duotone" />
                    </HoldLink>
                    <HoldLink
                        href="https://calendar.google.com/calendar/u/0/r#main_7"
                        className={styles.iconLink}
                        color="#3B82F6"
                        label="Opening Calendar"
                    >
                        <CalendarIcon size={20} weight="duotone" />
                    </HoldLink>
                </div>
            )}
            {workMode && <div className={styles.rightLinks} />}
        </div>
    );
}
