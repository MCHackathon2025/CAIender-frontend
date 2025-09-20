import { useState } from 'react'
import './LLMRecommandationButton.css'

const LLMRecommandationButton = () => {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleLLMRequest = async () => {
    if (isProcessing) return

    setIsProcessing(true)

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
    <button
      className={`llm-recommandation-button ${isProcessing ? 'processing' : ''}`}
      onClick={handleLLMRequest}
      disabled={isProcessing}
      title={isProcessing ? 'Processing...' : 'Get AI Recommendations'}
    >
      <span className="button-icon">
        {getButtonIcon()}
      </span>
    </button>
  )
}

export default LLMRecommandationButton
