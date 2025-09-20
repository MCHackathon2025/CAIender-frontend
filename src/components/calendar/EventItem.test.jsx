/**
 * Test suite for EventItem component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EventItem from './EventItem.jsx';

// Mock event data for testing
const mockEvent = {
  id: '1',
  title: 'Team Meeting',
  startTime: '09:00',
  endTime: '10:00',
  theme: 'main',
  isAllDay: false
};

const mockAllDayEvent = {
  id: '2',
  title: 'Conference Day',
  startTime: '',
  endTime: '',
  theme: 'announcement',
  isAllDay: true
};

const mockLongTitleEvent = {
  id: '3',
  title: 'This is a very long event title that should be truncated with ellipsis when displayed',
  startTime: '14:30',
  endTime: '15:30',
  theme: 'info',
  isAllDay: false
};

describe('EventItem', () => {
  it('renders event with time and title', () => {
    render(<EventItem event={mockEvent} />);
    
    expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument();
    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
  });

  it('renders all-day event correctly', () => {
    render(<EventItem event={mockAllDayEvent} />);
    
    expect(screen.getByText('All day')).toBeInTheDocument();
    expect(screen.getByText('Conference Day')).toBeInTheDocument();
  });

  it('applies correct theme class', () => {
    const { container } = render(<EventItem event={mockEvent} />);
    const eventItem = container.querySelector('.event-item');
    
    expect(eventItem).toHaveClass('event-item--main');
  });

  it('applies different theme classes correctly', () => {
    const themes = ['main', 'suggestion', 'announcement', 'info'];
    
    themes.forEach(theme => {
      const event = { ...mockEvent, theme };
      const { container } = render(<EventItem event={event} />);
      const eventItem = container.querySelector('.event-item');
      
      expect(eventItem).toHaveClass(`event-item--${theme}`);
    });
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<EventItem event={mockEvent} onClick={handleClick} />);
    
    const eventItem = screen.getByRole('button');
    fireEvent.click(eventItem);
    
    expect(handleClick).toHaveBeenCalledWith(mockEvent);
  });

  it('handles keyboard events', () => {
    const handleClick = vi.fn();
    render(<EventItem event={mockEvent} onClick={handleClick} />);
    
    const eventItem = screen.getByRole('button');
    
    // Test Enter key
    fireEvent.keyDown(eventItem, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledWith(mockEvent);
    
    // Test Space key
    fireEvent.keyDown(eventItem, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('renders compact mode correctly', () => {
    const { container } = render(<EventItem event={mockEvent} isCompact={true} />);
    const eventItem = container.querySelector('.event-item');
    
    expect(eventItem).toHaveClass('event-item--compact');
  });

  it('applies custom className', () => {
    const { container } = render(<EventItem event={mockEvent} className="custom-class" />);
    const eventItem = container.querySelector('.event-item');
    
    expect(eventItem).toHaveClass('custom-class');
  });

  it('handles missing event gracefully', () => {
    const { container } = render(<EventItem event={null} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('handles event with missing properties', () => {
    const incompleteEvent = { id: '4' };
    render(<EventItem event={incompleteEvent} />);
    
    expect(screen.getByText('Untitled Event')).toBeInTheDocument();
  });

  it('shows only start time when end time is missing', () => {
    const eventWithoutEndTime = {
      ...mockEvent,
      endTime: ''
    };
    render(<EventItem event={eventWithoutEndTime} />);
    
    expect(screen.getByText('09:00')).toBeInTheDocument();
  });

  it('shows full title in title attribute for accessibility', () => {
    render(<EventItem event={mockLongTitleEvent} />);
    
    const titleElement = screen.getByText(mockLongTitleEvent.title);
    expect(titleElement).toHaveAttribute('title', mockLongTitleEvent.title);
  });

  it('has proper ARIA attributes', () => {
    render(<EventItem event={mockEvent} />);
    
    const eventItem = screen.getByRole('button');
    expect(eventItem).toHaveAttribute('aria-label', 'Event: Team Meeting, 09:00 - 10:00');
    expect(eventItem).toHaveAttribute('tabIndex', '0');
  });

  it('prevents event bubbling on click', () => {
    const parentClick = vi.fn();
    const childClick = vi.fn();
    
    render(
      <div onClick={parentClick}>
        <EventItem event={mockEvent} onClick={childClick} />
      </div>
    );
    
    const eventItem = screen.getByRole('button');
    fireEvent.click(eventItem);
    
    expect(childClick).toHaveBeenCalledWith(mockEvent);
    expect(parentClick).not.toHaveBeenCalled();
  });

  it('applies CSS custom properties for theme colors', () => {
    const { container } = render(<EventItem event={mockEvent} />);
    const eventItem = container.querySelector('.event-item');
    
    expect(eventItem).toHaveStyle({
      '--event-primary': '#4caf50',
      '--event-light': '#c8e6c9',
      '--event-dark': '#2e7d32',
      '--event-contrast': '#ffffff'
    });
  });

  it('handles events with same start and end time', () => {
    const sameTimeEvent = {
      ...mockEvent,
      startTime: '09:00',
      endTime: '09:00'
    };
    render(<EventItem event={sameTimeEvent} />);
    
    expect(screen.getByText('09:00')).toBeInTheDocument();
  });
});