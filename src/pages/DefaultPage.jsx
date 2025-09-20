import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle, X } from 'lucide-react';
import { fetchAllEvents } from '../services/eventApi.js';
import WeatherCard from '../components/WeatherCard';

/**
 * Default page component showing time, weather, and schedule
 */
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

export default DefaultPage;
