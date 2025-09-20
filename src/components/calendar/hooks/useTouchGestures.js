/**
 * Custom hook for handling touch gestures in the mobile calendar
 * Provides swipe detection for week navigation
 */
import { useState, useCallback, useRef } from 'react';

/**
 * Configuration for touch gesture detection
 */
const GESTURE_CONFIG = {
  minSwipeDistance: 50, // Minimum distance in pixels to register a swipe
  maxSwipeTime: 300,    // Maximum time in ms for a swipe gesture
  touchThreshold: 10,   // Minimum movement to start tracking a gesture
};

/**
 * Custom hook for touch gesture handling
 * @param {Object} options - Configuration options
 * @param {Function} options.onSwipeLeft - Callback for left swipe (next week)
 * @param {Function} options.onSwipeRight - Callback for right swipe (previous week)
 * @param {boolean} options.disabled - Whether gestures are disabled
 * @returns {Object} Touch event handlers and gesture state
 */
export function useTouchGestures({ 
  onSwipeLeft, 
  onSwipeRight, 
  disabled = false 
}) {
  const [isGesturing, setIsGesturing] = useState(false);
  const [gestureDirection, setGestureDirection] = useState(null);
  
  // Refs to track touch state
  const touchStartRef = useRef(null);
  const touchStartTimeRef = useRef(null);
  const isTrackingRef = useRef(false);

  /**
   * Handle touch start event
   */
  const handleTouchStart = useCallback((event) => {
    if (disabled) return;

    const touch = event.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
    touchStartTimeRef.current = Date.now();
    isTrackingRef.current = false;
    setGestureDirection(null);
  }, [disabled]);

  /**
   * Handle touch move event
   */
  const handleTouchMove = useCallback((event) => {
    if (disabled || !touchStartRef.current) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    // Check if we should start tracking (moved enough horizontally)
    if (!isTrackingRef.current) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      
      // Only start tracking if horizontal movement is greater than vertical
      // and exceeds the threshold
      if (absX > GESTURE_CONFIG.touchThreshold && absX > absY) {
        isTrackingRef.current = true;
        setIsGesturing(true);
        
        // Set initial gesture direction
        const direction = deltaX > 0 ? 'right' : 'left';
        setGestureDirection(direction);
        
        // Prevent default scrolling behavior
        event.preventDefault();
      }
      return;
    }

    // Update gesture direction for visual feedback
    if (Math.abs(deltaX) > GESTURE_CONFIG.touchThreshold) {
      const direction = deltaX > 0 ? 'right' : 'left';
      setGestureDirection(direction);
      
      // Prevent default scrolling
      event.preventDefault();
    }
  }, [disabled]);

  /**
   * Handle touch end event
   */
  const handleTouchEnd = useCallback((event) => {
    if (disabled || !touchStartRef.current || !isTrackingRef.current) {
      // Reset state
      touchStartRef.current = null;
      touchStartTimeRef.current = null;
      isTrackingRef.current = false;
      setIsGesturing(false);
      setGestureDirection(null);
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartTimeRef.current;
    
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    // Check if this qualifies as a swipe gesture
    const isValidSwipe = 
      absX >= GESTURE_CONFIG.minSwipeDistance && // Moved far enough
      absX > absY && // More horizontal than vertical movement
      deltaTime <= GESTURE_CONFIG.maxSwipeTime; // Fast enough

    if (isValidSwipe) {
      if (deltaX > 0) {
        // Swipe right - go to previous week
        onSwipeRight?.();
      } else {
        // Swipe left - go to next week
        onSwipeLeft?.();
      }
    }

    // Reset state
    touchStartRef.current = null;
    touchStartTimeRef.current = null;
    isTrackingRef.current = false;
    setIsGesturing(false);
    setGestureDirection(null);
  }, [disabled, onSwipeLeft, onSwipeRight]);

  /**
   * Handle touch cancel event
   */
  const handleTouchCancel = useCallback(() => {
    // Reset all state on touch cancel
    touchStartRef.current = null;
    touchStartTimeRef.current = null;
    isTrackingRef.current = false;
    setIsGesturing(false);
    setGestureDirection(null);
  }, []);

  return {
    // Touch event handlers
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
    
    // Gesture state for UI feedback
    isGesturing,
    gestureDirection, // 'left', 'right', or null
  };
}