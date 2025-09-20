/**
 * Theme constants and color schemes for the Mobile Calendar component
 */

/**
 * Predefined event color themes
 */
export const CALENDAR_THEMES = {
  main: {
    primary: '#4caf50',    // Green
    light: '#c8e6c9',      // Light green
    dark: '#2e7d32',       // Dark green
    contrast: '#ffffff'     // White text
  },
  suggestion: {
    primary: '#ffc107',    // Yellow
    light: '#fff3c4',      // Light yellow
    dark: '#f57f17',       // Dark yellow
    contrast: '#000000'     // Black text
  },
  announcement: {
    primary: '#9c27b0',    // Purple
    light: '#e1bee7',      // Light purple
    dark: '#6a1b9a',       // Dark purple
    contrast: '#ffffff'     // White text
  },
  info: {
    primary: '#2196f3',    // Blue
    light: '#bbdefb',      // Light blue
    dark: '#1565c0',       // Dark blue
    contrast: '#ffffff'     // White text
  }
};

/**
 * Default calendar theme configuration
 */
export const DEFAULT_CALENDAR_THEME = {
  primary: '#4caf50',      // Primary green color
  secondary: '#f5f5f5',    // Light gray
  accent: '#2196f3',       // Blue accent
  background: '#ffffff',   // White background
  surface: '#fafafa',      // Light surface color
  text: {
    primary: '#212121',    // Dark gray text
    secondary: '#757575',  // Medium gray text
    disabled: '#bdbdbd'    // Light gray disabled text
  },
  eventColors: CALENDAR_THEMES
};

/**
 * Material Design elevation shadows
 */
export const ELEVATION_SHADOWS = {
  1: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  2: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
  3: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  4: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
  5: '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)'
};

/**
 * Common border radius values
 */
export const BORDER_RADIUS = {
  small: '4px',
  medium: '8px',
  large: '12px',
  round: '50%'
};

/**
 * Touch target sizes for mobile optimization
 */
export const TOUCH_TARGETS = {
  minimum: '44px',    // Minimum touch target size
  comfortable: '48px', // Comfortable touch target size
  large: '56px'       // Large touch target size
};

/**
 * Animation durations and easing
 */
export const ANIMATIONS = {
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms'
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)'
  }
};

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  large: '1200px'
};