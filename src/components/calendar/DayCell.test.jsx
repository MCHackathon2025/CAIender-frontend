/**
 * Tests for DayCell component
 * Verifies day header display, touch targets, and responsive design
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
    render(<DayCell date={mockDate} events={mockEvents} />);
    
    const dayCell = screen.getByRole('generic', {
      name: (name, element) => element.className.includes('day-cell')
    });
    
    expect(dayCell).toHaveClass('day-cell--has-events');
  });

  test('renders events with correct styling', () => {
    render(<DayCell date={mockDate} events={mockEvents} />);
    
    // Should render both events
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Another Event')).toBeInTheDocument();
    
    // Should display event times
    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('14:30')).toBeInTheDocument();
    
    // Should apply theme classes
    const mainEvent = screen.getByText('Test Event').closest('.event-preview');
    const infoEvent = screen.getByText('Another Event').closest('.event-preview');
    
    expect(mainEvent).toHaveClass('event-preview--main');
    expect(infoEvent).toHaveClass('event-preview--info');
  });

  test('handles date click', () => {
    const mockOnDateClick = vi.fn();
    render(<DayCell date={mockDate} onDateClick={mockOnDateClick} />);
    
    const dayCell = screen.getByRole('generic', {
      name: (name, element) => element.className.includes('day-cell')
    });
    
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
    
    const eventElement = screen.getByText('Test Event').closest('.event-preview');
    fireEvent.click(eventElement);
    
    expect(mockOnEventClick).toHaveBeenCalledWith(mockEvents[0]);
    expect(mockOnDateClick).not.toHaveBeenCalled();
  });

  test('has proper touch target sizing', () => {
    render(<DayCell date={mockDate} />);
    
    const dayCell = screen.getByRole('generic', {
      name: (name, element) => element.className.includes('day-cell')
    });
    
    // Check that the component has the day-cell class which includes min-height: 44px
    expect(dayCell).toHaveClass('day-cell');
  });

  test('renders without events', () => {
    render(<DayCell date={mockDate} />);
    
    // Should still render day header
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    
    // Should not have has-events class
    const dayCell = screen.getByRole('generic', {
      name: (name, element) => element.className.includes('day-cell')
    });
    
    expect(dayCell).not.toHaveClass('day-cell--has-events');
  });
});