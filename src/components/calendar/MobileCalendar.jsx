/**
 * Main Mobile Calendar component with touch gesture support
 * Integrates NavigationHeader and WeekView with swipe navigation
 */
import React, { useState, useCallback } from 'react';
import NavigationHeader from './NavigationHeader';
import WeekView from './WeekView';
import EventModal from './EventModal';
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
  
  // Modal state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedDateForEvent, setSelectedDateForEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [suggestedTimes, setSuggestedTimes] = useState(null);

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
   * Handle date selection - opens event creation modal
   */
  const handleDateSelect = useCallback((date, suggestedTimes = null) => {
    setSelectedDate(date);
    setSelectedDateForEvent(date);
    setEditingEvent(null); // Clear any editing event
    
    // Store suggested times for the modal
    if (suggestedTimes) {
      setSuggestedTimes(suggestedTimes);
    } else {
      setSuggestedTimes(null);
    }
    
    setIsEventModalOpen(true);
  }, []);

  /**
   * Handle event click - opens event editing modal
   */
  const handleEventClick = useCallback((event) => {
    setSelectedDate(event.startDate);
    setSelectedDateForEvent(event.startDate);
    setEditingEvent(event);
    setIsEventModalOpen(true);
  }, []);

  /**
   * Handle event creation/update
   */
  const handleEventSave = useCallback(async (eventData) => {
    try {
      if (editingEvent) {
        // Call external update handler
        if (onEventUpdate) {
          await onEventUpdate(eventData);
        }
      } else {
        // Call external create handler
        if (onEventCreate) {
          await onEventCreate(eventData);
        }
      }
      
      // Close modal and reset state
      setIsEventModalOpen(false);
      setEditingEvent(null);
      setSelectedDateForEvent(null);
      setSuggestedTimes(null);
    } catch (error) {
      console.error('Error saving event:', error);
      throw error; // Re-throw to let modal handle the error
    }
  }, [editingEvent, onEventCreate, onEventUpdate]);

  /**
   * Handle event deletion
   */
  const handleEventDelete = useCallback(async (eventId) => {
    try {
      // Call external delete handler
      if (onEventDelete) {
        await onEventDelete(eventId);
      }
      
      // Close modal and reset state
      setIsEventModalOpen(false);
      setEditingEvent(null);
      setSelectedDateForEvent(null);
      setSuggestedTimes(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error; // Re-throw to let modal handle the error
    }
  }, [onEventDelete]);

  /**
   * Handle modal cancel
   */
  const handleEventModalCancel = useCallback(() => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
    setSelectedDateForEvent(null);
    setSuggestedTimes(null);
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

      {/* Event Creation/Editing Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        selectedDate={selectedDateForEvent}
        event={editingEvent}
        suggestedTimes={suggestedTimes}
        onSave={handleEventSave}
        onCancel={handleEventModalCancel}
        onDelete={editingEvent ? handleEventDelete : null}
      />
    </div>
  );
};

export default MobileCalendar;