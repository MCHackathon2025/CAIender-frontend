/**
 * Core data models and interfaces for the Mobile Calendar component
 */

/**
 * Event model representing a calendar event
 * @typedef {Object} Event
 * @property {string} id - Unique identifier for the event
 * @property {string} title - Event title
 * @property {string} [description] - Optional event description
 * @property {Date} startDate - Event start date
 * @property {Date} endDate - Event end date
 * @property {string} startTime - Start time in "HH:MM" format
 * @property {string} endTime - End time in "HH:MM" format
 * @property {'main'|'suggestion'|'announcement'|'info'} theme - Event color theme
 * @property {boolean} isAllDay - Whether the event is all-day
 * @property {RecurrenceRule} [recurrence] - Optional recurrence rule
 */

/**
 * Week range model representing a calendar week
 * @typedef {Object} WeekRange
 * @property {Date} startDate - First day of the week
 * @property {Date} endDate - Last day of the week
 * @property {number} weekNumber - Week number in the year
 * @property {number} year - Year of the week
 */

/**
 * Event color variant for theming
 * @typedef {Object} EventColorVariant
 * @property {string} primary - Main color
 * @property {string} light - Light variant for backgrounds
 * @property {string} dark - Dark variant for text/borders
 * @property {string} contrast - High contrast text color
 */

/**
 * Calendar theme configuration
 * @typedef {Object} CalendarTheme
 * @property {string} primary - Primary theme color
 * @property {string} secondary - Secondary theme color
 * @property {string} accent - Accent color
 * @property {string} background - Background color
 * @property {string} surface - Surface color
 * @property {Object} text - Text colors
 * @property {string} text.primary - Primary text color
 * @property {string} text.secondary - Secondary text color
 * @property {string} text.disabled - Disabled text color
 * @property {Object} eventColors - Event color themes
 * @property {EventColorVariant} eventColors.main - Main event theme (green)
 * @property {EventColorVariant} eventColors.suggestion - Suggestion theme (yellow)
 * @property {EventColorVariant} eventColors.announcement - Announcement theme (purple)
 * @property {EventColorVariant} eventColors.info - Info theme (blue)
 */

/**
 * Recurrence rule for repeating events
 * @typedef {Object} RecurrenceRule
 * @property {'daily'|'weekly'|'monthly'|'yearly'} frequency - Recurrence frequency
 * @property {number} [interval] - Interval between recurrences
 * @property {Date} [until] - End date for recurrence
 * @property {number} [count] - Number of occurrences
 */

// Export empty object to make this a module
export {};