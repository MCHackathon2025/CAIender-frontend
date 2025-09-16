import { useState } from 'react'
import NavigationHeader from './components/calendar/NavigationHeader'
import { getCurrentWeek, getPreviousWeek, getNextWeek, getWeekRange } from './components/calendar/utils/dateUtils'
import './components/calendar/styles/index.css'
import './App.css'

function App() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isNavigating, setIsNavigating] = useState(false)

  const currentWeek = getWeekRange(currentDate)

  const handlePreviousWeek = () => {
    setIsNavigating(true)
    setTimeout(() => {
      setCurrentDate(getPreviousWeek(currentDate))
      setIsNavigating(false)
    }, 150)
  }

  const handleNextWeek = () => {
    setIsNavigating(true)
    setTimeout(() => {
      setCurrentDate(getNextWeek(currentDate))
      setIsNavigating(false)
    }, 150)
  }

  const handleTodayClick = () => {
    setIsNavigating(true)
    setTimeout(() => {
      setCurrentDate(new Date())
      setIsNavigating(false)
    }, 150)
  }

  return (
    <div className="mobile-calendar">
      <h1>Mobile Calendar - NavigationHeader Demo</h1>

      <NavigationHeader
        currentWeek={currentWeek}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        onTodayClick={handleTodayClick}
        isNavigating={isNavigating}
      />

      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Use the navigation controls above to browse different weeks.</p>
        <p>Current week: {currentWeek.startDate.toDateString()} - {currentWeek.endDate.toDateString()}</p>
        <p>Week number: {currentWeek.weekNumber} of {currentWeek.year}</p>
      </div>
    </div>
  )
}

export default App
