/**
 * Tests for useTouchGestures hook
 * Tests gesture recognition and navigation callbacks
 */
import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useTouchGestures } from './useTouchGestures';

// Mock touch events
const createTouchEvent = (type, touches, changedTouches = touches) => ({
  type,
  touches,
  changedTouches,
  preventDefault: vi.fn(),
});

const createTouch = (clientX, clientY) => ({
  clientX,
  clientY,
});

describe('useTouchGestures', () => {
  let mockOnSwipeLeft;
  let mockOnSwipeRight;

  beforeEach(() => {
    mockOnSwipeLeft = vi.fn();
    mockOnSwipeRight = vi.fn();
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => 
      useTouchGestures({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
      })
    );

    expect(result.current.isGesturing).toBe(false);
    expect(result.current.gestureDirection).toBe(null);
    expect(result.current.touchHandlers).toHaveProperty('onTouchStart');
    expect(result.current.touchHandlers).toHaveProperty('onTouchMove');
    expect(result.current.touchHandlers).toHaveProperty('onTouchEnd');
    expect(result.current.touchHandlers).toHaveProperty('onTouchCancel');
  });

  it('should not respond to gestures when disabled', () => {
    const { result } = renderHook(() => 
      useTouchGestures({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
        disabled: true,
      })
    );

    const touchStart = createTouchEvent('touchstart', [createTouch(100, 100)]);
    const touchMove = createTouchEvent('touchmove', [createTouch(200, 100)]);
    const touchEnd = createTouchEvent('touchend', [], [createTouch(200, 100)]);

    act(() => {
      result.current.touchHandlers.onTouchStart(touchStart);
      result.current.touchHandlers.onTouchMove(touchMove);
      result.current.touchHandlers.onTouchEnd(touchEnd);
    });

    expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    expect(mockOnSwipeRight).not.toHaveBeenCalled();
    expect(result.current.isGesturing).toBe(false);
  });

  it('should detect right swipe (previous week)', () => {
    const { result } = renderHook(() => 
      useTouchGestures({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
      })
    );

    // Simulate a right swipe (start at 100, end at 200)
    const touchStart = createTouchEvent('touchstart', [createTouch(100, 100)]);
    const touchMove = createTouchEvent('touchmove', [createTouch(120, 100)]);
    const touchEnd = createTouchEvent('touchend', [], [createTouch(200, 100)]);

    act(() => {
      result.current.touchHandlers.onTouchStart(touchStart);
    });

    act(() => {
      result.current.touchHandlers.onTouchMove(touchMove);
    });

    expect(result.current.isGesturing).toBe(true);
    expect(result.current.gestureDirection).toBe('right');

    act(() => {
      result.current.touchHandlers.onTouchEnd(touchEnd);
    });

    expect(mockOnSwipeRight).toHaveBeenCalledTimes(1);
    expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    expect(result.current.isGesturing).toBe(false);
    expect(result.current.gestureDirection).toBe(null);
  });

  it('should detect left swipe (next week)', () => {
    const { result } = renderHook(() => 
      useTouchGestures({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
      })
    );

    // Simulate a left swipe (start at 200, end at 100)
    const touchStart = createTouchEvent('touchstart', [createTouch(200, 100)]);
    const touchMove = createTouchEvent('touchmove', [createTouch(180, 100)]);
    const touchEnd = createTouchEvent('touchend', [], [createTouch(100, 100)]);

    act(() => {
      result.current.touchHandlers.onTouchStart(touchStart);
    });

    act(() => {
      result.current.touchHandlers.onTouchMove(touchMove);
    });

    expect(result.current.isGesturing).toBe(true);
    expect(result.current.gestureDirection).toBe('left');

    act(() => {
      result.current.touchHandlers.onTouchEnd(touchEnd);
    });

    expect(mockOnSwipeLeft).toHaveBeenCalledTimes(1);
    expect(mockOnSwipeRight).not.toHaveBeenCalled();
    expect(result.current.isGesturing).toBe(false);
    expect(result.current.gestureDirection).toBe(null);
  });

  it('should not trigger swipe for insufficient distance', () => {
    const { result } = renderHook(() => 
      useTouchGestures({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
      })
    );

    // Simulate a short swipe (less than 50px)
    const touchStart = createTouchEvent('touchstart', [createTouch(100, 100)]);
    const touchMove = createTouchEvent('touchmove', [createTouch(120, 100)]);
    const touchEnd = createTouchEvent('touchend', [], [createTouch(130, 100)]);

    act(() => {
      result.current.touchHandlers.onTouchStart(touchStart);
      result.current.touchHandlers.onTouchMove(touchMove);
      result.current.touchHandlers.onTouchEnd(touchEnd);
    });

    expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    expect(mockOnSwipeRight).not.toHaveBeenCalled();
  });

  it('should not trigger swipe for vertical movement', () => {
    const { result } = renderHook(() => 
      useTouchGestures({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
      })
    );

    // Simulate vertical movement (should not trigger swipe)
    const touchStart = createTouchEvent('touchstart', [createTouch(100, 100)]);
    const touchMove = createTouchEvent('touchmove', [createTouch(110, 120)]);
    const touchEnd = createTouchEvent('touchend', [], [createTouch(120, 200)]);

    act(() => {
      result.current.touchHandlers.onTouchStart(touchStart);
      result.current.touchHandlers.onTouchMove(touchMove);
      result.current.touchHandlers.onTouchEnd(touchEnd);
    });

    expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    expect(mockOnSwipeRight).not.toHaveBeenCalled();
    expect(result.current.isGesturing).toBe(false);
  });

  it('should prevent default during horizontal gestures', () => {
    const { result } = renderHook(() => 
      useTouchGestures({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
      })
    );

    const touchStart = createTouchEvent('touchstart', [createTouch(100, 100)]);
    const touchMove = createTouchEvent('touchmove', [createTouch(120, 100)]);

    act(() => {
      result.current.touchHandlers.onTouchStart(touchStart);
      result.current.touchHandlers.onTouchMove(touchMove);
    });

    expect(touchMove.preventDefault).toHaveBeenCalled();
  });

  it('should reset state on touch cancel', () => {
    const { result } = renderHook(() => 
      useTouchGestures({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
      })
    );

    const touchStart = createTouchEvent('touchstart', [createTouch(100, 100)]);
    const touchMove = createTouchEvent('touchmove', [createTouch(120, 100)]);

    act(() => {
      result.current.touchHandlers.onTouchStart(touchStart);
      result.current.touchHandlers.onTouchMove(touchMove);
    });

    expect(result.current.isGesturing).toBe(true);

    act(() => {
      result.current.touchHandlers.onTouchCancel();
    });

    expect(result.current.isGesturing).toBe(false);
    expect(result.current.gestureDirection).toBe(null);
  });

  it('should not trigger swipe if gesture takes too long', () => {
    // Mock Date.now to control timing
    const originalDateNow = Date.now;
    let mockTime = 1000;
    Date.now = vi.fn(() => mockTime);

    const { result } = renderHook(() => 
      useTouchGestures({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
      })
    );

    const touchStart = createTouchEvent('touchstart', [createTouch(100, 100)]);
    const touchMove = createTouchEvent('touchmove', [createTouch(120, 100)]);

    act(() => {
      result.current.touchHandlers.onTouchStart(touchStart);
      result.current.touchHandlers.onTouchMove(touchMove);
    });

    // Advance time beyond the threshold (300ms)
    mockTime += 400;

    const touchEnd = createTouchEvent('touchend', [], [createTouch(200, 100)]);

    act(() => {
      result.current.touchHandlers.onTouchEnd(touchEnd);
    });

    expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    expect(mockOnSwipeRight).not.toHaveBeenCalled();

    // Restore original Date.now
    Date.now = originalDateNow;
  });
});