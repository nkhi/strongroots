import type { Icon } from '@phosphor-icons/react';

export type TabType = 'habits' | 'todos' | 'journal' | 'memos' | 'next' | 'lists' | 'daylight' | 'vlogs' | 'memories' | 'immich';

export interface NavItem {
    id: TabType | string;
    icon: Icon;
    label?: string;
    href?: string;
    color?: string;
    showInWorkMode: boolean;
    useDuotone?: boolean;
    onClick?: (options: { onTabChange: (tab: TabType) => void; capUrl?: string }) => void;
}

export interface ExternalLink {
    id: string;
    href: string;
    icon: Icon;
    color: string;
    label: string;
}
