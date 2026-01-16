import type { Icon } from '@phosphor-icons/react';

export type TabType = 'habits' | 'todos' | 'journal' | 'memos' | 'next' | 'lists' | 'daylight' | 'vlogs' | 'memories' | 'immich' | 'cap';

export interface NavItem {
    id: TabType | string;
    icon: Icon;
    label?: string;
    href?: string;
    color?: string;
    showInWorkMode: boolean;
    useDuotone?: boolean;
    onClick?: (options: { onTabChange: (tab: TabType) => void }) => void;
    isActive?: (activeTab: TabType) => boolean;
}

export interface ExternalLink {
    id: string;
    href: string;
    icon: Icon;
    color: string;
    label: string;
}
