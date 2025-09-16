import { useState } from 'react'
import MobileCalendar from './components/calendar/MobileCalendar'
import './components/calendar/styles/index.css'
import './App.css'

function App() {
  // Sample events to demonstrate the calendar functionality
  // Current week: September 15-21, 2025 (Monday-Sunday)
  const [events] = useState([
    {
      id: '1',
      title: 'Team Standup',
      startDate: new Date(2025, 8, 15, 9, 0),   // Sep 15, 2025 9:00 AM (Monday)
      endDate: new Date(2025, 8, 15, 9, 30),    // Sep 15, 2025 9:30 AM
      startTime: '09:00',
      endTime: '09:30',
      theme: 'main',
      isAllDay: false,
    },
    {
      id: '2',
      title: 'Touch Gestures Demo',
      startDate: new Date(2025, 8, 16, 14, 0),  // Sep 16, 2025 2:00 PM (Tuesday - Today!)
      endDate: new Date(2025, 8, 16, 15, 0),    // Sep 16, 2025 3:00 PM
      startTime: '14:00',
      endTime: '15:00',
      theme: 'info',
      isAllDay: false,
    },
    {
      id: '3',
      title: 'Client Presentation',
      startDate: new Date(2025, 8, 17, 10, 0),  // Sep 17, 2025 10:00 AM (Wednesday)
      endDate: new Date(2025, 8, 17, 11, 30),   // Sep 17, 2025 11:30 AM
      startTime: '10:00',
      endTime: '11:30',
      theme: 'suggestion',
      isAllDay: false,
    },
    {
      id: '4',
      title: 'Sprint Planning',
      startDate: new Date(2025, 8, 18, 13, 0),  // Sep 18, 2025 1:00 PM (Thursday)
      endDate: new Date(2025, 8, 18, 15, 0),    // Sep 18, 2025 3:00 PM
      startTime: '13:00',
      endTime: '15:00',
      theme: 'main',
      isAllDay: false,
    },
    {
      id: '5',
      title: 'Team Lunch',
      startDate: new Date(2025, 8, 19, 12, 0),  // Sep 19, 2025 12:00 PM (Friday)
      endDate: new Date(2025, 8, 19, 13, 30),   // Sep 19, 2025 1:30 PM
      startTime: '12:00',
      endTime: '13:30',
      theme: 'announcement',
      isAllDay: false,
    },
    {
      id: '6',
      title: 'Weekend Project',
      startDate: new Date(2025, 8, 20, 10, 0),  // Sep 20, 2025 10:00 AM (Saturday)
      endDate: new Date(2025, 8, 20, 12, 0),    // Sep 20, 2025 12:00 PM
      startTime: '10:00',
      endTime: '12:00',
      theme: 'info',
      isAllDay: false,
    },
  ])

  const handleEventCreate = (date) => {
    console.log('Create event for date:', date)
    // In a real app, this would open an event creation modal
  }

  const handleEventUpdate = (event) => {
    console.log('Update event:', event)
    // In a real app, this would update the event in state/database
  }

  const handleEventDelete = (eventId) => {
    console.log('Delete event:', eventId)
    // In a real app, this would remove the event from state/database
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
