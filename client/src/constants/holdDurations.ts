/**
 * Centralized hold-to-activate durations.
 * All values in milliseconds.
 */
export const HOLD_DURATIONS = {
    /** NookButton → open settings panel */
    NOOK_PANEL: 1100,

    /** Habit cell → open comment panel */
    ENTRY_COMMENT: 400,

    /** Todo item → more options overlay */
    TASK_OPTIONS: 400,

    /** Habit time filter buttons */
    TIME_FILTER: 250,

    /** Navigation links (external URLs, daylight toggle) */
    NAV_LINK: 650,
} as const;
