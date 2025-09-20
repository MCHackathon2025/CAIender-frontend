import { useState, useEffect } from 'react'
import MobileCalendar from './calendar/MobileCalendar'
import calendarAPI from '../services/calendarAPI.js'
import './calendar/styles/index.css'
import './App.css'

function App() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load events from API on component mount
  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await calendarAPI.getEvents()

      if (result.success) {
        setEvents(result.events)
      } else {
        setError(result.error)
        console.error('Failed to load events:', result.error)
      }
    } catch (err) {
      const errorMessage = 'Failed to load events. Please try again.'
      setError(errorMessage)
      console.error('Error loading events:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEventCreate = async (eventData) => {
    try {
      console.log('Creating event:', eventData)
      const result = await calendarAPI.createEvent(eventData)

      if (result.success) {
        setEvents(prevEvents => [...prevEvents, result.event])
        console.log('Event created successfully')
      } else {
        setError(result.error)
        console.error('Failed to create event:', result.error)
      }
    } catch (err) {
      const errorMessage = 'Failed to create event. Please try again.'
      setError(errorMessage)
      console.error('Error creating event:', err)
    }
  }

  const handleEventUpdate = async (updatedEvent) => {
    try {
      console.log('Updating event:', updatedEvent)
      const result = await calendarAPI.updateEvent(updatedEvent.id, updatedEvent)

      if (result.success) {
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event.id === updatedEvent.id ? result.event : event
          )
        )
        console.log('Event updated successfully')
      } else {
        setError(result.error)
        console.error('Failed to update event:', result.error)
      }
    } catch (err) {
      const errorMessage = 'Failed to update event. Please try again.'
      setError(errorMessage)
      console.error('Error updating event:', err)
    }
  }

  const handleEventDelete = async (eventId) => {
    try {
      console.log('Deleting event:', eventId)
      const result = await calendarAPI.deleteEvent(eventId)

      if (result.success) {
        setEvents(prevEvents =>
          prevEvents.filter(event => event.id !== eventId)
        )
        console.log('Event deleted successfully')
      } else {
        setError(result.error)
        console.error('Failed to delete event:', result.error)
      }
    } catch (err) {
      const errorMessage = 'Failed to delete event. Please try again.'
      setError(errorMessage)
      console.error('Error deleting event:', err)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="app">
        <div className="calendar-container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
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
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="app">
        <div className="calendar-container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
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
          <p style={{ color: '#64748b', marginBottom: '16px' }}>{error}</p>
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
      </div>
    )
  }

  return (
    <div className="app">
      <div className="calendar-container">
        <MobileCalendar
          initialDate={new Date()}
          events={events}
          onEventCreate={handleEventCreate}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
        />
      </div>
    </div>
  )
}

export default App
