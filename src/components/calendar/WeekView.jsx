/**
 * WeekView component for displaying 7-day calendar layout
 * Implements mobile-first design with CSS Flexbox and touch gestures
 */
import React from 'react';
import DayCell from './DayCell';
import { getWeekDays } from './utils/dateUtils';
import { useTouchGestures } from './hooks/useTouchGestures';
import './styles/index.css';

const WeekView = ({ 
  weekDays, 
  events = [], 
  selectedDate, 
  onDateSelect, 
  onEventClick,
  onSwipeLeft,
  onSwipeRight,
  isNavigating = false,
  gesturesDisabled = false
}) => {
  // If weekDays is not provided, generate from current week
  const days = weekDays || getWeekDays(new Date());

  // Set up touch gesture handling
  const { touchHandlers, isGesturing, gestureDirection } = useTouchGestures({
    onSwipeLeft,
    onSwipeRight,
    disabled: gesturesDisabled || isNavigating
  });

  return (
    <div 
      className={`week-view ${isNavigating ? 'week-view--navigating' : ''} ${isGesturing ? 'week-view--gesturing' : ''} ${gestureDirection ? `week-view--gesture-${gestureDirection}` : ''}`}
      data-testid="week-view"
      {...touchHandlers}
    >
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