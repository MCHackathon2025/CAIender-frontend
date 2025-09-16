/**
 * DayCell component for individual day display
 * Displays day header with name and date number, plus events with time-based positioning
 */
import React from 'react';
import { formatDayName, formatDayNumber, calculateEventPosition, getHourHeight } from './utils/dateUtils';
import EventItem from './EventItem';
import './styles/index.css';

const DayCell = ({ 
  date, 
  events = [], 
  isToday = false, 
  isSelected = false, 
  onDateClick, 
  onEventClick 
}) => {
  // Configuration for event display
  const MAX_VISIBLE_EVENTS = 3; // Maximum events to show before overflow
  const visibleEvents = events.slice(0, MAX_VISIBLE_EVENTS);
  const hiddenEventsCount = Math.max(0, events.length - MAX_VISIBLE_EVENTS);
  const hasOverflow = hiddenEventsCount > 0;

  const handleDateClick = () => {
    if (onDateClick) {
      onDateClick(date);
    }
  };

  const handleEventClick = (event) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const handleOverflowClick = (e) => {
    e.stopPropagation(); // Prevent triggering date click
    // Trigger date click to show all events (could open modal or expand view)
    if (onDateClick) {
      onDateClick(date);
    }
  };

  const dayName = formatDayName(date);
  const dayNumber = formatDayNumber(date);
  
  // Build CSS classes for different states
  const cellClasses = [
    'day-cell',
    isToday ? 'day-cell--today' : '',
    isSelected ? 'day-cell--selected' : '',
    events.length > 0 ? 'day-cell--has-events' : '',
    hasOverflow ? 'day-cell--overflow' : ''
  ].filter(Boolean).join(' ');

  // Get unique themes from events for visual indicators
  const eventThemes = [...new Set(events.map(event => event.theme || 'main'))];

  return (
    <div className={cellClasses} onClick={handleDateClick}>
      <div className="day-cell-header">
        <div className="day-header">
          <div className="day-name">{dayName}</div>
          <div className="day-number">
            {dayNumber}
            {/* Visual indicators for days with events */}
            {events.length > 0 && (
              <div className="day-indicators">
                {eventThemes.map((theme, index) => (
                  <div 
                    key={theme}
                    className={`day-indicator day-indicator--${theme}`}
                    aria-hidden="true"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="day-cell-content">
        <div className="day-events">
          {/* Time grid background */}
          <div className="time-grid">
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="time-grid-hour" />
            ))}
          </div>
          
          {events.length === 0 ? (
            // Empty state display
            <div className="day-events-empty" aria-label="No events scheduled">
              {/* Empty state - no visual content needed, just accessible label */}
            </div>
          ) : (
            <>
              {/* Render all events with time-based positioning */}
              {events.map((event) => {
                const position = calculateEventPosition(event.startTime, event.endTime);
                return (
                  <div
                    key={event.id}
                    className="positioned-event"
                    style={{
                      top: `${position.top}px`,
                      height: `${position.height}px`,
                    }}
                  >
                    <EventItem
                      event={event}
                      onClick={(event) => handleEventClick(event)}
                      isCompact={false}
                      className="day-cell-event"
                    />
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayCell;