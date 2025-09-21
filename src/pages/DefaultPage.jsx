import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle, X, Navigation } from 'lucide-react';
import { fetchAllEvents, updateEvent, deleteEvent } from '../services/eventApi.js';
import WeatherCard from '../components/weather/WeatherCard';
import { getWeatherCondition } from '../components/weather/WeatherIcons';
import { useGPS } from '../hooks/useGPS';
import '../components/gps/GPSPermissionModal.css';
import '../styles/WeatherBackgrounds.css';


/**
 * Default page component showing time, weather, and schedule
 */
const DefaultPage = () => {
  // Time state
  const [currentTime, setCurrentTime] = useState(new Date());

  // Weather state for background
  const [weatherData, setWeatherData] = useState(null);

  // State management: control whether notifications are displayed
  const [showWeatherAlert, setShowWeatherAlert] = useState(true);
  const [showMeetingAlert, setShowMeetingAlert] = useState(true);

  // State for API events
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleEvents, setVisibleEvents] = useState({});

  // GPS hook for navigation
  const {
    coordinates,
    getCurrentLocation
  } = useGPS();

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

  // Load weather data for background
  useEffect(() => {
    const loadWeatherData = async () => {
      try {
        const { fetchWeather } = await import('../services/weatherApi');
        const weather = await fetchWeather('Hsinchu');
        setWeatherData(weather);
      } catch (error) {
        console.error('Failed to load weather data:', error);
      }
    };

    loadWeatherData();
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
          showCheck: false,
          showDelete: false
        };
      case 'BROADCAST':
        return {
          color: '#8b5cf6',
          showCheck: true,
          showDelete: true
        };
      case 'AI_SUGGESTION':
      case 'AI_RECOMMENDATION':
        return {
          color: '#fbbf24',
          showCheck: true,
          showDelete: true
        };
      default:
        return {
          color: '#fbbf24',
          showCheck: true,
          showDelete: true
        };
    }
  };

  // Delete event - call GraphQL delete mutation
  const deleteSuggestedEvent = async (eventId) => {
    try {
      console.log('Deleting event:', eventId);
      await deleteEvent(eventId);

      // Remove the event from local state
      setEvents(prevEvents =>
        prevEvents.filter(event => event.eventId !== eventId)
      );

      console.log('Event deleted successfully');
    } catch (error) {
      console.error('Failed to delete event:', error);
      // On error, just hide it locally as fallback
      setVisibleEvents(prev => ({
        ...prev,
        [eventId]: false
      }));
    }
  };

  // Accept suggested event - update type to USER_CREATE (main theme)
  const acceptEvent = async (eventId) => {
    try {
      console.log('Accepting event:', eventId);
      const updatedEvent = await updateEvent({
        eventID: eventId,
        type: 'USER_CREATE'
      });

      // Update the local events state with the updated event
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.eventId === eventId ? { ...event, type: 'USER_CREATE' } : event
        )
      );

      console.log('Event accepted successfully:', updatedEvent);
    } catch (error) {
      console.error('Failed to accept event:', error);
    }
  };

  // Navigate to event location using Google Maps
  const navigateToLocation = async (location) => {
    try {
      // Get current location (this will trigger browser permission request if needed)
      let fromLocation;
      if (coordinates) {
        fromLocation = `${coordinates.latitude},${coordinates.longitude}`;
      } else {
        try {
          // This will show the browser's native permission dialog
          const coords = await getCurrentLocation();
          fromLocation = `${coords.latitude},${coords.longitude}`;
        } catch (error) {
          console.error('Failed to get location:', error);
          // If GPS fails, just open destination in Google Maps without navigation
          const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(location)}?force=pwa&source=pwa`;
          window.open(mapsUrl, '_blank', 'noopener,noreferrer');
          return;
        }
      }

      // Open Google Maps with navigation from current location to destination
      const mapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(fromLocation)}/${encodeURIComponent(location)}?force=pwa&source=pwa`;
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');

    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback: just show the destination
      const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(location)}?force=pwa&source=pwa`;
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    }
  };


  // Filter events to only show future events (starting after current time)
  const getFutureEvents = () => {
    const now = new Date();
    return events.filter(event => {
      if (!event.startTime) return false;

      try {
        const eventStartTime = new Date(event.startTime);
        return eventStartTime > now;
      } catch (error) {
        console.error('Error parsing event start time:', event.startTime, error);
        return false;
      }
    });
  };

  // Group events by date and sort them
  const getEventsByDate = () => {
    const futureEvents = getFutureEvents()
      .filter(event => visibleEvents[event.eventId])
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    // Limit to maximum 10 events to keep dashboard clean
    const maxEvents = 10;
    const limitedEvents = futureEvents.slice(0, maxEvents);

    const eventsByDate = {};

    limitedEvents.forEach(event => {
      if (!event.startTime) return;

      try {
        const eventDate = new Date(event.startTime);
        const dateKey = eventDate.toDateString();

        if (!eventsByDate[dateKey]) {
          eventsByDate[dateKey] = [];
        }
        eventsByDate[dateKey].push(event);
      } catch (error) {
        console.error('Error parsing event date:', event.startTime, error);
      }
    });

    return eventsByDate;
  };

  // Format date for display (e.g., "Today", "Tomorrow", "Dec 25")
  const formatEventDate = (dateString) => {
    try {
      const eventDate = new Date(dateString);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      // Reset time to compare only dates
      const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

      if (eventDateOnly.getTime() === todayOnly.getTime()) {
        return 'Today';
      } else if (eventDateOnly.getTime() === tomorrowOnly.getTime()) {
        return 'Tomorrow';
      } else {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const month = months[eventDate.getMonth()];
        const day = eventDate.getDate();
        const weekday = weekdays[eventDate.getDay()];

        return `${weekday}, ${month} ${day}`;
      }
    } catch (error) {
      console.error('Error formatting event date:', dateString, error);
      return dateString;
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      {/* Top Section with Weather */}
      <div className={`weather-background ${weatherData ? getWeatherCondition(weatherData.temperature, weatherData.humidity) : 'default'}`}>
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          color: '#374151'
        }}>
        </div>

        <div className="weather-content" style={{ marginTop: "32px" }}>
          <div style={{ color: "#374151", fontSize: "14px", marginBottom: "8px" }}>
            {formatDate(currentTime)}
          </div>
          <div style={{ fontSize: "60px", fontWeight: "300", color: "#374151", marginBottom: "16px" }}>
            {formatTime(currentTime)}
          </div>

          {/* WeatherCard */}
          <WeatherCard region="Hsinchu" showDetails={true} refreshInterval={300000} />
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
            (() => {
              const eventsByDate = getEventsByDate();
              const sortedDates = Object.keys(eventsByDate).sort((a, b) => new Date(a) - new Date(b));

              if (sortedDates.length === 0) {
                return (
                  <div style={{ color: '#d1d5db', textAlign: 'center', padding: '20px' }}>
                    No upcoming events
                  </div>
                );
              }

              return (
                <div>
                  {sortedDates.map(dateKey => (
                    <div key={dateKey}>
                      {/* Date Header */}
                      <div style={{
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '600',
                        marginBottom: '16px',
                        paddingBottom: '8px',
                        borderBottom: '1px solid #4b5563'
                      }}>
                        {formatEventDate(dateKey)}
                      </div>

                      {/* Events for this date */}
                      {eventsByDate[dateKey].map(event => {
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
                                {event.location && event.location !== 'null' && event.location.trim() !== '' && (
                                  <button
                                    onClick={() => navigateToLocation(event.location)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      padding: 0,
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}
                                    title={`Navigate to ${event.location}`}
                                  >
                                    <Navigation size={20} color="white" />
                                  </button>
                                )}
                                {style.showCheck && (
                                  <CheckCircle
                                    size={20}
                                    color={style.color}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => acceptEvent(event.eventId)}
                                  />
                                )}
                                {style.showDelete && (
                                  <button
                                    onClick={() => deleteSuggestedEvent(event.eventId)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      padding: 0
                                    }}
                                  >
                                    <X size={20} color="#9ca3af" />
                                  </button>
                                )}
                              </div>
                            </div>
                            {event.location && event.location !== 'null' && event.location.trim() !== '' && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginBottom: '8px',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: '400'
                              }}>
                                <MapPin size={14} />
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
                      })}
                    </div>
                  ))}
                </div>
              );
            })()
          )}
        </div>
      </div>

    </div>
  );
};

export default DefaultPage;
