import React from 'react';

/**
 * WeatherIcons component - Provides SVG weather icons
 * Supports different weather conditions with customizable size and color
 */
const WeatherIcons = ({
  condition = 'sunny',
  size = 24,
  color = 'currentColor',
  className = ''
}) => {
  const iconProps = {
    width: size,
    height: size,
    fill: color,
    className: className,
    viewBox: '0 0 24 24'
  };

  const icons = {
    sunny: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="5" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
        <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
          stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    cloudy: (
      <svg {...iconProps}>
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="#94a3b8" />
        <path d="M8 14a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" fill="#cbd5e1" />
      </svg>
    ),
    rainy: (
      <svg {...iconProps}>
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="#64748b" />
        <path d="M8 14a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" fill="#94a3b8" />
        <path d="M7 16l2-2 2 2 2-2 2 2" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
    ),
    stormy: (
      <svg {...iconProps}>
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="#374151" />
        <path d="M8 14a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" fill="#4b5563" />
        <path d="M13 15l-2-2 2-2 2 2-2 2z" fill="#fbbf24" />
        <path d="M11 17l-2-2 2-2 2 2-2 2z" fill="#fbbf24" />
      </svg>
    ),
    snowy: (
      <svg {...iconProps}>
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="#e2e8f0" />
        <path d="M8 14a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" fill="#f1f5f9" />
        <path d="M12 16l-1-1 1-1 1 1-1 1zM8 18l-1-1 1-1 1 1-1 1zM16 18l-1-1 1-1 1 1-1 1z" fill="#ffffff" />
      </svg>
    ),
    foggy: (
      <svg {...iconProps}>
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="#9ca3af" />
        <path d="M8 14a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" fill="#d1d5db" />
        <path d="M4 16h16M4 18h12M4 20h8" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    thermometer: (
      <svg {...iconProps}>
        <path d="M9 2a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H9z" fill="#ef4444" />
        <path d="M12 6v6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="14" r="1" fill="#ffffff" />
      </svg>
    ),
    humidity: (
      <svg {...iconProps}>
        <path d="M12 2C8.5 2 6 4.5 6 8c0 3.5 6 10 6 10s6-6.5 6-10c0-3.5-2.5-6-6-6z" fill="#3b82f6" />
        <path d="M12 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" fill="#ffffff" />
      </svg>
    ),
    wind: (
      <svg {...iconProps}>
        <path d="M3 12h18M6 8h12M9 16h6" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
        <path d="M18 8l2-2-2-2M6 16l-2 2 2 2" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    pressure: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="8" fill="none" stroke="#64748b" strokeWidth="2" />
        <path d="M12 4v8l4-4" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <text x="12" y="20" textAnchor="middle" fontSize="8" fill="#64748b">hPa</text>
      </svg>
    )
  };

  return icons[condition] || icons.sunny;
};

/**
 * Get weather condition based on temperature and humidity
 */
export const getWeatherCondition = (temperature, humidity) => {
  if (temperature < 0) return 'snowy';
  if (temperature < 10) return 'foggy';
  if (humidity > 80) return 'rainy';
  if (humidity > 60) return 'cloudy';
  if (temperature > 30) return 'sunny';
  return 'sunny';
};

/**
 * Get temperature color based on value
 */
export const getTemperatureColor = (temperature) => {
  if (temperature < 0) return '#3b82f6'; // Blue for cold
  if (temperature < 10) return '#06b6d4'; // Cyan for cool
  if (temperature < 20) return '#10b981'; // Green for mild
  if (temperature < 30) return '#f59e0b'; // Yellow for warm
  return '#ef4444'; // Red for hot
};

export default WeatherIcons;
