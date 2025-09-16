/**
 * Tests for WeekView component with touch gesture support
 * Tests integration of touch gestures with week navigation
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import WeekView from './WeekView';
import { getWeekDays } from './utils/dateUtils';

// Mock the useTouchGestures hook
vi.mock('./hooks/useTouchGestures', () => ({
  useTouchGestures: vi.fn(() => ({
    touchHandlers: {
      onTouchStart: vi.fn(),
      onTouchMove: vi.fn(),
      onTouchEnd: vi.fn(),
      onTouchCancel: vi.fn(),
    },
    isGesturing: false,
    gestureDirection: null,
  })),
}));

describe('WeekView with Touch Gestures', () => {
  const mockOnSwipeLeft = vi.fn();
  const mockOnSwipeRight = vi.fn();
  const mockOnDateSelect = vi.fn();
  const mockOnEventClick = vi.fn();

  const defaultProps = {
    weekDays: getWeekDays(new Date('2024-01-15')), // Monday Jan 15, 2024
    events: [],
    selectedDate: null,
    onDateSelect: mockOnDateSelect,
    onEventClick: mockOnEventClick,
    onSwipeLeft: mockOnSwipeLeft,
    onSwipeRight: mockOnSwipeRight,
    isNavigating: false,
    gesturesDisabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render week view with touch handlers', () => {
    render(<WeekView {...defaultProps} />);
    
    const weekView = screen.getByTestId('week-view');
    expect(weekView).toHaveClass('week-view');
    
    // Should render 7 day cells
    const dayCells = document.querySelectorAll('.day-cell');
    expect(dayCells).toHaveLength(7);
  });

  it('should apply correct CSS classes based on state', async () => {
    const { useTouchGestures } = await import('./hooks/useTouchGestures');
    const { rerender } = render(<WeekView {...defaultProps} />);
    
    let weekView = screen.getByTestId('week-view');
    expect(weekView).toHaveClass('week-view');
    expect(weekView).not.toHaveClass('week-view--navigating');
    expect(weekView).not.toHaveClass('week-view--gesturing');

    // Test navigating state
    rerender(<WeekView {...defaultProps} isNavigating={true} />);
    weekView = screen.getByTestId('week-view');
    expect(weekView).toHaveClass('week-view--navigating');

    // Test gesturing state (would be set by the hook in real usage)
    useTouchGestures.mockReturnValue({
      touchHandlers: {
        onTouchStart: vi.fn(),
        onTouchMove: vi.fn(),
        onTouchEnd: vi.fn(),
        onTouchCancel: vi.fn(),
      },
      isGesturing: true,
      gestureDirection: 'left',
    });

    rerender(<WeekView {...defaultProps} />);
    weekView = screen.getByTestId('week-view');
    expect(weekView).toHaveClass('week-view--gesturing');
    expect(weekView).toHaveClass('week-view--gesture-left');
  });

  it('should pass correct props to useTouchGestures hook', async () => {
    const { useTouchGestures } = await import('./hooks/useTouchGestures');
    
    render(<WeekView {...defaultProps} />);
    
    expect(useTouchGestures).toHaveBeenCalledWith({
      onSwipeLeft: mockOnSwipeLeft,
      onSwipeRight: mockOnSwipeRight,
      disabled: false, // gesturesDisabled: false, isNavigating: false
    });
  });

  it('should disable gestures when gesturesDisabled is true', async () => {
    const { useTouchGestures } = await import('./hooks/useTouchGestures');
    
    render(<WeekView {...defaultProps} gesturesDisabled={true} />);
    
    expect(useTouchGestures).toHaveBeenCalledWith({
      onSwipeLeft: mockOnSwipeLeft,
      onSwipeRight: mockOnSwipeRight,
      disabled: true,
    });
  });

  it('should disable gestures when isNavigating is true', async () => {
    const { useTouchGestures } = await import('./hooks/useTouchGestures');
    
    render(<WeekView {...defaultProps} isNavigating={true} />);
    
    expect(useTouchGestures).toHaveBeenCalledWith({
      onSwipeLeft: mockOnSwipeLeft,
      onSwipeRight: mockOnSwipeRight,
      disabled: true,
    });
  });

  it('should render events for correct dates', () => {
    const events = [
      {
        id: '1',
        title: 'Test Event',
        startDate: new Date('2024-01-15T10:00:00'), // Monday
        endDate: new Date('2024-01-15T11:00:00'),
        startTime: '10:00',
        endTime: '11:00',
        theme: 'main',
      },
      {
        id: '2',
        title: 'Another Event',
        startDate: new Date('2024-01-17T14:00:00'), // Wednesday
        endDate: new Date('2024-01-17T15:00:00'),
        startTime: '14:00',
        endTime: '15:00',
        theme: 'info',
      },
    ];

    render(<WeekView {...defaultProps} events={events} />);
    
    // Events should be filtered and passed to the correct DayCell components
    // This is tested indirectly through the component structure
    expect(screen.getByText('15')).toBeInTheDocument(); // Monday
    expect(screen.getByText('17')).toBeInTheDocument(); // Wednesday
  });

  it('should handle date selection', () => {
    render(<WeekView {...defaultProps} />);
    
    const mondayCell = screen.getByText('15').closest('.day-cell');
    fireEvent.click(mondayCell);
    
    expect(mockOnDateSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        getDate: expect.any(Function),
      })
    );
  });

  it('should apply gesture direction classes correctly', async () => {
    const { useTouchGestures } = await import('./hooks/useTouchGestures');
    
    // Test right gesture
    useTouchGestures.mockReturnValue({
      touchHandlers: {
        onTouchStart: vi.fn(),
        onTouchMove: vi.fn(),
        onTouchEnd: vi.fn(),
        onTouchCancel: vi.fn(),
      },
      isGesturing: true,
      gestureDirection: 'right',
    });

    const { rerender } = render(<WeekView {...defaultProps} />);
    let weekView = screen.getByTestId('week-view');
    expect(weekView).toHaveClass('week-view--gesture-right');

    // Test left gesture
    useTouchGestures.mockReturnValue({
      touchHandlers: {
        onTouchStart: vi.fn(),
        onTouchMove: vi.fn(),
        onTouchEnd: vi.fn(),
        onTouchCancel: vi.fn(),
      },
      isGesturing: true,
      gestureDirection: 'left',
    });

    rerender(<WeekView {...defaultProps} />);
    weekView = screen.getByTestId('week-view');
    expect(weekView).toHaveClass('week-view--gesture-left');

    // Test no gesture direction
    useTouchGestures.mockReturnValue({
      touchHandlers: {
        onTouchStart: vi.fn(),
        onTouchMove: vi.fn(),
        onTouchEnd: vi.fn(),
        onTouchCancel: vi.fn(),
      },
      isGesturing: false,
      gestureDirection: null,
    });

    rerender(<WeekView {...defaultProps} />);
    weekView = screen.getByTestId('week-view');
    expect(weekView).not.toHaveClass('week-view--gesture-left');
    expect(weekView).not.toHaveClass('week-view--gesture-right');
  });

  it('should use fallback weekDays when not provided', () => {
    const propsWithoutWeekDays = { ...defaultProps };
    delete propsWithoutWeekDays.weekDays;
    
    render(<WeekView {...propsWithoutWeekDays} />);
    
    // Should still render 7 day cells using current week
    const dayCells = document.querySelectorAll('.day-cell');
    expect(dayCells).toHaveLength(7);
  });
});