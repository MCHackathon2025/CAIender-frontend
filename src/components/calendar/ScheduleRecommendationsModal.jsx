import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import './styles/ScheduleRecommendationsModal.css'

const ScheduleRecommendationsModal = ({ isOpen, onClose, suggestedEvents = [] }) => {
  const [selectedPrompt, setSelectedPrompt] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [timePreferences, setTimePreferences] = useState({})
  const [expandedCategories, setExpandedCategories] = useState({})
  const modalRef = useRef(null)
  const textareaRef = useRef(null)

  const quickPrompts = [
    { text: 'Reschedule today\'s schedule' },
    { text: 'Schedule a 1-hour meeting today' },
    { text: 'Add workout sessions to today\'s schedule' },
    { text: 'Reschedule conflicting meetings' }
  ]

  // Time preferences structure
  const timeStructure = {
    'all': {
      label: 'All',
      children: {
        'early-morning': {
          label: '0:00 ~ 9:00',
          children: {
            '0:00': { label: '0:00 ~ 1:00' },
            '1:00': { label: '1:00 ~ 2:00' },
            '2:00': { label: '2:00 ~ 3:00' },
            '3:00': { label: '3:00 ~ 4:00' },
            '4:00': { label: '4:00 ~ 5:00' },
            '5:00': { label: '5:00 ~ 6:00' },
            '6:00': { label: '6:00 ~ 7:00' },
            '7:00': { label: '7:00 ~ 8:00' },
            '8:00': { label: '8:00 ~ 9:00' }
          }
        },
        'morning': {
          label: '9:00 ~ 12:00',
          children: {
            '9:00': { label: '9:00 ~ 10:00' },
            '10:00': { label: '10:00 ~ 11:00' },
            '11:00': { label: '11:00 ~ 12:00' }
          }
        },
        'noon': {
          label: '12:00 ~ 13:00',
          children: {}
        },
        'afternoon': {
          label: '13:00 ~ 18:00',
          children: {
            '13:00': { label: '13:00 ~ 14:00' },
            '14:00': { label: '14:00 ~ 15:00' },
            '15:00': { label: '15:00 ~ 16:00' },
            '16:00': { label: '16:00 ~ 17:00' },
            '17:00': { label: '17:00 ~ 18:00' }
          }
        },
        'evening': {
          label: '18:00 ~ 24:00',
          children: {
            '18:00': { label: '18:00 ~ 19:00' },
            '19:00': { label: '19:00 ~ 20:00' },
            '20:00': { label: '20:00 ~ 21:00' },
            '21:00': { label: '21:00 ~ 22:00' },
            '22:00': { label: '22:00 ~ 23:00' },
            '23:00': { label: '23:00 ~ 24:00' }
          }
        }
      }
    }
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (showCustomInput && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [showCustomInput])

  useEffect(() => {
    if (!isOpen) {
      setSelectedPrompt('')
      setShowCustomInput(false)
      setCustomPrompt('')
      setIsProcessing(false)
      setTimePreferences({})
    }
  }, [isOpen])

  // Helper functions for checkbox logic
  const isChecked = (key) => {
    return timePreferences[key] === true
  }

  const isIndeterminate = (key) => {
    const item = timeStructure.all.children[key]
    if (!item || !item.children) return false

    const childKeys = Object.keys(item.children)
    const checkedChildren = childKeys.filter(childKey => timePreferences[childKey] === true)
    return checkedChildren.length > 0 && checkedChildren.length < childKeys.length
  }

  const handleTimePreferenceChange = (key, checked) => {
    setTimePreferences(prev => {
      const newPrefs = { ...prev }

      if (key === 'all') {
        // Toggle all children
        const toggleAllChildren = (children) => {
          Object.keys(children).forEach(childKey => {
            newPrefs[childKey] = checked
            if (children[childKey].children) {
              toggleAllChildren(children[childKey].children)
            }
          })
        }
        toggleAllChildren(timeStructure.all.children)
        newPrefs[key] = checked
      } else if (timeStructure.all.children[key]) {
        // Toggle category and all its children
        newPrefs[key] = checked
        const category = timeStructure.all.children[key]
        if (category.children) {
          Object.keys(category.children).forEach(childKey => {
            newPrefs[childKey] = checked
          })
        }
      } else {
        // Toggle individual time slot
        newPrefs[key] = checked

        // Check if parent category should be updated
        Object.keys(timeStructure.all.children).forEach(categoryKey => {
          const category = timeStructure.all.children[categoryKey]
          if (category.children && category.children[key]) {
            const childKeys = Object.keys(category.children)
            const checkedChildren = childKeys.filter(childKey =>
              childKey === key ? checked : newPrefs[childKey] === true
            )

            if (checkedChildren.length === 0) {
              newPrefs[categoryKey] = false
            } else if (checkedChildren.length === childKeys.length) {
              newPrefs[categoryKey] = true
            } else {
              newPrefs[categoryKey] = false // Indeterminate state
            }
          }
        })

        // Check if "all" should be updated
        const allCategoryKeys = Object.keys(timeStructure.all.children)
        const checkedCategories = allCategoryKeys.filter(categoryKey => newPrefs[categoryKey] === true)

        if (checkedCategories.length === 0) {
          newPrefs.all = false
        } else if (checkedCategories.length === allCategoryKeys.length) {
          newPrefs.all = true
        } else {
          newPrefs.all = false // Indeterminate state
        }
      }

      return newPrefs
    })
  }

  const toggleCategory = (categoryKey) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }))
  }

  const handleQuickPromptClick = (promptText) => {
    setSelectedPrompt(promptText)
    setShowCustomInput(false)
    setCustomPrompt('')
  }

  const handleCustomPromptToggle = () => {
    setShowCustomInput(!showCustomInput)
    setSelectedPrompt('')
  }

  const handleGetRecommendations = async () => {
    const prompt = selectedPrompt || customPrompt.trim()

    if (!prompt) {
      return
    }

    setIsProcessing(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      console.log('Getting recommendations for:', prompt)
      onClose()
    } catch (error) {
      console.error('Error getting recommendations:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const canSubmit = selectedPrompt || customPrompt.trim()

  if (!isOpen) return null

  return createPortal(
    <div className="schedule-modal-overlay">
      <div className="schedule-modal" ref={modalRef} role="dialog" aria-modal="true">
        <button
          className="schedule-modal-close"
          onClick={onClose}
          disabled={isProcessing}
          aria-label="Close modal"
        >
          ×
        </button>

        <p className="schedule-modal-description">
          Choose a suggestion:
        </p>

        {/* Display suggested events if available */}
        {suggestedEvents && suggestedEvents.length > 0 && (
          <div className="suggested-events-container">
            <h3 className="suggested-events-title">AI Suggested Events</h3>
            <div className="suggested-events-list">
              {suggestedEvents.map((event, index) => (
                <div key={event.eventId || index} className="suggested-event-item">
                  <div className="suggested-event-header">
                    <span className="suggested-event-title">{event.title}</span>
                    <span className="suggested-event-time">
                      {new Date(parseInt(event.startTime)).toLocaleString()} - {new Date(parseInt(event.endTime)).toLocaleString()}
                    </span>
                  </div>
                  {event.description && (
                    <p className="suggested-event-description">{event.description}</p>
                  )}
                  {event.location && (
                    <p className="suggested-event-location">📍 {event.location}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="quick-prompts-container">
          {quickPrompts.map((prompt, index) => (
            <div key={index}>
              <button
                className={`quick-prompt-btn ${selectedPrompt === prompt.text ? 'selected' : ''}`}
                onClick={() => handleQuickPromptClick(prompt.text)}
                disabled={isProcessing}
              >
                <span className="prompt-text">{prompt.text}</span>
              </button>

              {/* Time Preferences - Show directly under selected prompt (except for conflicting meetings) */}
              {selectedPrompt === prompt.text && prompt.text !== 'Reschedule conflicting meetings' && (
                <div className="time-preferences-section">
                  <p className="time-preferences-description">Select preferred time slots:</p>

                  <div className="time-preferences-tree">
                    {/* All checkbox */}
                    <div className="time-preference-item level-0">
                      <label className="time-preference-label">
                        <input
                          type="checkbox"
                          checked={isChecked('all')}
                          ref={input => {
                            if (input) input.indeterminate = isIndeterminate('all')
                          }}
                          onChange={(e) => handleTimePreferenceChange('all', e.target.checked)}
                          disabled={isProcessing}
                        />
                        <span className="time-preference-text">{timeStructure.all.label}</span>
                      </label>
                    </div>

                    {/* Category checkboxes with toggle */}
                    {Object.entries(timeStructure.all.children).map(([categoryKey, category]) => (
                      <div key={categoryKey} className="time-preference-category">
                        <div className="time-preference-item level-1">
                          <label className="time-preference-label">
                            <input
                              type="checkbox"
                              checked={isChecked(categoryKey)}
                              ref={input => {
                                if (input) input.indeterminate = isIndeterminate(categoryKey)
                              }}
                              onChange={(e) => handleTimePreferenceChange(categoryKey, e.target.checked)}
                              disabled={isProcessing}
                            />
                            <span className="time-preference-text">{category.label}</span>
                            <button
                              type="button"
                              className="toggle-button"
                              onClick={() => toggleCategory(categoryKey)}
                              disabled={isProcessing}
                              aria-label={expandedCategories[categoryKey] ? 'Collapse' : 'Expand'}
                            >
                              {expandedCategories[categoryKey] ? '−' : '+'}
                            </button>
                          </label>
                        </div>

                        {/* Collapsible time slot checkboxes */}
                        {expandedCategories[categoryKey] && category.children && (
                          <div className="time-slots-container">
                            {Object.entries(category.children).map(([timeKey, timeSlot]) => (
                              <div key={timeKey} className="time-preference-item level-2">
                                <label className="time-preference-label">
                                  <input
                                    type="checkbox"
                                    checked={isChecked(timeKey)}
                                    onChange={(e) => handleTimePreferenceChange(timeKey, e.target.checked)}
                                    disabled={isProcessing}
                                  />
                                  <span className="time-preference-text">{timeSlot.label}</span>
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            className={`quick-prompt-btn custom-prompt-btn ${showCustomInput ? 'active' : ''}`}
            onClick={handleCustomPromptToggle}
            disabled={isProcessing}
          >
            <span className="prompt-text">Custom Prompt</span>
          </button>

          {showCustomInput && (
            <div className="custom-input-container">
              <textarea
                ref={textareaRef}
                className="custom-input-textarea"
                placeholder="Describe what you need help with...&#10;(e.g., &quot;Find time for team meetings&quot;, &quot;Block time for project work&quot;, &quot;Schedule breaks between meetings&quot;)"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                disabled={isProcessing}
                rows={3}
              />
            </div>
          )}

          {/* Time Preferences for Custom Input - Removed as per user request */}
          {false && showCustomInput && (
            <div className="time-preferences-section">
              <h3 className="time-preferences-title">Time Preferences</h3>
              <p className="time-preferences-description">Select preferred and unavailable time slots:</p>

              <div className="time-preferences-tree">
                {/* All checkbox */}
                <div className="time-preference-item level-0">
                  <label className="time-preference-label">
                    <input
                      type="checkbox"
                      checked={isChecked('all')}
                      ref={input => {
                        if (input) input.indeterminate = isIndeterminate('all')
                      }}
                      onChange={(e) => handleTimePreferenceChange('all', e.target.checked)}
                      disabled={isProcessing}
                    />
                    <span className="time-preference-text">{timeStructure.all.label}</span>
                  </label>
                </div>

                {/* Category checkboxes with toggle */}
                {Object.entries(timeStructure.all.children).map(([categoryKey, category]) => (
                  <div key={categoryKey} className="time-preference-category">
                    <div className="time-preference-item level-1">
                      <label className="time-preference-label">
                        <input
                          type="checkbox"
                          checked={isChecked(categoryKey)}
                          ref={input => {
                            if (input) input.indeterminate = isIndeterminate(categoryKey)
                          }}
                          onChange={(e) => handleTimePreferenceChange(categoryKey, e.target.checked)}
                          disabled={isProcessing}
                        />
                        <span className="time-preference-text">{category.label}</span>
                        <button
                          type="button"
                          className="toggle-button"
                          onClick={() => toggleCategory(categoryKey)}
                          disabled={isProcessing}
                          aria-label={expandedCategories[categoryKey] ? 'Collapse' : 'Expand'}
                        >
                          {expandedCategories[categoryKey] ? '−' : '+'}
                        </button>
                      </label>
                    </div>

                    {/* Collapsible time slot checkboxes */}
                    {expandedCategories[categoryKey] && category.children && (
                      <div className="time-slots-container">
                        {Object.entries(category.children).map(([timeKey, timeSlot]) => (
                          <div key={timeKey} className="time-preference-item level-2">
                            <label className="time-preference-label">
                              <input
                                type="checkbox"
                                checked={isChecked(timeKey)}
                                onChange={(e) => handleTimePreferenceChange(timeKey, e.target.checked)}
                                disabled={isProcessing}
                              />
                              <span className="time-preference-text">{timeSlot.label}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="schedule-modal-actions">
          <button
            className="action-btn cancel-btn"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            className={`action-btn submit-btn ${canSubmit ? 'enabled' : 'disabled'}`}
            onClick={handleGetRecommendations}
            disabled={!canSubmit || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Get Recommendations'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ScheduleRecommendationsModal
