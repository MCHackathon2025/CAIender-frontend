/**
 * Demo component to showcase EventItem with different themes and configurations
 */
import React from 'react';
import EventItem from './EventItem.jsx';

const EventItemDemo = () => {
  // Sample events with different themes
  const sampleEvents = [
    {
      id: '1',
      title: 'Team Meeting',
      startTime: '09:00',
      endTime: '10:00',
      theme: 'main',
      isAllDay: false
    },
    {
      id: '2',
      title: 'Project Review Session',
      startTime: '14:30',
      endTime: '15:30',
      theme: 'suggestion',
      isAllDay: false
    },
    {
      id: '3',
      title: 'Important Announcement',
      startTime: '11:00',
      endTime: '11:30',
      theme: 'announcement',
      isAllDay: false
    },
    {
      id: '4',
      title: 'Information Session',
      startTime: '16:00',
      endTime: '17:00',
      theme: 'info',
      isAllDay: false
    },
    {
      id: '5',
      title: 'All Day Conference',
      startTime: '',
      endTime: '',
      theme: 'main',
      isAllDay: true
    },
    {
      id: '6',
      title: 'This is a very long event title that should be truncated with ellipsis when displayed in the calendar',
      startTime: '13:00',
      endTime: '14:00',
      theme: 'info',
      isAllDay: false
    }
  ];

  const handleEventClick = (event) => {
    console.log('Event clicked:', event);
    alert(`Clicked: ${event.title}`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h2>EventItem Component Demo</h2>
      
      <h3>Regular Events</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        {sampleEvents.slice(0, 4).map(event => (
          <EventItem
            key={event.id}
            event={event}
            onClick={handleEventClick}
          />
        ))}
      </div>

      <h3>All Day Event</h3>
      <div style={{ marginBottom: '20px' }}>
        <EventItem
          event={sampleEvents[4]}
          onClick={handleEventClick}
        />
      </div>

      <h3>Long Title (Truncated)</h3>
      <div style={{ marginBottom: '20px' }}>
        <EventItem
          event={sampleEvents[5]}
          onClick={handleEventClick}
        />
      </div>

      <h3>Compact Mode</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {sampleEvents.slice(0, 3).map(event => (
          <EventItem
            key={`compact-${event.id}`}
            event={event}
            onClick={handleEventClick}
            isCompact={true}
          />
        ))}
      </div>
    </div>
  );
};

export default EventItemDemo;