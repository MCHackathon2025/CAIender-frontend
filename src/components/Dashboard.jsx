import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { useCalendarEvents } from '../hooks/useCalendarEvents.js';
import NavigationHeader from './navigation/NavigationHeader.jsx';
import DefaultPage from '../pages/DefaultPage.jsx';
import MobileCalendar from './calendar/MobileCalendar';
import '../components/calendar/styles/index.css';

/**
 * Main Dashboard component
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

  const handleLogout = () => {
    logout();
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const renderCalendarContent = () => {
    if (calendarLoading) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#64748b', fontSize: '16px' }}>Loading your calendar...</p>
        </div>
      );
    }

    if (calendarError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          flexDirection: 'column',
          gap: '16px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            color: '#dc2626',
            fontSize: '48px',
            marginBottom: '16px'
          }}>⚠️</div>
          <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>Error Loading Calendar</h3>
          <p style={{ color: '#64748b', marginBottom: '16px' }}>{calendarError}</p>
          <button
            onClick={loadEvents}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header with Navigation */}
      <NavigationHeader
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
        onLogin={handleLogin}
        loading={loading}
        isMobile={isMobile}
      />

      {/* Page Content */}
      <div style={{ padding: '24px' }}>
        {currentPage === 'default' && <DefaultPage />}
        {currentPage === 'calendar' && (
          <div className="app">
            <div className="calendar-container">
              {renderCalendarContent()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
