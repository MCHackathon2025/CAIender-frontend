/**
 * CurrentTimeLine component - displays a red line indicating the current time
 * Similar to Google Calendar's current time indicator
 */
import React, { useState, useEffect } from 'react';
import { getCurrentTimePosition, getCurrentTimeString, isToday } from './utils/dateUtils';
import './styles/index.css';

const CurrentTimeLine = ({ date }) => {
  const [currentTime, setCurrentTime] = useState(getCurrentTimeString());
  const [timePosition, setTimePosition] = useState(getCurrentTimePosition());

  // Only show the time line if the date is today
  const showTimeLine = isToday(date);

  useEffect(() => {
    if (!showTimeLine) return;

    // Update the time line position every minute
    const updateTimeLine = () => {
      setCurrentTime(getCurrentTimeString());
      setTimePosition(getCurrentTimePosition());
    };

    // Update immediately
    updateTimeLine();

    // Set up interval to update every minute
    const interval = setInterval(updateTimeLine, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [showTimeLine]);

  // Don't render anything if it's not today
  if (!showTimeLine) {
    return null;
  }

  return (
    <div 
      className="current-time-line"
      style={{ top: `${timePosition}px` }}
      aria-label={`Current time: ${currentTime}`}
    >
      <div className="current-time-line__indicator">
        <div className="current-time-line__circle" />
        <div className="current-time-line__line" />
      </div>
    </div>
  );
};

export default CurrentTimeLine;