import { useState, useEffect } from 'react';
import calendarApi from '../services/calendarApi.js';

/**
 * Custom hook for managing calendar events
 */
export const useCalendarEvents = (isAuthenticated) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load events from API on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
    }
  }, [isAuthenticated]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await calendarApi.getEvents();

      if (result.success) {
        setEvents(result.events);
      } else {
        setError(result.error);
        console.error('Failed to load events:', result.error);
      }
    } catch (err) {
      const errorMessage = 'Failed to load events. Please try again.';
      setError(errorMessage);
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEventCreate = async (eventData) => {
    try {
      console.log('Creating event:', eventData);
      const result = await calendarApi.createEvent(eventData);

      if (result.success) {
        setEvents(prevEvents => [...prevEvents, result.event]);
        console.log('Event created successfully');
      } else {
        setError(result.error);
        console.error('Failed to create event:', result.error);
      }
    } catch (err) {
      const errorMessage = 'Failed to create event. Please try again.';
      setError(errorMessage);
      console.error('Error creating event:', err);
    }
  };

  const handleEventUpdate = async (updatedEvent) => {
    try {
      console.log('Updating event:', updatedEvent);
      const result = await calendarApi.updateEvent(updatedEvent.id, updatedEvent);

      if (result.success) {
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event.id === updatedEvent.id ? result.event : event
          )
        );
        console.log('Event updated successfully');
      } else {
        setError(result.error);
        console.error('Failed to update event:', result.error);
      }
    } catch (err) {
      const errorMessage = 'Failed to update event. Please try again.';
      setError(errorMessage);
      console.error('Error updating event:', err);
    }
  };

  const handleEventDelete = async (eventId) => {
    try {
      console.log('Deleting event:', eventId);
      const result = await calendarApi.deleteEvent(eventId);

      if (result.success) {
        setEvents(prevEvents =>
          prevEvents.filter(event => event.id !== eventId)
        );
        console.log('Event deleted successfully');
      } else {
        setError(result.error);
        console.error('Failed to delete event:', result.error);
      }
    } catch (err) {
      const errorMessage = 'Failed to delete event. Please try again.';
      setError(errorMessage);
      console.error('Error deleting event:', err);
    }
  };

  return {
    events,
    loading,
    error,
    loadEvents,
    handleEventCreate,
    handleEventUpdate,
    handleEventDelete
  };
};
