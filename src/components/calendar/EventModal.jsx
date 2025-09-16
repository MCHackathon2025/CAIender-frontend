import React, { useState, useEffect, useRef } from 'react';
import { CALENDAR_THEMES, ANIMATIONS, TOUCH_TARGETS } from './theme';
import './styles/EventModal.css';

/**
 * EventModal component for creating and editing calendar events
 * Features slide-up animation, form validation, and proper focus management
 */
const EventModal = ({
  isOpen,
  selectedDate,
  event = null, // For editing existing events
  suggestedTimes = null, // For time-based event creation
  onSave,
  onCancel,
  onDelete = null
}) => {
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    theme: 'main',
    isAllDay: false
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for focus management
  const modalRef = useRef(null);
  const titleInputRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);

  // Initialize form data when modal opens or event changes
  useEffect(() => {
    if (isOpen && selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

      if (event) {
        // Editing existing event
        let eventDateString = dateString; // fallback to selectedDate
        try {
          const eventDate = new Date(event.startDate);
          if (!isNaN(eventDate.getTime())) {
            eventDateString = eventDate.toISOString().split('T')[0];
          }
        } catch (error) {
          console.warn('Invalid event date, using selectedDate as fallback');
        }

        setFormData({
          title: event.title || '',
          description: event.description || '',
          date: eventDateString,
          startTime: event.startTime || '09:00',
          endTime: event.endTime || '10:00',
          theme: event.theme || 'main',
          isAllDay: event.isAllDay || false
        });
      } else {
        // Creating new event - use suggested times if available
        const defaultStartTime = suggestedTimes?.startTime || '09:00';
        const defaultEndTime = suggestedTimes?.endTime || '10:00';

        setFormData({
          title: '',
          description: '',
          date: dateString,
          startTime: defaultStartTime,
          endTime: defaultEndTime,
          theme: 'main',
          isAllDay: false
        });
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, event, suggestedTimes, selectedDate]);

  // Focus management when modal opens
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      // Focus the title input after animation completes
      const timer = setTimeout(() => {
        titleInputRef.current.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Title is required
    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    // Date is required
    if (!formData.date) {
      newErrors.date = 'Event date is required';
    }

    // Time validation for non-all-day events
    if (!formData.isAllDay) {
      const startTime = formData.startTime;
      const endTime = formData.endTime;

      if (!startTime) {
        newErrors.startTime = 'Start time is required';
      }
      if (!endTime) {
        newErrors.endTime = 'End time is required';
      }

      // Check if end time is after start time
      if (startTime && endTime && startTime >= endTime) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the date from the form instead of selectedDate
      const eventDate = new Date(formData.date);

      const eventData = {
        id: event?.id || `event_${Date.now()}`,
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: eventDate,
        endDate: eventDate,
        startTime: formData.isAllDay ? '00:00' : formData.startTime,
        endTime: formData.isAllDay ? '23:59' : formData.endTime,
        theme: formData.theme,
        isAllDay: formData.isAllDay
      };

      await onSave(eventData);
    } catch (error) {
      console.error('Error saving event:', error);
      setErrors({ submit: 'Failed to save event. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete action
  const handleDelete = () => {
    if (event && onDelete && window.confirm('Are you sure you want to delete this event?')) {
      onDelete(event.id);
    }
  };

  // Handle keyboard navigation for accessibility
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    }

    // Trap focus within modal
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements?.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="event-modal-overlay" onClick={onCancel}>
      <div
        className="event-modal"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-modal-title"
      >
        <div className="event-modal-header">
          <h2 id="event-modal-title" className="event-modal-title">
            {event ? 'Edit Event' : 'New Event'}
          </h2>
          <button
            className="event-modal-close"
            onClick={onCancel}
            aria-label="Close modal"
            ref={firstFocusableRef}
          >
            ×
          </button>
        </div>

        <div className="event-modal-content">
          <form onSubmit={handleSubmit} className="event-form">
            {/* Date Input */}
            <div className="form-group">
              <label htmlFor="event-date" className="form-label">
                Date *
              </label>
              <input
                id="event-date"
                type="date"
                className={`form-input ${errors.date ? 'error' : ''}`}
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
              {errors.date && (
                <span className="error-message" role="alert">
                  {errors.date}
                </span>
              )}
            </div>

            {/* Title Input */}
            <div className="form-group">
              <label htmlFor="event-title" className="form-label">
                Event Title *
              </label>
              <input
                id="event-title"
                ref={titleInputRef}
                type="text"
                className={`form-input ${errors.title ? 'error' : ''}`}
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter event title"
                maxLength={100}
              />
              {errors.title && (
                <span className="error-message" role="alert">
                  {errors.title}
                </span>
              )}
            </div>

            {/* Description and All Day Toggle Row */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="event-description" className="form-label">
                  Description
                </label>
                <textarea
                  id="event-description"
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Optional description"
                  rows={2}
                  maxLength={500}
                />
              </div>

              <div className="form-group checkbox-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isAllDay}
                    onChange={(e) => handleInputChange('isAllDay', e.target.checked)}
                  />
                  <span className="checkbox-text">All day</span>
                </label>
              </div>
            </div>

            {/* Time Inputs (hidden for all-day events) */}
            {!formData.isAllDay && (
              <div className="time-inputs">
                <div className="form-group">
                  <label htmlFor="start-time" className="form-label">
                    Start Time *
                  </label>
                  <input
                    id="start-time"
                    type="time"
                    className={`form-input ${errors.startTime ? 'error' : ''}`}
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                  />
                  {errors.startTime && (
                    <span className="error-message" role="alert">
                      {errors.startTime}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="end-time" className="form-label">
                    End Time *
                  </label>
                  <input
                    id="end-time"
                    type="time"
                    className={`form-input ${errors.endTime ? 'error' : ''}`}
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                  />
                  {errors.endTime && (
                    <span className="error-message" role="alert">
                      {errors.endTime}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Theme Selection */}
            <div className="form-group theme-section">
              <label className="form-label">Color</label>
              <div className="theme-selector">
                {Object.entries(CALENDAR_THEMES).map(([themeKey, themeColors]) => (
                  <button
                    key={themeKey}
                    type="button"
                    className={`theme-option ${formData.theme === themeKey ? 'selected' : ''}`}
                    onClick={() => handleInputChange('theme', themeKey)}
                    style={{
                      backgroundColor: themeColors.primary,
                      borderColor: themeColors.dark
                    }}
                    aria-label={`Select ${themeKey} theme`}
                  >
                    {formData.theme === themeKey && (
                      <span className="theme-check" style={{ color: themeColors.contrast }}>
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="error-message submit-error" role="alert">
                {errors.submit}
              </div>
            )}

            {/* Action Buttons */}
            <div className="form-actions">
              {event && onDelete && (
                <button
                  type="button"
                  className="btn btn-delete"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  Delete
                </button>
              )}

              <div className="primary-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  ref={lastFocusableRef}
                >
                  {isSubmitting ? 'Saving...' : (event ? 'Update' : 'Create')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventModal;