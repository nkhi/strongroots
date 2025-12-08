import { CalendarCheck, ListChecks, Calendar, TipJarIcon, LightbulbIcon, ChartLineUpIcon, ListDashes, TreeIcon, HeartbeatIcon } from '@phosphor-icons/react';
import { ServerStatus } from './ServerStatus';
import styles from './Navigation.module.css';

type TabType = 'habits' | 'todos' | 'logs' | 'memos' | 'next' | 'lists';

interface NavigationProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    apiBaseUrl: string;
}

export function Navigation({ activeTab, onTabChange, apiBaseUrl }: NavigationProps) {
    return (
        <div className={styles.navContainer}>
            {/* Left side - Main navigation tabs */}
            <div className={styles.tabSwitcher}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'habits' ? styles.active : ''}`}
                    onClick={() => onTabChange('habits')}
                >
                    <CalendarCheck size={20} weight={activeTab === 'habits' ? 'duotone' : 'regular'} className={styles.navIcon} />
                    <span className={styles.navText}>Habits</span>
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'todos' ? styles.active : ''}`}
                    onClick={() => onTabChange('todos')}
                >
                    <ListChecks size={20} weight={activeTab === 'todos' ? 'bold' : 'regular'} className={styles.navIcon} />
                    <span className={styles.navText}>Today</span>
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'memos' ? styles.active : ''}`}
                    onClick={() => onTabChange('memos')}
                >
                    <LightbulbIcon size={20} weight={activeTab === 'memos' ? 'duotone' : 'regular'} className={styles.navIcon} />
                    <span className={styles.navText}>Memos</span>
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'logs' ? styles.active : ''}`}
                    onClick={() => onTabChange('logs')}
                >
                    <HeartbeatIcon size={20} weight={activeTab === 'logs' ? 'duotone' : 'regular'} className={styles.navIcon} />
                    <span className={styles.navText}>Journal</span>
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'lists' ? styles.active : ''}`}
                    onClick={() => onTabChange('lists')}
                >
                    <ListDashes size={20} weight={activeTab === 'lists' ? 'duotone' : 'regular'} className={styles.navIcon} />
                    <span className={styles.navText}>Lists</span>
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'next' ? styles.active : ''}`}
                    onClick={() => onTabChange('next')}
                >
                    <TreeIcon size={20} weight={activeTab === 'next' ? 'duotone' : 'regular'} className={styles.navIcon} />
                    <span className={styles.navText}>Grow</span>
                </button>
            </div>

            {/* Right side - icon-only external links + server status */}
            <div className={styles.rightLinks}>
                <a href="https://app.monarchmoney.com/accounts?chartType=performance&dateRange=6M&timeframe=month" target="_blank" rel="noreferrer" className={styles.iconLink}>
                    <TipJarIcon size={20} weight="duotone" />
                </a>
                {/* <a href="https://www.perplexity.ai/" target="_blank" rel="noreferrer" className={styles.iconLink}>
                    <img src="/icons/perplexity.svg" alt="Perplexity" style={{ width: '20px', height: '20px', opacity: 0.5 }} />
                </a> */}
                <a href="cron://" className={styles.iconLink}>
                    <Calendar size={20} weight="duotone" />
                </a>
                <a href="linear://" className={styles.iconLink}>
                    <ChartLineUpIcon size={20} weight="bold" />
                </a>
                <ServerStatus apiBaseUrl={apiBaseUrl} />
            </div>
        </div>
    );
}
