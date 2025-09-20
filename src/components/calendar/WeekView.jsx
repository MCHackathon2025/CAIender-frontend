/**
 * WeekView component for displaying 7-day calendar layout
 * Implements mobile-first design with CSS Flexbox and touch gestures
 */
import React, { useState, useEffect } from 'react';
import DayCell from './DayCell';
import CurrentTimeLine from './CurrentTimeLine';
import EventItem from './EventItem';
import { getWeekDays, calculateEventPosition, getHourHeight, isToday, isSameDay } from './utils/dateUtils';
import { useTouchGestures } from './hooks/useTouchGestures';
import './styles/index.css';

const WeekView = ({
  weekDays,
  events = [],
  selectedDate,
  onDateSelect,
  onDateClick,
  onEventClick,
  onEventDelete,
  onSwipeLeft,
  onSwipeRight,
  isNavigating = false,
  gesturesDisabled = false
}) => {
  // If weekDays is not provided, generate from current week
  const days = weekDays || getWeekDays(new Date());

  // Track window size changes to ensure alignment stays correct
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const handleResize = () => {
      // Force re-render when window size changes to recalculate positions
      forceUpdate({});
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set up touch gesture handling
  const { touchHandlers, isGesturing, gestureDirection } = useTouchGestures({
    onSwipeLeft,
    onSwipeRight,
    disabled: gesturesDisabled || isNavigating
  });

  // Generate time slots for 24-hour format
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div
      className={`week-view ${isNavigating ? 'week-view--navigating' : ''} ${isGesturing ? 'week-view--gesturing' : ''} ${gestureDirection ? `week-view--gesture-${gestureDirection}` : ''}`}
      data-testid="week-view"
      {...touchHandlers}
    >
      {/* Headers Row - Sticky */}
      <div className="week-headers">
        <div className="time-scale-header"></div>
        <div className="day-headers">
          {days.map((date, index) => {
            const dayIsToday = isToday(date);
            const dayIsSelected = selectedDate && isSameDay(date, selectedDate);

            return (
              <div
                key={`header-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
                className={`day-header-cell ${dayIsToday ? 'day-header-cell--today' : ''} ${dayIsSelected ? 'day-header-cell--selected' : ''}`}
                onClick={() => onDateClick && onDateClick(date)}
              >
                <div className="day-name">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className="day-number">{date.getDate()}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="week-content">
        {/* Time Scale Column */}
        <div className="time-scale-slots">
          {timeSlots.map((time, index) => (
            <div key={time} className="time-slot">
              {time}
            </div>
          ))}
        </div>

        {/* Days Content */}
        <div className="days-content">
          {days.map((date, index) => {
            // Filter events for this specific date
            const dayEvents = events.filter(event => {
              const eventDate = new Date(event.startDate);
              return eventDate.toDateString() === date.toDateString();
            });

            // Handle click on day content to create event at specific time
            const handleDayContentClick = (e) => {
              if (!onDateSelect) return;

              // Don't create event if clicking on an existing event
              if (e.target.closest('.positioned-event')) {
                return;
              }

              // Get the click position relative to the day content
              const rect = e.currentTarget.getBoundingClientRect();
              const clickY = e.clientY - rect.top;

              // Calculate the hour based on click position
              // Each hour takes up rect.height / 24 pixels
              const hourHeight = rect.height / 24;
              const clickedHour = Math.floor(clickY / hourHeight);

              // Ensure hour is within valid range (0-23)
              const hour = Math.max(0, Math.min(23, clickedHour));

              // Create time strings
              const startTime = `${hour.toString().padStart(2, '0')}:00`;
              const endHour = hour < 23 ? hour + 1 : 23;
              const endMinute = hour < 23 ? 0 : 30;
              const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

              // Call onDateSelect with date and suggested times
              onDateSelect(date, { startTime, endTime });
            };

            const dayIsToday = isToday(date);
            const dayIsSelected = selectedDate && isSameDay(date, selectedDate);

            return (
              <div
                key={`content-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
                className={`day-content ${dayIsToday ? 'day-content--today' : ''} ${dayIsSelected ? 'day-content--selected' : ''}`}
                onClick={handleDayContentClick}
                style={{ cursor: 'pointer' }}
              >
                {/* Time Grid Background */}
                <div className="time-grid">
                  {Array.from({ length: 24 }, (_, hour) => (
                    <div key={hour} className="time-grid-hour" />
                  ))}
                </div>

                {/* Current Time Line */}
                <CurrentTimeLine date={date} />

                {/* Events */}
                {dayEvents.map((event) => {
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
                        onClick={onEventClick}
                        onDelete={onEventDelete}
                        isCompact={false}
                        className="day-cell-event"
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeekView;