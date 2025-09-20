import React, { useState, useEffect, useCallback } from 'react';
import MobileCalendar from './MobileCalendar';
import { useCalendarEvents } from '../../hooks/useCalendarEvents.js';
import './styles/index.css';
import '../../styles/App.css';

/**
 * CalendarApp component - A standalone calendar application
 * This component manages the calendar state and provides a simple interface
 * for viewing and managing calendar events.
 */
function CalendarApp() {
  const {
    events,
    loading,
    error,
    loadEvents,
    handleEventCreate,
    handleEventUpdate,
    handleEventDelete
  } = useCalendarEvents(true); // Always authenticated for standalone app

  // Local state for component-level error handling
  const [localError, setLocalError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Clear local error when new events are loaded successfully
  useEffect(() => {
    if (events.length > 0 && localError) {
      setLocalError(null);
    }
  }, [events, localError]);

  // Enhanced retry function with loading state
  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    setLocalError(null);
    try {
      await loadEvents();
    } catch (err) {
      setLocalError('Failed to load events. Please check your connection and try again.');
      console.error('Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  }, [loadEvents]);

  // Enhanced event handlers with better error management
  const handleEventCreateWithErrorHandling = useCallback(async (eventData) => {
    try {
      setLocalError(null);
      await handleEventCreate(eventData);
    } catch (err) {
      const errorMessage = 'Failed to create event. Please try again.';
      setLocalError(errorMessage);
      console.error('Event creation error:', err);
    }
  }, [handleEventCreate]);

  const handleEventUpdateWithErrorHandling = useCallback(async (updatedEvent) => {
    try {
      setLocalError(null);
      await handleEventUpdate(updatedEvent);
    } catch (err) {
      const errorMessage = 'Failed to update event. Please try again.';
      setLocalError(errorMessage);
      console.error('Event update error:', err);
    }
  }, [handleEventUpdate]);

  const handleEventDeleteWithErrorHandling = useCallback(async (eventId) => {
    try {
      setLocalError(null);
      await handleEventDelete(eventId);
    } catch (err) {
      const errorMessage = 'Failed to delete event. Please try again.';
      setLocalError(errorMessage);
      console.error('Event deletion error:', err);
    }
  }, [handleEventDelete]);

  // Determine the current error state
  const currentError = localError || error;

  // Loading state component
  const LoadingState = () => (
    <div className="app">
      <div className="loading-container">
        <div className="loading-spinner" />
        <p className="loading-text">Loading your calendar...</p>
      </div>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className="app">
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3 className="error-title">Error Loading Calendar</h3>
        <p className="error-message">{currentError}</p>
        <button
          className="retry-button"
          onClick={handleRetry}
          disabled={isRetrying}
          aria-label="Retry loading calendar"
        >
          {isRetrying ? (
            <>
              <div className="loading-spinner" style={{
                width: '16px',
                height: '16px',
                marginRight: '8px',
                display: 'inline-block'
              }} />
              Retrying...
            </>
          ) : (
            'Try Again'
          )}
        </button>
      </div>
    </div>
  );

  // Success state with calendar
  const CalendarState = () => (
    <div className="app">
      <div className="calendar-container">
        <MobileCalendar
          initialDate={new Date()}
          events={events}
          onEventCreate={handleEventCreateWithErrorHandling}
          onEventUpdate={handleEventUpdateWithErrorHandling}
          onEventDelete={handleEventDeleteWithErrorHandling}
        />
        {/* Local error notification */}
        {localError && (
          <div
            className="error-notification"
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              backgroundColor: 'var(--error-color)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: 'var(--border-radius)',
              boxShadow: 'var(--shadow-md)',
              zIndex: 1000,
              animation: 'fadeIn 0.3s ease-out'
            }}
            role="alert"
            aria-live="polite"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️</span>
              <span>{localError}</span>
              <button
                onClick={() => setLocalError(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '18px',
                  marginLeft: '8px'
                }}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render appropriate state based on loading and error conditions
  if (loading && !isRetrying) {
    return <LoadingState />;
  }

  if (currentError && events.length === 0) {
    return <ErrorState />;
  }

  return <CalendarState />;
}

export default CalendarApp;