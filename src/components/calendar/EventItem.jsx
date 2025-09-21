/**
 * EventItem component for displaying individual calendar events
 * Supports theme-based color coding and touch-optimized interactions
 */
import React from 'react';
import PropTypes from 'prop-types';
import { MapPin } from 'lucide-react';
import { CALENDAR_THEMES } from './theme.js';

/**
 * EventItem component for rendering individual events with theme support
 * @param {Object} props - Component props
 * @param {Object} props.event - Event object containing id, title, startTime, endTime, theme
 * @param {Function} props.onClick - Callback function when event is clicked
 * @param {Function} [props.onDelete] - Callback function when delete button is clicked
 * @param {boolean} [props.isCompact=false] - Whether to render in compact mode
 * @param {string} [props.className] - Additional CSS classes
 */
const EventItem = ({ event, onClick, onDelete, isCompact = false, className = '' }) => {
  // Handle missing event data gracefully
  if (!event) {
    return null;
  }

  const {
    id,
    title = 'Untitled Event',
    startTime = '',
    endTime = '',
    theme = 'main',
    isAllDay = false,
    location = ''
  } = event;

  // Get theme colors for the event
  const themeColors = CALENDAR_THEMES[theme] || CALENDAR_THEMES.main;

  // Format time display
  const formatTimeRange = () => {
    if (isAllDay) {
      return 'All day';
    }

    if (!startTime) {
      return '';
    }

    if (endTime && endTime !== startTime) {
      return `${startTime} - ${endTime}`;
    }

    return startTime;
  };

  // Check if location should be displayed
  const shouldShowLocation = () => {
    return location && location !== 'null' && location.trim() !== '';
  };

  // Handle click events
  const handleClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling to parent elements
    if (onClick) {
      onClick(event);
    }
  };

  // Handle keyboard events for accessibility
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  // Handle delete button click
  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling to parent elements
    e.preventDefault();
    if (onDelete) {
      onDelete(event);
    }
  };

  // Check if event should show delete button (suggestion or info themes)
  const shouldShowDeleteButton = theme === 'suggestion' || theme === 'info';

  const timeDisplay = formatTimeRange();
  const eventItemClasses = [
    'event-item',
    `event-item--${theme}`,
    isCompact ? 'event-item--compact' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={eventItemClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Event: ${title}${timeDisplay ? `, ${timeDisplay}` : ''}`}
      style={{
        '--event-primary': themeColors.primary,
        '--event-light': themeColors.light,
        '--event-dark': themeColors.dark,
        '--event-contrast': themeColors.contrast
      }}
    >
      {/* Delete button for suggestion and info events */}
      {shouldShowDeleteButton && onDelete && (
        <button
          className="event-item__delete"
          onClick={handleDeleteClick}
          aria-label={`Delete ${title}`}
          title={`Delete ${title}`}
          type="button"
        >
          ×
        </button>
      )}

      {/* Event title with truncation - more important, shown first */}
      <div
        className="event-item__title"
        title={title} // Show full title on hover
      >
        {title}
      </div>

      {/* Time display - secondary information, shown below title */}
      {timeDisplay && (
        <div className="event-item__time" aria-hidden="true">
          {timeDisplay}
        </div>
      )}

      {/* Location display - tertiary information, shown if there's space */}
      {shouldShowLocation() && (
        <div className="event-item__location" title={location}>
          <MapPin size={12} />
          <span>{location}</span>
        </div>
      )}
    </div>
  );
};

EventItem.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    theme: PropTypes.oneOf(['main', 'suggestion', 'announcement', 'info']),
    isAllDay: PropTypes.bool,
    location: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func,
  onDelete: PropTypes.func,
  isCompact: PropTypes.bool,
  className: PropTypes.string
};

export default EventItem;