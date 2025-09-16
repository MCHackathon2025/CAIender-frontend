import { describe, it, expect, beforeEach } from 'vitest';
import {
  getWeekStart,
  getWeekEnd,
  getWeekRange,
  getCurrentWeek,
  getWeekDays,
  getPreviousWeek,
  getNextWeek,
  formatWeekRange,
  formatDayName,
  formatDayNumber,
  formatTime,
  isToday,
  isSameDay,
  getWeekNumber,
  timeToMinutes,
  calculateEventPosition
} from './dateUtils.js';

describe('Date Utility Functions', () => {
  let testDate;
  
  beforeEach(() => {
    // December 12, 2024 (Thursday)
    testDate = new Date(2024, 11, 12);
  });

  describe('getWeekStart', () => {
    it('should return Monday for a Thursday date', () => {
      const weekStart = getWeekStart(testDate);
      expect(weekStart.getDay()).toBe(1); // Monday
      expect(weekStart.getDate()).toBe(9); // December 9, 2024
    });

    it('should return the same date if input is already Monday', () => {
      const monday = new Date(2024, 11, 9);
      const weekStart = getWeekStart(monday);
      expect(weekStart.getDate()).toBe(9);
      expect(weekStart.getDay()).toBe(1);
    });

    it('should handle Sunday correctly', () => {
      const sunday = new Date(2024, 11, 15);
      const weekStart = getWeekStart(sunday);
      expect(weekStart.getDate()).toBe(9); // Previous Monday
      expect(weekStart.getDay()).toBe(1);
    });
  });

  describe('getWeekEnd', () => {
    it('should return Sunday for a Thursday date', () => {
      const weekEnd = getWeekEnd(testDate);
      expect(weekEnd.getDay()).toBe(0); // Sunday
      expect(weekEnd.getDate()).toBe(15); // December 15, 2024
    });

    it('should return correct Sunday for a Monday', () => {
      const monday = new Date(2024, 11, 9);
      const weekEnd = getWeekEnd(monday);
      expect(weekEnd.getDate()).toBe(15);
      expect(weekEnd.getDay()).toBe(0);
    });
  });

  describe('getWeekRange', () => {
    it('should return correct week range object', () => {
      const weekRange = getWeekRange(testDate);
      
      expect(weekRange.startDate.getDate()).toBe(9);
      expect(weekRange.endDate.getDate()).toBe(15);
      expect(weekRange.year).toBe(2024);
      expect(typeof weekRange.weekNumber).toBe('number');
    });

    it('should have startDate as Monday and endDate as Sunday', () => {
      const weekRange = getWeekRange(testDate);
      
      expect(weekRange.startDate.getDay()).toBe(1); // Monday
      expect(weekRange.endDate.getDay()).toBe(0); // Sunday
    });
  });

  describe('getCurrentWeek', () => {
    it('should return a week range object for current date', () => {
      const currentWeek = getCurrentWeek();
      
      expect(currentWeek).toHaveProperty('startDate');
      expect(currentWeek).toHaveProperty('endDate');
      expect(currentWeek).toHaveProperty('weekNumber');
      expect(currentWeek).toHaveProperty('year');
    });
  });

  describe('getWeekDays', () => {
    it('should return array of 7 dates', () => {
      const weekDays = getWeekDays(testDate);
      
      expect(weekDays).toHaveLength(7);
      expect(weekDays[0]).toBeInstanceOf(Date);
    });

    it('should start with Monday and end with Sunday', () => {
      const weekDays = getWeekDays(testDate);
      
      expect(weekDays[0].getDay()).toBe(1); // Monday
      expect(weekDays[6].getDay()).toBe(0); // Sunday
    });

    it('should have consecutive dates', () => {
      const weekDays = getWeekDays(testDate);
      
      for (let i = 1; i < weekDays.length; i++) {
        const prevDate = weekDays[i - 1].getDate();
        const currentDate = weekDays[i].getDate();
        expect(currentDate - prevDate).toBe(1);
      }
    });
  });

  describe('getPreviousWeek', () => {
    it('should return date 7 days earlier', () => {
      const prevWeek = getPreviousWeek(testDate);
      const daysDiff = (testDate - prevWeek) / (1000 * 60 * 60 * 24);
      
      expect(daysDiff).toBe(7);
    });

    it('should handle month boundaries', () => {
      const firstOfMonth = new Date(2024, 11, 1); // December 1
      const prevWeek = getPreviousWeek(firstOfMonth);
      
      expect(prevWeek.getMonth()).toBe(10); // November
      expect(prevWeek.getDate()).toBe(24); // November 24
    });
  });

  describe('getNextWeek', () => {
    it('should return date 7 days later', () => {
      const nextWeek = getNextWeek(testDate);
      const daysDiff = (nextWeek - testDate) / (1000 * 60 * 60 * 24);
      
      expect(daysDiff).toBe(7);
    });

    it('should handle month boundaries', () => {
      const endOfMonth = new Date(2024, 10, 30); // November 30
      const nextWeek = getNextWeek(endOfMonth);
      
      expect(nextWeek.getMonth()).toBe(11); // December
      expect(nextWeek.getDate()).toBe(7); // December 7
    });
  });
});

describe('Date Formatting Functions', () => {
  let startDate, endDate;
  
  beforeEach(() => {
    startDate = new Date(2024, 11, 9); // December 9, 2024 (Monday)
    endDate = new Date(2024, 11, 15); // December 15, 2024 (Sunday)
  });

  describe('formatWeekRange', () => {
    it('should format week range in same month correctly', () => {
      const formatted = formatWeekRange(startDate, endDate);
      expect(formatted).toBe('Dec 9-15, 2024');
    });

    it('should format week range across different months', () => {
      const startDate = new Date(2024, 10, 25); // November 25
      const endDate = new Date(2024, 11, 1); // December 1
      const formatted = formatWeekRange(startDate, endDate);
      expect(formatted).toBe('Nov 25 - Dec 1, 2024');
    });

    it('should handle year boundaries', () => {
      const startDate = new Date(2024, 11, 30); // December 30, 2024
      const endDate = new Date(2025, 0, 5); // January 5, 2025
      const formatted = formatWeekRange(startDate, endDate);
      expect(formatted).toBe('Dec 30 - Jan 5, 2025');
    });
  });

  describe('formatDayName', () => {
    it('should return short day names', () => {
      const monday = new Date(2024, 11, 9);
      const tuesday = new Date(2024, 11, 10);
      const sunday = new Date(2024, 11, 15);
      
      expect(formatDayName(monday)).toBe('Mon');
      expect(formatDayName(tuesday)).toBe('Tue');
      expect(formatDayName(sunday)).toBe('Sun');
    });
  });

  describe('formatDayNumber', () => {
    it('should return day number as string', () => {
      const date1 = new Date(2024, 11, 9);
      const date2 = new Date(2024, 11, 25);
      
      expect(formatDayNumber(date1)).toBe('9');
      expect(formatDayNumber(date2)).toBe('25');
    });
  });

  describe('formatTime', () => {
    it('should format morning times correctly', () => {
      expect(formatTime('09:00')).toBe('9:00 AM');
      expect(formatTime('09:30')).toBe('9:30 AM');
    });

    it('should format afternoon times correctly', () => {
      expect(formatTime('14:30')).toBe('2:30 PM');
      expect(formatTime('18:00')).toBe('6:00 PM');
    });

    it('should handle midnight and noon', () => {
      expect(formatTime('00:00')).toBe('12:00 AM');
      expect(formatTime('12:00')).toBe('12:00 PM');
    });
  });
});

describe('Date Comparison Functions', () => {
  describe('isToday', () => {
    it('should return true for today\'s date', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isToday(tomorrow)).toBe(false);
    });
  });

  describe('isSameDay', () => {
    it('should return true for same dates', () => {
      const date1 = new Date(2024, 11, 12, 10, 30);
      const date2 = new Date(2024, 11, 12, 15, 45);
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('should return false for different dates', () => {
      const date1 = new Date(2024, 11, 12);
      const date2 = new Date(2024, 11, 13);
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });

  describe('getWeekNumber', () => {
    it('should return correct week number for known dates', () => {
      const jan1 = new Date(2024, 0, 1); // January 1, 2024
      const midYear = new Date(2024, 5, 15); // June 15, 2024 (should be around week 24)
      
      expect(getWeekNumber(jan1)).toBe(1);
      expect(typeof getWeekNumber(midYear)).toBe('number');
      expect(getWeekNumber(midYear)).toBeGreaterThan(20);
      expect(getWeekNumber(midYear)).toBeLessThan(30);
    });

    it('should return number between 1 and 53', () => {
      const testDate = new Date(2024, 5, 15); // June 15, 2024
      const weekNum = getWeekNumber(testDate);
      
      expect(weekNum).toBeGreaterThanOrEqual(1);
      expect(weekNum).toBeLessThanOrEqual(53);
    });
  });
});

describe('Time Positioning Functions', () => {
  describe('timeToMinutes', () => {
    it('should convert time string to minutes from midnight', () => {
      expect(timeToMinutes('00:00')).toBe(0);
      expect(timeToMinutes('01:00')).toBe(60);
      expect(timeToMinutes('09:30')).toBe(570); // 9*60 + 30
      expect(timeToMinutes('12:00')).toBe(720); // 12*60
      expect(timeToMinutes('23:59')).toBe(1439); // 23*60 + 59
    });

    it('should handle empty or invalid input', () => {
      expect(timeToMinutes('')).toBe(0);
      expect(timeToMinutes(null)).toBe(0);
      expect(timeToMinutes(undefined)).toBe(0);
    });
  });

  describe('calculateEventPosition', () => {
    it('should calculate correct position for morning events', () => {
      const position = calculateEventPosition('09:00', '10:00', 60);
      expect(position.top).toBe(540); // 9 * 60
      expect(position.height).toBe(60); // 1 hour * 60px
    });

    it('should calculate correct position for afternoon events', () => {
      const position = calculateEventPosition('14:30', '16:00', 60);
      expect(position.top).toBe(870); // 14.5 * 60
      expect(position.height).toBe(90); // 1.5 hours * 60px
    });

    it('should handle events without end time', () => {
      const position = calculateEventPosition('10:00', null, 60);
      expect(position.top).toBe(600); // 10 * 60
      expect(position.height).toBe(60); // Default 1 hour
    });

    it('should handle events without start time', () => {
      const position = calculateEventPosition(null, '11:00', 60);
      expect(position.top).toBe(0);
      expect(position.height).toBe(60); // Default hour height
    });

    it('should respect minimum height', () => {
      const position = calculateEventPosition('10:00', '10:05', 60); // 5 minute event
      expect(position.top).toBe(600);
      expect(position.height).toBe(20); // Minimum 20px height
    });

    it('should work with different hour heights', () => {
      const position = calculateEventPosition('09:00', '10:00', 50);
      expect(position.top).toBe(450); // 9 * 50
      expect(position.height).toBe(50); // 1 hour * 50px
    });

    it('should handle overnight events correctly', () => {
      const position = calculateEventPosition('23:00', '23:30', 60);
      expect(position.top).toBe(1380); // 23 * 60
      expect(position.height).toBe(30); // 0.5 hours * 60px
    });
  });
});