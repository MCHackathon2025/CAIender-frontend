/**
 * Tests for NavigationHeader component
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NavigationHeader from './NavigationHeader.jsx';
import { getCurrentWeek, createDate } from './utils/dateUtils.js';

describe('NavigationHeader', () => {
  const mockCurrentWeek = getCurrentWeek();
  const mockProps = {
    currentWeek: mockCurrentWeek,
    onPreviousWeek: vi.fn(),
    onNextWeek: vi.fn(),
    onTodayClick: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the navigation header with week range', () => {
    render(<NavigationHeader {...mockProps} />);
    
    // Check if the component renders
    expect(screen.getByRole('banner')).toBeInTheDocument();
    
    // Check if week range is displayed (should contain month and year)
    const weekText = screen.getByRole('heading', { level: 2 });
    expect(weekText).toBeInTheDocument();
    expect(weekText.textContent).toMatch(/\w+ \d+-?\d*, \d{4}/); // Pattern like "Dec 9-15, 2024"
  });

  it('renders navigation buttons with proper labels', () => {
    render(<NavigationHeader {...mockProps} />);
    
    // Check previous week button
    const prevButton = screen.getByLabelText('Previous week');
    expect(prevButton).toBeInTheDocument();
    expect(prevButton).toBeEnabled();
    
    // Check next week button
    const nextButton = screen.getByLabelText('Next week');
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).toBeEnabled();
  });

  it('renders today button', () => {
    render(<NavigationHeader {...mockProps} />);
    
    const todayButton = screen.getByRole('button', { name: /today/i });
    expect(todayButton).toBeInTheDocument();
    expect(todayButton).toBeEnabled();
  });

  it('calls onPreviousWeek when previous button is clicked', () => {
    render(<NavigationHeader {...mockProps} />);
    
    const prevButton = screen.getByLabelText('Previous week');
    fireEvent.click(prevButton);
    
    expect(mockProps.onPreviousWeek).toHaveBeenCalledTimes(1);
  });

  it('calls onNextWeek when next button is clicked', () => {
    render(<NavigationHeader {...mockProps} />);
    
    const nextButton = screen.getByLabelText('Next week');
    fireEvent.click(nextButton);
    
    expect(mockProps.onNextWeek).toHaveBeenCalledTimes(1);
  });

  it('calls onTodayClick when today button is clicked', () => {
    render(<NavigationHeader {...mockProps} />);
    
    const todayButton = screen.getByRole('button', { name: /today/i });
    fireEvent.click(todayButton);
    
    expect(mockProps.onTodayClick).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when isNavigating is true', () => {
    render(<NavigationHeader {...mockProps} isNavigating={true} />);
    
    const prevButton = screen.getByLabelText('Previous week');
    const nextButton = screen.getByLabelText('Next week');
    const todayButton = screen.getByRole('button', { name: /today/i });
    
    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
    expect(todayButton).toBeDisabled();
  });

  it('applies transitioning class when isNavigating is true', () => {
    render(<NavigationHeader {...mockProps} isNavigating={true} />);
    
    const weekText = screen.getByRole('heading', { level: 2 });
    expect(weekText).toHaveClass('navigation-header__week-text--transitioning');
  });

  it('handles different week ranges correctly', () => {
    // Test with a specific week range
    const customWeek = {
      startDate: createDate(2024, 12, 9), // December 9, 2024
      endDate: createDate(2024, 12, 15),  // December 15, 2024
      weekNumber: 50,
      year: 2024
    };

    render(<NavigationHeader {...mockProps} currentWeek={customWeek} />);
    
    const weekText = screen.getByRole('heading', { level: 2 });
    expect(weekText.textContent).toBe('Dec 9-15, 2024');
  });

  it('handles cross-month week ranges correctly', () => {
    // Test with a week that spans two months
    const crossMonthWeek = {
      startDate: createDate(2024, 12, 30), // December 30, 2024
      endDate: createDate(2025, 1, 5),     // January 5, 2025
      weekNumber: 1,
      year: 2025
    };

    render(<NavigationHeader {...mockProps} currentWeek={crossMonthWeek} />);
    
    const weekText = screen.getByRole('heading', { level: 2 });
    expect(weekText.textContent).toBe('Dec 30 - Jan 5, 2025');
  });
});