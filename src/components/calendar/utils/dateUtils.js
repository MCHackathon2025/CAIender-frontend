/**
 * Date utility functions for the mobile calendar component
 * Handles week calculations, date formatting, and navigation
 */

/**
 * Create a new Date with 1-based month input (more intuitive)
 * @param {number} year - The year
 * @param {number} month - The month (1-12, where 1 = January)
 * @param {number} day - The day of the month
 * @param {number} hours - The hours (optional, defaults to 0)
 * @param {number} minutes - The minutes (optional, defaults to 0)
 * @param {number} seconds - The seconds (optional, defaults to 0)
 * @returns {Date} - New Date object
 */
export function createDate(year, month, day, hours = 0, minutes = 0, seconds = 0) {
  return new Date(year, month - 1, day, hours, minutes, seconds);
}

/**
 * Get the start of the week (Monday) for a given date
 * @param {Date} date - The date to get the week start for
 * @returns {Date} - The start of the week (Monday)
 */
export function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

/**
 * Get the end of the week (Sunday) for a given date
 * @param {Date} date - The date to get the week end for
 * @returns {Date} - The end of the week (Sunday)
 */
export function getWeekEnd(date) {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
}

/**
 * Get the week range (start and end dates) for a given date
 * @param {Date} date - The date to get the week range for
 * @returns {Object} - Object with startDate, endDate, weekNumber, and year
 */
export function getWeekRange(date) {
  const startDate = getWeekStart(date);
  const endDate = getWeekEnd(date);
  const weekNumber = getWeekNumber(date);
  const year = date.getFullYear();
  
  return {
    startDate,
    endDate,
    weekNumber,
    year
  };
}

/**
 * Get the current week range
 * @returns {Object} - Current week range object
 */
export function getCurrentWeek() {
  return getWeekRange(new Date());
}

/**
 * Get all days in a week as an array of Date objects
 * @param {Date} date - Any date within the desired week
 * @returns {Date[]} - Array of 7 Date objects representing the week
 */
export function getWeekDays(date) {
  const weekStart = getWeekStart(date);
  const days = [];
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(day);
  }
  
  return days;
}

/**
 * Navigate to the previous week
 * @param {Date} currentDate - Current date
 * @returns {Date} - Date in the previous week
 */
export function getPreviousWeek(currentDate) {
  const prevWeek = new Date(currentDate);
  prevWeek.setDate(currentDate.getDate() - 7);
  return prevWeek;
}

/**
 * Navigate to the next week
 * @param {Date} currentDate - Current date
 * @returns {Date} - Date in the next week
 */
export function getNextWeek(currentDate) {
  const nextWeek = new Date(currentDate);
  nextWeek.setDate(currentDate.getDate() + 7);
  return nextWeek;
}/**
 
* Format a date range for display (e.g., "Dec 9-15, 2024" or "Dec 9-15" on small screens)
 * @param {Date} startDate - Start date of the range
 * @param {Date} endDate - End date of the range
 * @param {boolean} includeYear - Whether to include the year (optional, defaults to responsive behavior)
 * @returns {string} - Formatted date range string
 */
export function formatWeekRange(startDate, endDate, includeYear = null) {
  const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const year = endDate.getFullYear();
  
  // Determine whether to show year based on screen size if not explicitly set
  const shouldIncludeYear = includeYear !== null ? includeYear : window.innerWidth > 480;
  
  // If both dates are in the same month
  if (startMonth === endMonth) {
    return shouldIncludeYear 
      ? `${startMonth} ${startDay}-${endDay}, ${year}`
      : `${startMonth} ${startDay}-${endDay}`;
  }
  
  // If dates span different months
  return shouldIncludeYear
    ? `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`
    : `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
}

/**
 * Format a date for day header display (e.g., "Mon", "Tue")
 * @param {Date} date - Date to format
 * @returns {string} - Short day name
 */
export function formatDayName(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Format a date number for day header display (e.g., "9", "15")
 * @param {Date} date - Date to format
 * @returns {string} - Date number as string
 */
export function formatDayNumber(date) {
  return date.getDate().toString();
}

/**
 * Format time for event display (e.g., "09:00", "14:30")
 * @param {string} timeString - Time in 24-hour format (e.g., "09:00", "14:30")
 * @returns {string} - Formatted time string in 24-hour format
 */
export function formatTime(timeString) {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const minute = parseInt(minutes, 10);
  
  const date = new Date();
  date.setHours(hour, minute);
  
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

/**
 * Check if a date is today
 * @param {Date} date - Date to check
 * @returns {boolean} - True if the date is today
 */
export function isToday(date) {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Check if two dates are the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} - True if dates are the same day
 */
export function isSameDay(date1, date2) {
  return date1.toDateString() === date2.toDateString();
}

/**
 * Get the week number for a given date (ISO week)
 * @param {Date} date - Date to get week number for
 * @returns {number} - Week number (1-53)
 */
export function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Convert time string to minutes from midnight
 * @param {string} timeString - Time in format "HH:MM" (24-hour)
 * @returns {number} - Minutes from midnight
 */
export function timeToMinutes(timeString) {
  if (!timeString) return 0;
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Get current time in minutes from midnight
 * @returns {number} - Current time in minutes from midnight
 */
export function getCurrentTimeInMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Get current time as a formatted string (HH:MM)
 * @returns {string} - Current time in HH:MM format
 */
export function getCurrentTimeString() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Calculate the position of the current time line
 * @param {number} hourHeight - Height of one hour in pixels
 * @returns {number} - Top position in pixels for the current time line
 */
export function getCurrentTimePosition(hourHeight = null) {
  const actualHourHeight = hourHeight !== null ? hourHeight : getHourHeight();
  const currentMinutes = getCurrentTimeInMinutes();
  return (currentMinutes / 60) * actualHourHeight;
}

/**
 * Get the current hour height based on screen size
 * This must match the CSS media query breakpoints exactly
 * @returns {number} - Hour height in pixels
 */
export function getHourHeight() {
  // Match the CSS media query: @media (max-width: 480px)
  return window.innerWidth <= 480 ? 50 : 60;
}

/**
 * Calculate event position and height based on start and end times
 * @param {string} startTime - Start time in "HH:MM" format
 * @param {string} endTime - End time in "HH:MM" format
 * @param {number} hourHeight - Height of one hour in pixels (auto-detected if not provided)
 * @returns {Object} - Object with top position and height in pixels
 */
export function calculateEventPosition(startTime, endTime, hourHeight = null) {
  // Auto-detect hour height if not provided
  const actualHourHeight = hourHeight !== null ? hourHeight : getHourHeight();
  
  if (!startTime) {
    return { top: 0, height: actualHourHeight };
  }

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = endTime ? timeToMinutes(endTime) : startMinutes + 60; // Default 1 hour duration
  
  const top = (startMinutes / 60) * actualHourHeight;
  const height = Math.max(((endMinutes - startMinutes) / 60) * actualHourHeight, 20); // Minimum 20px height
  
  return { top, height };
}