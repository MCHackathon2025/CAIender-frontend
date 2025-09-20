import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { useCalendarEvents } from '../hooks/useCalendarEvents.js';
import NavigationHeader from './navigation/NavigationHeader.jsx';
import DefaultPage from '../pages/DefaultPage.jsx';
import MobileCalendar from './calendar/MobileCalendar';
import '../components/calendar/styles/index.css';
import '../styles/App.css';

/**
 * Main Dashboard component
 * Provides a comprehensive interface with navigation and page management
 */
const Dashboard = () => {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('default');
  const isMobile = useIsMobile();

  const {
    events,
    loading: calendarLoading,
    error: calendarError,
    loadEvents,
    handleEventCreate,
    handleEventUpdate,
    handleEventDelete
  } = useCalendarEvents(isAuthenticated);

  // Navigation handlers
  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const handleLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Calendar rendering with proper error handling
  const renderCalendarContent = () => {
    if (calendarLoading) {
      return (
        <div className="loading-container" style={{ minHeight: '400px' }}>
          <div className="loading-spinner" />
          <p className="loading-text">Loading your calendar...</p>
        </div>
      );
    }

    if (calendarError) {
      return (
        <div className="error-container" style={{ minHeight: '400px' }}>
          <div className="error-icon">⚠️</div>
          <h3 className="error-title">Error Loading Calendar</h3>
          <p className="error-message">{calendarError}</p>
          <button
            className="retry-button"
            onClick={loadEvents}
            aria-label="Retry loading calendar"
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <MobileCalendar
        initialDate={new Date()}
        events={events}
        onEventCreate={handleEventCreate}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
      />
    );
  };

  // Page content rendering
  const renderPageContent = () => {
    switch (currentPage) {
      case 'calendar':
        return (
          <div className="app">
            <div className="calendar-container">
              {renderCalendarContent()}
            </div>
          </div>
        );
      case 'default':
      default:
        return <DefaultPage />;
    }
  };

  // Main dashboard layout
  return (
    <div
      className="dashboard"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--surface-color)',
        fontFamily: 'inherit',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header with Navigation */}
      <NavigationHeader
        currentPage={currentPage}
        onPageChange={handlePageChange}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
        onLogin={handleLogin}
        loading={loading}
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <main
        className="dashboard-content"
        style={{
          flex: 1,
          padding: isMobile ? '16px' : '24px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {renderPageContent()}
      </main>
    </div>
  );
};

export default Dashboard;