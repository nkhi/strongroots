import type { HabitDefaultTime } from './constants';
import { HABIT_TIME_CONFIG } from './constants';

interface HabitTimeIconProps {
    defaultTime: HabitDefaultTime;
    size?: number;
}

export function HabitTimeIcon({ defaultTime, size = 20 }: HabitTimeIconProps) {
    const config = HABIT_TIME_CONFIG[defaultTime];
    if (!config || !config.icon) return null;

    const IconComponent = config.icon;
    return <IconComponent size={size} weight="duotone" color={config.color} />;
}
