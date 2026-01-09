import React from 'react';
import { CalendarCheck, ListChecks, ButterflyIcon, LightbulbIcon, ListDashes, TreeIcon, HeartbeatIcon, CaretUpIcon, SunDim, VideoCameraIcon } from '@phosphor-icons/react';
import { ServerStatus } from './ServerStatus';
import styles from './Navigation.module.css';
import { useDaylight } from '../daylight/DaylightContext';
import { NookButton } from '../nook/NookButton';
import { MemoryButton } from '../memories/MemoryButton';
import { useNavHotkeys } from '../../hooks/useNavHotkeys';
import { useHoldProgress } from '../../hooks/useHoldProgress';
import { HOLD_DURATIONS } from '../../constants/holdDurations';

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
    children: React.ReactNode;
    className?: string;
}

function HoldLink({ href, color, children, className }: HoldLinkProps) {
    const { holdProps, Ring } = useHoldProgress({
        duration: HOLD_DURATIONS.NAV_LINK,
        trigger: 'hover',
        color,
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
    children: React.ReactNode;
    className?: string;
}

function HoldButton({ onClick, color, children, className }: HoldButtonProps) {
    const { holdProps, Ring } = useHoldProgress({
        duration: HOLD_DURATIONS.NAV_LINK,
        trigger: 'hover',
        color,
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
                        <CalendarCheck size={20} weight={activeTab === 'habits' ? 'duotone' : 'regular'} className={styles.navIcon} />
                    </button>
                )}
                <button
                    className={`${styles.tabBtn} ${activeTab === 'todos' ? styles.active : ''}`}
                    onClick={() => onTabChange('todos')}
                >
                    <ListChecks size={20} weight={activeTab === 'todos' ? 'bold' : 'regular'} className={styles.navIcon} />
                </button>
                {!workMode && (
                    <>

                        <button
                            className={`${styles.tabBtn} ${activeTab === 'journal' ? styles.active : ''}`}
                            onClick={() => onTabChange('journal')}
                        >
                            <HeartbeatIcon size={20} weight={activeTab === 'journal' ? 'duotone' : 'regular'} className={styles.navIcon} />
                        </button>
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'memos' ? styles.active : ''}`}
                            onClick={() => onTabChange('memos')}
                        >
                            <LightbulbIcon size={20} weight={activeTab === 'memos' ? 'duotone' : 'regular'} className={styles.navIcon} />
                        </button>
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'lists' ? styles.active : ''}`}
                            onClick={() => onTabChange('lists')}
                        >
                            <ListDashes size={20} weight={activeTab === 'lists' ? 'duotone' : 'regular'} className={styles.navIcon} />
                        </button>
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'next' ? styles.active : ''}`}
                            onClick={() => onTabChange('next')}
                        >
                            <TreeIcon size={20} weight={activeTab === 'next' ? 'duotone' : 'regular'} className={styles.navIcon} />
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
                            <VideoCameraIcon size={20} weight={activeTab === 'vlogs' ? 'duotone' : 'regular'} className={styles.navIcon} />
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
                    >
                        <CaretUpIcon size={20} weight="bold" />
                    </HoldLink>
                    <HoldLink
                        href="https://app.monarchmoney.com/accounts?chartType=performance&dateRange=6M&timeframe=month"
                        className={styles.iconLink}
                        color="#f97316"
                    >
                        <ButterflyIcon size={20} weight="duotone" />
                    </HoldLink>
                </div>
            )}
            {workMode && <div className={styles.rightLinks} />}
        </div>
    );
}
