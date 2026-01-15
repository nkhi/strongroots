import {
    CalendarCheck,
    ListChecks,
    HeartbeatIcon,
    LightbulbIcon,
    ListDashes,
    TreeIcon,
    ImageIcon,
    VideoCameraIcon,
    ButterflyIcon,
    CalendarIcon
} from '@phosphor-icons/react';
import type { NavItem, ExternalLink } from './types';

export const NAV_TABS: NavItem[] = [
    {
        id: 'habits',
        icon: CalendarCheck,
        showInWorkMode: false,
        useDuotone: true
    },
    {
        id: 'todos',
        icon: ListChecks,
        showInWorkMode: true,
        useDuotone: false // Todos uses 'bold' when active
    },
    {
        id: 'journal',
        icon: HeartbeatIcon,
        showInWorkMode: false,
        useDuotone: true
    },
    {
        id: 'memos',
        icon: LightbulbIcon,
        showInWorkMode: false,
        useDuotone: true
    },
    {
        id: 'lists',
        icon: ListDashes,
        showInWorkMode: false,
        useDuotone: true
    },
    {
        id: 'next',
        icon: TreeIcon,
        showInWorkMode: false,
        useDuotone: true
    },
    {
        id: 'immich',
        icon: ImageIcon,
        showInWorkMode: false,
        useDuotone: true
    },
    {
        id: 'vlogs_link',
        icon: VideoCameraIcon,
        showInWorkMode: false,
        useDuotone: true,
        onClick: ({ capUrl }) => {
            if (capUrl) window.open(capUrl, '_blank');
        }
    }
];

export const EXTERNAL_LINKS: ExternalLink[] = [
    {
        id: 'monarch',
        href: 'https://app.monarchmoney.com/accounts?chartType=performance&dateRange=6M&timeframe=month',
        icon: ButterflyIcon,
        color: '#f97316',
        label: 'Opening Monarch'
    },
    {
        id: 'calendar',
        href: 'https://calendar.google.com/calendar/u/0/r#main_7',
        icon: CalendarIcon,
        color: '#3B82F6',
        label: 'Opening Calendar'
    }
];
