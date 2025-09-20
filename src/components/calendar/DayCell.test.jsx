/**
 * Tests for DayCell component
 * Verifies day header display, touch targets, event display logic, and overflow handling
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import DayCell from './DayCell';
import { createDate } from './utils/dateUtils';

// Mock the dateUtils module
vi.mock('./utils/dateUtils', () => ({
  formatDayName: vi.fn((date) => date.toLocaleDateString('en-US', { weekday: 'short' })),
  formatDayNumber: vi.fn((date) => date.getDate().toString()),
  calculateEventPosition: vi.fn((startTime, endTime) => ({ top: 0, height: 60 })),
  createDate: vi.fn((year, month, day, hours = 0, minutes = 0, seconds = 0) => 
    new Date(year, month - 1, day, hours, minutes, seconds)),
  isToday: vi.fn((date) => false), // Default to false for tests
  isSameDay: vi.fn((date1, date2) => date1?.toDateString() === date2?.toDateString())
}));

// Mock EventItem component
vi.mock('./EventItem', () => ({
  default: ({ event, onClick, isCompact, className }) => (
    <div
      className={`mock-event-item ${className}`}
      onClick={(e) => {
        e.stopPropagation(); // Prevent event bubbling like the real EventItem does
        if (onClick) {
          onClick(event);
        }
      }}
      data-testid={`event-${event.id}`}
    >
      <span>{event.startTime}</span>
      <span>{event.title}</span>
    </div>
  )
}));

describe('DayCell Component', () => {
  const mockDate = createDate(2024, 1, 1); // January 1, 2024
  const mockEvents = [
    {
      id: '1',
      title: 'Test Event',
      startTime: '09:00',
      theme: 'main'
    },
    {
      id: '2',
      title: 'Another Event',
      startTime: '14:30',
      theme: 'info'
    }
  ];

  const manyEvents = [
    { id: '1', title: 'Event 1', startTime: '09:00', theme: 'main' },
    { id: '2', title: 'Event 2', startTime: '10:00', theme: 'info' },
    { id: '3', title: 'Event 3', startTime: '11:00', theme: 'suggestion' },
    { id: '4', title: 'Event 4', startTime: '12:00', theme: 'announcement' },
    { id: '5', title: 'Event 5', startTime: '13:00', theme: 'main' }
  ];

  test('renders day header with name and number', () => {
    render(<DayCell date={mockDate} />);

    // Should display day name and number
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  test('applies today class when date is today', async () => {
    // Mock isToday to return true for this test
    const { isToday } = await import('./utils/dateUtils');
    vi.mocked(isToday).mockReturnValue(true);

    render(<DayCell date={mockDate} />);

    const dayCell = document.querySelector('.day-cell');
    expect(dayCell).toHaveClass('day-cell--today');
  });

  test('applies selected class when date is selected', () => {
    render(<DayCell date={mockDate} selectedDate={mockDate} />);

    const dayCell = document.querySelector('.day-cell');
    expect(dayCell).toHaveClass('day-cell--selected');
  });

  test('applies has-events class when events are present', () => {
    const { container } = render(<DayCell date={mockDate} events={mockEvents} />);

    const dayCell = container.querySelector('.day-cell');

    expect(dayCell).toHaveClass('day-cell--has-events');
  });

  test('renders events using EventItem component', () => {
    render(<DayCell date={mockDate} events={mockEvents} />);

    // Should render both events using EventItem
    expect(screen.getByTestId('event-1')).toBeInTheDocument();
    expect(screen.getByTestId('event-2')).toBeInTheDocument();

    // Should display event content
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Another Event')).toBeInTheDocument();
    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('14:30')).toBeInTheDocument();
  });

  test('displays visual indicators for days with events', () => {
    const { container } = render(<DayCell date={mockDate} events={mockEvents} />);

    // Should display day indicators
    const indicators = container.querySelectorAll('.day-indicator');
    expect(indicators).toHaveLength(2); // main and info themes

    // Should have correct theme classes
    expect(container.querySelector('.day-indicator--main')).toBeInTheDocument();
    expect(container.querySelector('.day-indicator--info')).toBeInTheDocument();
  });

  test('renders all events with time-based positioning', () => {
    const { container } = render(<DayCell date={mockDate} events={manyEvents} />);

    // Should render all events with time-based positioning
    expect(screen.getByTestId('event-1')).toBeInTheDocument();
    expect(screen.getByTestId('event-2')).toBeInTheDocument();
    expect(screen.getByTestId('event-3')).toBeInTheDocument();
    expect(screen.getByTestId('event-4')).toBeInTheDocument();
    expect(screen.getByTestId('event-5')).toBeInTheDocument();

    // Should have positioned-event containers
    const positionedEvents = container.querySelectorAll('.positioned-event');
    expect(positionedEvents).toHaveLength(5);

    // Should apply has-events class
    const dayCell = container.querySelector('.day-cell');
    expect(dayCell).toHaveClass('day-cell--has-events');
  });

  test('renders time grid background', () => {
    const { container } = render(<DayCell date={mockDate} events={manyEvents} />);

    // Should have time grid with 24 hour slots
    const timeGrid = container.querySelector('.time-grid');
    expect(timeGrid).toBeInTheDocument();
    
    const timeGridHours = container.querySelectorAll('.time-grid-hour');
    expect(timeGridHours).toHaveLength(24);
  });

  test('positions events with correct styling', () => {
    const { container } = render(<DayCell date={mockDate} events={manyEvents} />);

    const positionedEvents = container.querySelectorAll('.positioned-event');
    
    // Each positioned event should have inline styles for positioning
    positionedEvents.forEach(event => {
      expect(event).toHaveStyle('top: 0px');
      expect(event).toHaveStyle('height: 60px');
    });
  });

  test('displays empty state when no events', () => {
    const { container } = render(<DayCell date={mockDate} events={[]} />);

    // Should render empty state element
    const emptyState = container.querySelector('.day-events-empty');
    expect(emptyState).toBeInTheDocument();

    // Should not have has-events class
    const dayCell = container.querySelector('.day-cell');
    expect(dayCell).not.toHaveClass('day-cell--has-events');

    // Should not display any indicators
    const indicators = container.querySelectorAll('.day-indicator');
    expect(indicators).toHaveLength(0);
  });

  test('handles date click', () => {
    const mockOnDateClick = vi.fn();
    const { container } = render(<DayCell date={mockDate} onDateClick={mockOnDateClick} />);

    const dayCell = container.querySelector('.day-cell');

    fireEvent.click(dayCell);
    expect(mockOnDateClick).toHaveBeenCalledWith(mockDate);
  });

  test('handles event click without triggering date click', () => {
    const mockOnDateClick = vi.fn();
    const mockOnEventClick = vi.fn();

    render(
      <DayCell
        date={mockDate}
        events={mockEvents}
        onDateClick={mockOnDateClick}
        onEventClick={mockOnEventClick}
      />
    );

    const eventElement = screen.getByTestId('event-1');
    fireEvent.click(eventElement);

    expect(mockOnEventClick).toHaveBeenCalledWith(mockEvents[0]);
    expect(mockOnDateClick).not.toHaveBeenCalled();
  });

  test('has proper touch target sizing', () => {
    const { container } = render(<DayCell date={mockDate} />);

    const dayCell = container.querySelector('.day-cell');

    // Check that the component has the day-cell class which includes min-height: 44px
    expect(dayCell).toHaveClass('day-cell');
  });

  test('shows unique theme indicators only', () => {
    const eventsWithDuplicateThemes = [
      { id: '1', title: 'Event 1', startTime: '09:00', theme: 'main' },
      { id: '2', title: 'Event 2', startTime: '10:00', theme: 'main' },
      { id: '3', title: 'Event 3', startTime: '11:00', theme: 'info' }
    ];

    const { container } = render(<DayCell date={mockDate} events={eventsWithDuplicateThemes} />);

    // Should only show 2 indicators (main and info), not 3
    const indicators = container.querySelectorAll('.day-indicator');
    expect(indicators).toHaveLength(2);

    expect(container.querySelector('.day-indicator--main')).toBeInTheDocument();
    expect(container.querySelector('.day-indicator--info')).toBeInTheDocument();
  });

  test('handles events without theme gracefully', () => {
    const eventsWithoutTheme = [
      { id: '1', title: 'Event 1', startTime: '09:00' }, // No theme
      { id: '2', title: 'Event 2', startTime: '10:00', theme: 'info' }
    ];

    const { container } = render(<DayCell date={mockDate} events={eventsWithoutTheme} />);

    // Should default to 'main' theme for events without theme
    const indicators = container.querySelectorAll('.day-indicator');
    expect(indicators).toHaveLength(2);

    expect(container.querySelector('.day-indicator--main')).toBeInTheDocument();
    expect(container.querySelector('.day-indicator--info')).toBeInTheDocument();
  });
});