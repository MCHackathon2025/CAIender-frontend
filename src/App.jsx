import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Clock, MapPin, CheckCircle, X, AlertTriangle, Calendar, Home, LogIn, LogOut, User } from 'lucide-react';
import MobileCalendar from './components/calendar/MobileCalendar';
import { createDate } from './components/calendar/utils/dateUtils';
import { useAuth } from './contexts/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import calendarApi from './services/calendarApi.js';
import { fetchAllEvents } from './services/eventApi.js';
import './components/calendar/styles/index.css';
import './components/App.css';
import WeatherCard from "./components/WeatherCard";

// Custom hook for mobile detection
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Check on mount
    checkIsMobile();

    // Add event listener
    window.addEventListener('resize', checkIsMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

// Default Page component
const DefaultPage = () => {
  // Time state
  const [currentTime, setCurrentTime] = useState(new Date());

  // State management: control whether notifications are displayed
  const [showWeatherAlert, setShowWeatherAlert] = useState(true);
  const [showMeetingAlert, setShowMeetingAlert] = useState(true);

  // State for API events
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleEvents, setVisibleEvents] = useState({});

  // Auto-update time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load events from API
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const eventData = await fetchAllEvents();
        console.log('Loaded events:', eventData);
        setEvents(eventData);

        // Initialize all events as visible
        const initialVisibility = {};
        eventData.forEach(event => {
          initialVisibility[event.eventId] = true;
        });
        setVisibleEvents(initialVisibility);
      } catch (error) {
        console.error('Failed to load events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Format time display (HH:MM)
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format date display (Sep. 14 Thu.)
  const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const month = months[date.getMonth()];
    const day = date.getDate();
    const weekday = weekdays[date.getDay()];

    return `${month}. ${day} ${weekday}.`;
  };

  // Format time from ISO string to HH:MM (Taiwan time)
  const formatTimeFromISO = (isoString) => {
    if (!isoString) return 'N/A';

    try {
      const date = new Date(isoString);
      console.log('UTC time:', date.toISOString());

      if (isNaN(date.getTime())) {
        console.error('Invalid date string:', isoString);
        return isoString;
      }

      const taiwanDate = new Date(date.getTime() + (8 * 60 * 60 * 1000));
      console.log('Taiwan time:', taiwanDate.toISOString());
      const hours = taiwanDate.getUTCHours().toString().padStart(2, '0');
      const minutes = taiwanDate.getUTCMinutes().toString().padStart(2, '0');
      const result = `${hours}:${minutes}`;

      console.log('Formatted result:', result);
      return result;
    } catch (error) {
      console.error('Error parsing date:', error, isoString);
      return isoString;
    }
  };

  // Get color scheme based on event type
  const getEventStyle = (type) => {
    switch (type) {
      case 'USER_CREATE':
        return {
          color: '#10b981',
          showCheck: false
        };
      case 'BROADCAST':
        return {
          color: '#8b5cf6',
          showCheck: true
        };
      default:
        return {
          color: '#fbbf24',
          showCheck: true
        };
    }
  };

  // Hide event
  const hideEvent = (eventId) => {
    setVisibleEvents(prev => ({
      ...prev,
      [eventId]: false
    }));
  };

  // Mark event completed
  const markCompleted = (eventId) => {
    console.log('Mark completed:', eventId);
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      {/* Top Section with Weather */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #60a5fa, #93c5fd, #ffffff)',
        padding: '32px',
        textAlign: 'center'
      }}>
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          color: '#374151'
        }}>
        </div>

        <div style={{ marginTop: "32px" }}>
          <div style={{ color: "#374151", fontSize: "14px", marginBottom: "8px" }}>
            {formatDate(currentTime)}
          </div>
          <div style={{ fontSize: "60px", fontWeight: "300", color: "#374151", marginBottom: "16px" }}>
            {formatTime(currentTime)}
          </div>

          {/* WeatherCard */}
          <WeatherCard region="Hsinchu" />
        </div>
      </div>

      {/* Schedule Section */}
      <div style={{ display: 'flex' }}>
        {/* Left Side - Schedule */}
        <div style={{
          flex: 1,
          padding: '24px',
          backgroundColor: '#374151',
          color: 'white'
        }}>
          {loading ? (
            <div style={{ color: '#d1d5db', textAlign: 'center' }}>
              Loading events...
            </div>
          ) : (
            events
              .filter(event => visibleEvents[event.eventId])
              .map(event => {
                const style = getEventStyle(event.type);
                return (
                  <div key={event.eventId} style={{ marginBottom: '24px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        color: style.color,
                        fontSize: '18px',
                        fontWeight: '600'
                      }}>
                        {/* {formatTimeFromISO(event.startTime)} ~ {formatTimeFromISO(event.endTime)} {event.title} */}
                        {formatTimeFromISO(event.startTime)} ~ {formatTimeFromISO(event.endTime)} {event.title}

                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {style.showCheck && (
                          <CheckCircle
                            size={20}
                            color={style.color}
                            style={{ cursor: 'pointer' }}
                            onClick={() => markCompleted(event.eventId)}
                          />
                        )}
                        <button
                          onClick={() => hideEvent(event.eventId)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          <X size={20} color="#9ca3af" />
                        </button>
                      </div>
                    </div>
                    {event.location && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px',
                        color: '#d1d5db'
                      }}>
                        <MapPin size={16} />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.description && (
                      <div style={{
                        fontSize: '14px',
                        color: '#d1d5db',
                        marginBottom: '8px'
                      }}>
                        {event.description}
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </div>

      </div>
    </div>
  );
};

// Main Dashboard component (formerly App)
function Dashboard() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('default');
  const isMobile = useIsMobile();

  // Calendar state management
  const [events, setEvents] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarError, setCalendarError] = useState(null);

  // Load events from API on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
    }
  }, [isAuthenticated]);

  const loadEvents = async () => {
    try {
      setCalendarLoading(true);
      setCalendarError(null);
      const result = await calendarApi.getEvents();

      if (result.success) {
        setEvents(result.events);
      } else {
        setCalendarError(result.error);
        console.error('Failed to load events:', result.error);
      }
    } catch (err) {
      const errorMessage = 'Failed to load events. Please try again.';
      setCalendarError(errorMessage);
      console.error('Error loading events:', err);
    } finally {
      setCalendarLoading(false);
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
        setCalendarError(result.error);
        console.error('Failed to create event:', result.error);
      }
    } catch (err) {
      const errorMessage = 'Failed to create event. Please try again.';
      setCalendarError(errorMessage);
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
        setCalendarError(result.error);
        console.error('Failed to update event:', result.error);
      }
    } catch (err) {
      const errorMessage = 'Failed to update event. Please try again.';
      setCalendarError(errorMessage);
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
        setCalendarError(result.error);
        console.error('Failed to delete event:', result.error);
      }
    } catch (err) {
      const errorMessage = 'Failed to delete event. Please try again.';
      setCalendarError(errorMessage);
      console.error('Error deleting event:', err);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header with Navigation */}
      <div style={{
        backgroundColor: '#374151',
        color: 'white',
        padding: '16px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>

          {/* Navigation Menu */}
          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            <button
              onClick={() => setCurrentPage('default')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '0px' : '8px',
                padding: isMobile ? '8px' : '8px 16px',
                backgroundColor: currentPage === 'default' ? '#1f2937' : 'transparent',
                color: 'white',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (currentPage !== 'default') {
                  e.target.style.backgroundColor = '#4b5563';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 'default') {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Home size={16} />
              {!isMobile && 'Home'}
            </button>

            <button
              onClick={() => setCurrentPage('calendar')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '0px' : '8px',
                padding: isMobile ? '8px' : '8px 16px',
                backgroundColor: currentPage === 'calendar' ? '#1f2937' : 'transparent',
                color: 'white',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (currentPage !== 'calendar') {
                  e.target.style.backgroundColor = '#4b5563';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 'calendar') {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Calendar size={16} />
              {!isMobile && 'Calendar'}
            </button>
          </div>

          {/* User Authentication Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {loading ? (
              <div style={{
                color: '#9ca3af',
                fontSize: '14px'
              }}>
                Loading...
              </div>
            ) : isAuthenticated ? (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}>
                  <User size={16} />
                  <span>Welcome, {user?.username}</span>
                </div>
                <button
                  onClick={logout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '0px' : '8px',
                    padding: isMobile ? '8px' : '8px 16px',
                    backgroundColor: 'transparent',
                    color: 'white',
                    border: '1px solid #4b5563',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#4b5563';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <LogOut size={16} />
                  {!isMobile && 'Logout'}
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '0px' : '8px',
                  padding: isMobile ? '8px' : '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: '1px solid #3b82f6',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#3b82f6';
                }}
              >
                <LogIn size={16} />
                {!isMobile && 'Login'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div style={{ padding: '24px' }}>
        {currentPage === 'default' && <DefaultPage />}
        {currentPage === 'calendar' && (
          <div className="app">
            <div className="calendar-container">
              {calendarLoading ? (
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
              ) : calendarError ? (
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
              ) : (
                <MobileCalendar
                  initialDate={new Date()}
                  events={events}
                  onEventCreate={handleEventCreate}
                  onEventUpdate={handleEventUpdate}
                  onEventDelete={handleEventDelete}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main App component with routing
function App() {
  return (
    <Router>
      <Routes>
        {/* Public route - Login page */}
        <Route
          path="/login"
          element={
            <ProtectedRoute requireAuth={false}>
              <LoginPage />
            </ProtectedRoute>
          }
        />

        {/* Protected routes - Main application */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;