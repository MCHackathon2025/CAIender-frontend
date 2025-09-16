/**
 * Tests for CurrentTimeLine component
 * Verifies current time line display and positioning
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import CurrentTimeLine from './CurrentTimeLine';

// Mock the dateUtils module
vi.mock('./utils/dateUtils', () => ({
  getCurrentTimePosition: vi.fn(() => 600), // Mock position at 10:00 AM (10 * 60px)
  getCurrentTimeString: vi.fn(() => '10:30'),
  isToday: vi.fn((date) => false), // Default to false
}));

describe('CurrentTimeLine Component', () => {
  const mockDate = new Date('2024-01-15T10:30:00');
  const mockToday = new Date();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders current time line when date is today', async () => {
    const { isToday } = await import('./utils/dateUtils');
    vi.mocked(isToday).mockReturnValue(true);

    const { container } = render(<CurrentTimeLine date={mockToday} />);

    const timeLine = container.querySelector('.current-time-line');
    expect(timeLine).toBeInTheDocument();
    expect(timeLine).toHaveStyle('top: 600px');

    // Should not display time text (only line and circle)
    expect(screen.queryByText('10:30')).not.toBeInTheDocument();
  });

  test('does not render when date is not today', async () => {
    const { isToday } = await import('./utils/dateUtils');
    vi.mocked(isToday).mockReturnValue(false);

    const { container } = render(<CurrentTimeLine date={mockDate} />);

    const timeLine = container.querySelector('.current-time-line');
    expect(timeLine).not.toBeInTheDocument();
  });

  test('has proper accessibility attributes', async () => {
    const { isToday } = await import('./utils/dateUtils');
    vi.mocked(isToday).mockReturnValue(true);

    const { container } = render(<CurrentTimeLine date={mockToday} />);

    const timeLine = container.querySelector('.current-time-line');
    expect(timeLine).toHaveAttribute('aria-label', 'Current time: 10:30');
  });

  test('renders all visual components', async () => {
    const { isToday } = await import('./utils/dateUtils');
    vi.mocked(isToday).mockReturnValue(true);

    const { container } = render(<CurrentTimeLine date={mockToday} />);

    // Should have indicator with circle and line (no time text)
    expect(container.querySelector('.current-time-line__indicator')).toBeInTheDocument();
    expect(container.querySelector('.current-time-line__circle')).toBeInTheDocument();
    expect(container.querySelector('.current-time-line__line')).toBeInTheDocument();
    expect(container.querySelector('.current-time-line__time')).not.toBeInTheDocument();
  });

  test('updates position based on getCurrentTimePosition', async () => {
    const { isToday, getCurrentTimePosition } = await import('./utils/dateUtils');
    vi.mocked(isToday).mockReturnValue(true);
    vi.mocked(getCurrentTimePosition).mockReturnValue(720); // 12:00 PM position

    const { container } = render(<CurrentTimeLine date={mockToday} />);

    const timeLine = container.querySelector('.current-time-line');
    expect(timeLine).toHaveStyle('top: 720px');
  });
});