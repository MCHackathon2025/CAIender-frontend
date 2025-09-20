import { useState } from 'react'
import MobileCalendar from './components/calendar/MobileCalendar'
import { createDate } from './components/calendar/utils/dateUtils'
import './components/calendar/styles/index.css'
import './App.css'

function App() {
  // Sample events to demonstrate the calendar functionality
  // Current week: September 15-21, 2025 (Monday-Sunday)
  const [events, setEvents] = useState([
    {
      id: '1',
      title: 'Team Standup',
      startDate: createDate(2025, 9, 15, 9, 0),   // Sep 15, 2025 9:00 AM (Monday)
      endDate: createDate(2025, 9, 15, 9, 30),    // Sep 15, 2025 9:30 AM
      startTime: '09:00',
      endTime: '09:30',
      theme: 'main',
      isAllDay: false,
    },
    {
      id: '2',
      title: 'Touch Gestures Demo',
      startDate: createDate(2025, 9, 16, 14, 0),  // Sep 16, 2025 2:00 PM (Tuesday - Today!)
      endDate: createDate(2025, 9, 16, 15, 0),    // Sep 16, 2025 3:00 PM
      startTime: '14:00',
      endTime: '15:00',
      theme: 'info',
      isAllDay: false,
    },
    {
      id: '3',
      title: 'Client Presentation',
      startDate: createDate(2025, 9, 17, 10, 0),  // Sep 17, 2025 10:00 AM (Wednesday)
      endDate: createDate(2025, 9, 17, 11, 30),   // Sep 17, 2025 11:30 AM
      startTime: '10:00',
      endTime: '11:30',
      theme: 'suggestion',
      isAllDay: false,
    },
    {
      id: '4',
      title: 'Sprint Planning',
      startDate: createDate(2025, 9, 18, 13, 0),  // Sep 18, 2025 1:00 PM (Thursday)
      endDate: createDate(2025, 9, 18, 15, 0),    // Sep 18, 2025 3:00 PM
      startTime: '13:00',
      endTime: '15:00',
      theme: 'main',
      isAllDay: false,
    },
    {
      id: '5',
      title: 'Team Lunch',
      startDate: createDate(2025, 9, 19, 12, 0),  // Sep 19, 2025 12:00 PM (Friday)
      endDate: createDate(2025, 9, 19, 13, 30),   // Sep 19, 2025 1:30 PM
      startTime: '12:00',
      endTime: '13:30',
      theme: 'announcement',
      isAllDay: false,
    },
    {
      id: '6',
      title: 'Weekend Project',
      startDate: createDate(2025, 9, 20, 10, 0),  // Sep 20, 2025 10:00 AM (Saturday)
      endDate: createDate(2025, 9, 20, 12, 0),    // Sep 20, 2025 12:00 PM
      startTime: '10:00',
      endTime: '12:00',
      theme: 'info',
      isAllDay: false,
    },
  ])

  const handleEventCreate = (event) => {
    console.log('Creating event:', event)
    setEvents(prevEvents => [...prevEvents, event])
  }

  const handleEventUpdate = (updatedEvent) => {
    console.log('Updating event:', updatedEvent)
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    )
  }

  const handleEventDelete = (eventId) => {
    console.log('Deleting event:', eventId)
    setEvents(prevEvents =>
      prevEvents.filter(event => event.id !== eventId)
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
