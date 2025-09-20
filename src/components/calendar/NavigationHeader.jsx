/**
 * NavigationHeader component for the Mobile Calendar
 * Provides week navigation controls and current week display
 */
import React from 'react';
import { formatWeekRange } from './utils/dateUtils.js';
import LLMRecommandationButton from './LLMRecommandationButton';
import './styles/NavigationHeader.css';

/**
 * NavigationHeader component
 * @param {Object} props - Component props
 * @param {Object} props.currentWeek - Current week range object with startDate and endDate
 * @param {Function} props.onPreviousWeek - Callback for previous week navigation
 * @param {Function} props.onNextWeek - Callback for next week navigation
 * @param {Function} props.onTodayClick - Callback for today button click
 * @param {boolean} [props.isNavigating] - Whether navigation is in progress (for animations)
 */
const NavigationHeader = ({
  currentWeek,
  onPreviousWeek,
  onNextWeek,
  onTodayClick,
  isNavigating = false
}) => {
  const weekRangeText = formatWeekRange(currentWeek.startDate, currentWeek.endDate);

  return (
    <header className="navigation-header">
      <div className="navigation-header__container">
        {/* Previous Week Button */}
        <button
          className="navigation-header__button navigation-header__button--prev"
          onClick={onPreviousWeek}
          disabled={isNavigating}
          aria-label="Previous week"
        >
          <svg
            className="navigation-header__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="18,22 4,12 18,2"></polyline>
          </svg>
        </button>

        {/* Week Range Display */}
        <div className="navigation-header__week-range">
          <h2
            className={`navigation-header__week-text ${isNavigating ? 'navigation-header__week-text--transitioning' : ''}`}
          >
            {weekRangeText}
          </h2>
        </div>

        {/* Next Week Button */}
        <button
          className="navigation-header__button navigation-header__button--next"
          onClick={onNextWeek}
          disabled={isNavigating}
          aria-label="Next week"
        >
          <svg
            className="navigation-header__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6,22 20,12 6,2"></polyline>
          </svg>
        </button>
      </div>

      {/* Today Button and LLM Button */}
      <div className="navigation-header__today-container">
        <button
          className="navigation-header__today-button"
          onClick={onTodayClick}
          disabled={isNavigating}
        >
          Today
        </button>
        <LLMRecommandationButton />
      </div>
    </header>
  );
};

export default NavigationHeader;