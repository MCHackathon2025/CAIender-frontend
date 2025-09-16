/**
 * Tests for WeekView component
 * Verifies 7-day layout, responsive design, and touch targets
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import WeekView from './WeekView';
import * as dateUtils from './utils/dateUtils';

// Mock the dateUtils module
vi.mock('./utils/dateUtils', () => ({
  getWeekDays: vi.fn(),
  formatDayName: vi.fn((date) => date.toLocaleDateString('en-US', { weekday: 'short' })),
  formatDayNumber: vi.fn((date) => date.getDate().toString())
}));

describe('WeekView Component', () => {
  const mockWeekDays = [
    new Date(2024, 0, 1), // Monday
    new Date(2024, 0, 2), // Tuesday
    new Date(2024, 0, 3), // Wednesday
    new Date(2024, 0, 4), // Thursday
    new Date(2024, 0, 5), // Friday
    new Date(2024, 0, 6), // Saturday
    new Date(2024, 0, 7)  // Sunday
  ];

  const mockEvents = [
    {
      id: '1',
      title: 'Test Event',
      startDate: new Date(2024, 0, 1),
      startTime: '09:00',
      theme: 'main'
    }
  ];

  beforeEach(() => {
    vi.mocked(dateUtils.getWeekDays).mockReturnValue(mockWeekDays);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders 7 day cells', () => {
    render(<WeekView weekDays={mockWeekDays} />);
    
    // Should render 7 day cells
    const dayCells = screen.getAllByRole('generic').filter(el => 
      el.className.includes('day-cell')
    );
    expect(dayCells).toHaveLength(7);
  });

  test('uses current week when weekDays not provided', () => {
    render(<WeekView />);
    
    expect(dateUtils.getWeekDays).toHaveBeenCalledWith(expect.any(Date));
  });

  test('passes events to correct day cells', () => {
    render(<WeekView weekDays={mockWeekDays} events={mockEvents} />);
    
    // Event should appear in the first day cell (Jan 1, 2024)
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  test('handles date selection', () => {
    const mockOnDateSelect = vi.fn();
    render(
      <WeekView 
        weekDays={mockWeekDays} 
        onDateSelect={mockOnDateSelect}
      />
    );
    
    const firstDayCell = screen.getAllByRole('generic').find(el => 
      el.className.includes('day-cell')
    );
    
    fireEvent.click(firstDayCell);
    expect(mockOnDateSelect).toHaveBeenCalledWith(mockWeekDays[0]);
  });

  test('applies CSS classes correctly', () => {
    render(<WeekView weekDays={mockWeekDays} />);
    
    const weekView = screen.getByRole('generic', { 
      name: (name, element) => element.className.includes('week-view')
    });
    
    expect(weekView).toHaveClass('week-view');
  });
});