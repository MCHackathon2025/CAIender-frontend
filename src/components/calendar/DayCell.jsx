/**
 * DayCell component for individual day display
 * Displays day header with name and date number, plus events
 */
import React from 'react';
import { formatDayName, formatDayNumber } from './utils/dateUtils';
import './styles/index.css';

const DayCell = ({ 
  date, 
  events = [], 
  isToday = false, 
  isSelected = false, 
  onDateClick, 
  onEventClick 
}) => {
  const handleDateClick = () => {
    if (onDateClick) {
      onDateClick(date);
    }
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation(); // Prevent triggering date click
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const dayName = formatDayName(date);
  const dayNumber = formatDayNumber(date);
  
  // Build CSS classes for different states
  const cellClasses = [
    'day-cell',
    isToday ? 'day-cell--today' : '',
    isSelected ? 'day-cell--selected' : '',
    events.length > 0 ? 'day-cell--has-events' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={cellClasses} onClick={handleDateClick}>
      <div className="day-header">
        <div className="day-name">{dayName}</div>
        <div className="day-number">{dayNumber}</div>
      </div>
      
      <div className="day-events">
        {events.map((event) => (
          <div
            key={event.id}
            className={`event-preview event-preview--${event.theme}`}
            onClick={(e) => handleEventClick(event, e)}
          >
            <span className="event-time">{event.startTime}</span>
            <span className="event-title">{event.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DayCell;