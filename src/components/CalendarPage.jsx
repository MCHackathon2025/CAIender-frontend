import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import MobileCalendar from './calendar/MobileCalendar';
import { useCalendarEvents } from '../hooks/useCalendarEvents.js';
import './calendar/styles/index.css';
import './App.css';

/**
 * CalendarPage component - A protected page for calendar functionality
 * This component requires authentication and provides calendar management
 * within the context of a larger application.
 */
function CalendarPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const {
    events,
    loading: calendarLoading,
    error: calendarError,
    loadEvents,
    handleEventCreate,
    handleEventUpdate,
    handleEventDelete
  } = useCalendarEvents(isAuthenticated);

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
  const currentError = localError || calendarError;
  const isLoading = authLoading || calendarLoading;

  // Authentication loading state
  if (authLoading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p className="loading-text">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="app">
        <div className="error-container">
          <div className="error-icon">🔒</div>
          <h3 className="error-title">Authentication Required</h3>
          <p className="error-message">
            Please log in to access your calendar.
          </p>
        </div>
      </div>
    );
  }

  // Calendar loading state
  if (calendarLoading && !isRetrying) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p className="loading-text">
            Loading {user?.username ? `${user.username}'s` : 'your'} calendar...
          </p>
        </div>
      </div>
    );
  }

  // Calendar error state
  if (currentError && events.length === 0) {
    return (
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
  }

  // Success state with calendar
  return (
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
}

export default CalendarPage;