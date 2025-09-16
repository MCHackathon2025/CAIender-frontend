/**
 * WeekView component for displaying 7-day calendar layout
 * Implements mobile-first design with CSS Flexbox
 */
import React from 'react';
import DayCell from './DayCell';
import { getWeekDays } from './utils/dateUtils';
import './styles/index.css';

const WeekView = ({ 
  weekDays, 
  events = [], 
  selectedDate, 
  onDateSelect, 
  onEventClick 
}) => {
  // If weekDays is not provided, generate from current week
  const days = weekDays || getWeekDays(new Date());

  return (
    <div className="week-view">
      {days.map((date, index) => {
        // Filter events for this specific date
        const dayEvents = events.filter(event => {
          const eventDate = new Date(event.startDate);
          return eventDate.toDateString() === date.toDateString();
        });

        return (
          <DayCell
            key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
            date={date}
            events={dayEvents}
            isToday={date.toDateString() === new Date().toDateString()}
            isSelected={selectedDate && date.toDateString() === selectedDate.toDateString()}
            onDateClick={onDateSelect}
            onEventClick={onEventClick}
          />
        );
      })}
    </div>
  );
};

export default WeekView;