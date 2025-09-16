/**
 * Main Mobile Calendar component with touch gesture support
 * Integrates NavigationHeader and WeekView with swipe navigation
 */
import React, { useState, useCallback } from 'react';
import NavigationHeader from './NavigationHeader';
import WeekView from './WeekView';
import { 
  getCurrentWeek, 
  getWeekRange, 
  getPreviousWeek, 
  getNextWeek,
  getWeekDays 
} from './utils/dateUtils';
import './styles/index.css';

const MobileCalendar = ({ 
  initialDate = new Date(),
  events = [],
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  theme,
  locale = 'en-US'
}) => {
  // Calendar state
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Get current week range and days
  const currentWeek = getWeekRange(currentDate);
  const weekDays = getWeekDays(currentDate);

  /**
   * Navigate to previous week
   */
  const handlePreviousWeek = useCallback(() => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    const prevWeekDate = getPreviousWeek(currentDate);
    setCurrentDate(prevWeekDate);
    
    // Reset navigation state after animation
    setTimeout(() => setIsNavigating(false), 300);
  }, [currentDate, isNavigating]);

  /**
   * Navigate to next week
   */
  const handleNextWeek = useCallback(() => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    const nextWeekDate = getNextWeek(currentDate);
    setCurrentDate(nextWeekDate);
    
    // Reset navigation state after animation
    setTimeout(() => setIsNavigating(false), 300);
  }, [currentDate, isNavigating]);

  /**
   * Navigate to today
   */
  const handleTodayClick = useCallback(() => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    
    // Reset navigation state after animation
    setTimeout(() => setIsNavigating(false), 300);
  }, [isNavigating]);

  /**
   * Handle date selection
   */
  const handleDateSelect = useCallback((date) => {
    setSelectedDate(date);
    onEventCreate?.(date);
  }, [onEventCreate]);

  /**
   * Handle event click
   */
  const handleEventClick = useCallback((event) => {
    // This will be implemented in later tasks
    console.log('Event clicked:', event);
  }, []);

  return (
    <div className="mobile-calendar">
      <NavigationHeader
        currentWeek={currentWeek}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        onTodayClick={handleTodayClick}
        isNavigating={isNavigating}
      />
      
      <WeekView
        weekDays={weekDays}
        events={events}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        onEventClick={handleEventClick}
        onSwipeLeft={handleNextWeek}
        onSwipeRight={handlePreviousWeek}
        isNavigating={isNavigating}
        gesturesDisabled={false}
      />
    </div>
  );
};

export default MobileCalendar;