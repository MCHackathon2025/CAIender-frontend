import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import ScheduleRecommendationsModal from './ScheduleRecommendationsModal'
import './styles/LLMRecommandationButton.css'

const LLMRecommandationButton = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const buttonRef = useRef(null)
  const dropdownRef = useRef(null)

  // Calculate dropdown position and close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false)
      }
    }

    const updateDropdownPosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          right: window.innerWidth - rect.right - window.scrollX
        })
      }
    }

    if (isDropdownOpen) {
      updateDropdownPosition()
      window.addEventListener('resize', updateDropdownPosition)
      window.addEventListener('scroll', updateDropdownPosition)
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('resize', updateDropdownPosition)
      window.removeEventListener('scroll', updateDropdownPosition)
    }
  }, [isDropdownOpen])

  const handleLLMRequest = async () => {
    if (isProcessing) return

    setIsProcessing(true)
    setIsDropdownOpen(false) // Close dropdown if open

    try {
      // Simulate API request to backend (since we're not implementing backend)
      await new Promise(resolve => setTimeout(resolve, 1500))

      console.log('LLM request sent to backend')
      // Here you would typically make an API call to your backend
      // Example: await fetch('/api/llm-request', { method: 'POST' })
    } catch (error) {
      console.error('LLM request error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDropdownToggle = () => {
    if (isProcessing) return
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleScheduleRecommendations = () => {
    setIsDropdownOpen(false)
    setIsScheduleModalOpen(true)
  }

  const handleCloseScheduleModal = () => {
    setIsScheduleModalOpen(false)
  }

  const getButtonText = () => {
    if (isProcessing) {
      return 'Processing...'
    }
    return ''
  }

  const getButtonIcon = () => {
    if (isProcessing) {
      return (
        <svg className="spinning" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.416" strokeDashoffset="31.416">
            <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite" />
            <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite" />
          </circle>
        </svg>
      )
    }

    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <>
      {/* Split Button */}
      <div
        className={`llm-recommandation-button ${isProcessing ? 'processing' : ''} ${isDropdownOpen ? 'dropdown-open' : ''}`}
        ref={buttonRef}
      >
        {/* Main Button */}
        <button
          className="main-button"
          onClick={handleLLMRequest}
          disabled={isProcessing}
          title={isProcessing ? 'Processing...' : 'Get AI Recommendations'}
        >
          <span className="button-icon">
            {getButtonIcon()}
          </span>
        </button>

        {/* Dropdown Button */}
        <button
          className="dropdown-button"
          onClick={handleDropdownToggle}
          disabled={isProcessing}
          title="More options"
        >
          <span style={{ fontSize: '20px', color: '#000000' }}>⁝</span>
        </button>
      </div>

      {/* Dropdown Menu - Portal */}
      {isDropdownOpen && createPortal(
        <div
          className="dropdown-menu-portal"
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: dropdownPosition.top,
            right: dropdownPosition.right,
            zIndex: 99999
          }}
        >
          <button
            className="dropdown-item"
            onClick={handleScheduleRecommendations}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Schedule Recommendations</span>
          </button>
        </div>,
        document.body
      )}

      {/* Schedule Recommendations Modal */}
      <ScheduleRecommendationsModal
        isOpen={isScheduleModalOpen}
        onClose={handleCloseScheduleModal}
      />
    </>
  )
}

export default LLMRecommandationButton
