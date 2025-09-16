/**
 * Tests for DayCell component
 * Verifies day header display, touch targets, event display logic, and overflow handling
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import DayCell from './DayCell';

// Mock the dateUtils module
vi.mock('./utils/dateUtils', () => ({
  formatDayName: vi.fn((date) => date.toLocaleDateString('en-US', { weekday: 'short' })),
  formatDayNumber: vi.fn((date) => date.getDate().toString())
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
  const mockDate = new Date(2024, 0, 1); // January 1, 2024
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

  test('applies today class when isToday is true', () => {
    render(<DayCell date={mockDate} isToday={true} />);

    const dayCell = screen.getByRole('generic', {
      name: (name, element) => element.className.includes('day-cell')
    });

    expect(dayCell).toHaveClass('day-cell--today');
  });

  test('applies selected class when isSelected is true', () => {
    render(<DayCell date={mockDate} isSelected={true} />);

    const dayCell = screen.getByRole('generic', {
      name: (name, element) => element.className.includes('day-cell')
    });

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

  test('handles overflow when more than 3 events', () => {
    const { container } = render(<DayCell date={mockDate} events={manyEvents} />);

    // Should render only first 3 events
    expect(screen.getByTestId('event-1')).toBeInTheDocument();
    expect(screen.getByTestId('event-2')).toBeInTheDocument();
    expect(screen.getByTestId('event-3')).toBeInTheDocument();

    // Should not render events 4 and 5 directly
    expect(screen.queryByTestId('event-4')).not.toBeInTheDocument();
    expect(screen.queryByTestId('event-5')).not.toBeInTheDocument();

    // Should show overflow indicator
    expect(screen.getByText('+2 more')).toBeInTheDocument();

    // Should apply overflow class
    const dayCell = container.querySelector('.day-cell');
    expect(dayCell).toHaveClass('day-cell--overflow');
  });

  test('handles overflow click', () => {
    const mockOnDateClick = vi.fn();
    render(<DayCell date={mockDate} events={manyEvents} onDateClick={mockOnDateClick} />);

    const overflowElement = screen.getByText('+2 more');
    fireEvent.click(overflowElement);

    expect(mockOnDateClick).toHaveBeenCalledWith(mockDate);
  });

  test('handles overflow keyboard interaction', () => {
    const mockOnDateClick = vi.fn();
    render(<DayCell date={mockDate} events={manyEvents} onDateClick={mockOnDateClick} />);

    const overflowElement = screen.getByText('+2 more');

    // Test Enter key
    fireEvent.keyDown(overflowElement, { key: 'Enter' });
    expect(mockOnDateClick).toHaveBeenCalledWith(mockDate);

    // Test Space key
    fireEvent.keyDown(overflowElement, { key: ' ' });
    expect(mockOnDateClick).toHaveBeenCalledTimes(2);
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