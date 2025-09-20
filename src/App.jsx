import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Clock, MapPin, CheckCircle, X, AlertTriangle, Calendar, Home, LogIn, LogOut, User } from 'lucide-react';
import MobileCalendar from './components/calendar/MobileCalendar';
import { createDate } from './components/calendar/utils/dateUtils';
import { useAuth } from './contexts/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import './components/calendar/styles/index.css';
import './components/App.css';
import WeatherCard from "./components/WeatherCard";


// Default Page component
const DefaultPage = () => {
  // Time state
  const [currentTime, setCurrentTime] = useState(new Date());

  // State management: control whether notifications are displayed
  const [showWeatherAlert, setShowWeatherAlert] = useState(true);
  const [showMeetingAlert, setShowMeetingAlert] = useState(true);

  // State management: control whether schedule tasks are displayed
  const [showSnackTime, setShowSnackTime] = useState(true);
  const [showReport, setShowReport] = useState(true);
  const [showDinner, setShowDinner] = useState(true);
  const [showWorkOut, setShowWorkOut] = useState(true);

  // Auto-update time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time display (HH:MM)
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format date display (Sep. 14 Thu.)
  const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const month = months[date.getMonth()];
    const day = date.getDate();
    const weekday = weekdays[date.getDay()];

    return `${month}. ${day} ${weekday}.`;
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      {/* Top Section with Weather */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #60a5fa, #93c5fd, #ffffff)',
        padding: '32px',
        textAlign: 'center'
      }}>
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          color: '#374151'
        }}>
        </div>

        <div style={{ marginTop: "32px" }}>
          <div style={{ color: "#374151", fontSize: "14px", marginBottom: "8px" }}>
            {formatDate(currentTime)}
          </div>
          <div style={{ fontSize: "60px", fontWeight: "300", color: "#374151", marginBottom: "16px" }}>
            {formatTime(currentTime)}
          </div>

          {/* WeatherCard (維持原本的橫向樣式) */}
          <WeatherCard region="Hsinchu" />
        </div>

      </div>

      {/* Schedule Section */}
      <div style={{ display: 'flex' }}>
        {/* Left Side - Schedule */}
        <div style={{
          flex: 1,
          padding: '24px',
          backgroundColor: '#374151',
          color: 'white'
        }}>
          {/* Snack Time */}
          {showSnackTime && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div style={{
                  color: '#fbbf24',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>15:00 ~ 15:30 Snack Time</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <CheckCircle
                    size={20}
                    color="#fbbf24"
                    style={{ cursor: 'pointer' }}
                    onClick={() => console.log('Mark completed: Snack Time')}
                  />
                  <button
                    onClick={() => setShowSnackTime(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    <X size={20} color="#9ca3af" />
                  </button>
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
                color: '#d1d5db'
              }}>
                <MapPin size={16} />
                <span>Break Area</span>
                <div style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#6b7280',
                  borderRadius: '4px'
                }}></div>
              </div>
              <div style={{
                fontSize: '14px',
                color: '#d1d5db',
                marginBottom: '8px'
              }}>
                今天備受青茶準備茶點，放置在 Break Area，歡迎各位同仁前往享用。
              </div>
              <div style={{ fontSize: '14px', color: '#d1d5db' }}>
                <div>• 點心：瑪士塔、奶凍捲、小蛋糕</div>
                <div>• 飲料：五十嵐</div>
              </div>
            </div>
          )}

          {/* Q3 Report */}
          {showReport && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{
                  color: '#fbbf24',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>15:30 ~ 17:00 處理第三季 report</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <CheckCircle
                    size={20}
                    color="#fbbf24"
                    style={{ cursor: 'pointer' }}
                    onClick={() => console.log('Mark completed: Q3 Report')}
                  />
                  <button
                    onClick={() => setShowReport(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    <X size={20} color="#9ca3af" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dinner */}
          {showDinner && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div style={{
                  color: '#fbbf24',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>17:30 ~ 18:15 晚餐</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <CheckCircle
                    size={20}
                    color="#fbbf24"
                    style={{ cursor: 'pointer' }}
                    onClick={() => console.log('Mark completed: Dinner')}
                  />
                  <button
                    onClick={() => setShowDinner(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    <X size={20} color="#9ca3af" />
                  </button>
                </div>
              </div>
              <div style={{ fontSize: '14px', color: '#d1d5db' }}>
                晚餐推薦 — OOO：今日推薦菜單：韓式部隊鍋+洋蔥炸雞
              </div>
            </div>
          )}

          {/* Work Out */}
          {showWorkOut && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div style={{
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>19:00 ~ 20:00 Work Out</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <MapPin size={20} color="#9ca3af" />
                  <span style={{ fontSize: '14px', color: '#d1d5db' }}>健身工廠</span>
                  <button
                    onClick={() => setShowWorkOut(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      marginLeft: '8px'
                    }}
                  >
                    <X size={16} color="#9ca3af" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Notifications */}
        <div style={{
          width: '320px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Weather Alert */}
          {showWeatherAlert && (
            <div style={{
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              padding: '16px',
              borderLeft: '4px solid #fbbf24'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <AlertTriangle size={20} color="#fbbf24" style={{ marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#374151',
                    lineHeight: '1.5'
                  }}>
                    今晚有較大雨雨發生機率，交通易堵塞，建議您提早出發「Work Out」（預估交通時間：45分鐘）
                  </div>
                </div>
                <button
                  onClick={() => setShowWeatherAlert(false)}
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#d1d5db',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <X size={12} color="#6b7280" />
                </button>
              </div>
            </div>
          )}

          {/* Tomorrow Meeting */}
          {showMeetingAlert && (
            <div style={{
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              padding: '16px',
              borderLeft: '4px solid #3b82f6'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Clock size={20} color="#3b82f6" style={{ marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: '500',
                    color: '#1f2937',
                    marginBottom: '4px'
                  }}>明天（9/5）Daily Meeting</div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>需準備 Q3 report</div>
                </div>
                <button
                  onClick={() => setShowMeetingAlert(false)}
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#d1d5db',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <X size={12} color="#6b7280" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Dashboard component (formerly App)
function Dashboard() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('default');

  // Sample events to demonstrate the calendar functionality
  // Current week: September 15-21, 2025 (Monday-Sunday)
  const [events, setEvents] = useState([
    {
      id: '1',
      title: 'Team Standup',
      startDate: createDate(2025, 9, 15, 9, 0),   // Sep 15, 2025 9:00 AM (Monday)
      endDate: createDate(2025, 9, 15, 9, 30),    // Sep 15, 2025 9:30 AM
      startTime: '09:00',
      endTime: '09:30',
      theme: 'main',
      isAllDay: false,
    },
    {
      id: '2',
      title: 'Touch Gestures Demo',
      startDate: createDate(2025, 9, 16, 14, 0),  // Sep 16, 2025 2:00 PM (Tuesday - Today!)
      endDate: createDate(2025, 9, 16, 15, 0),    // Sep 16, 2025 3:00 PM
      startTime: '14:00',
      endTime: '15:00',
      theme: 'info',
      isAllDay: false,
    },
    {
      id: '3',
      title: 'Client Presentation',
      startDate: createDate(2025, 9, 17, 10, 0),  // Sep 17, 2025 10:00 AM (Wednesday)
      endDate: createDate(2025, 9, 17, 11, 30),   // Sep 17, 2025 11:30 AM
      startTime: '10:00',
      endTime: '11:30',
      theme: 'suggestion',
      isAllDay: false,
    },
    {
      id: '4',
      title: 'Sprint Planning',
      startDate: createDate(2025, 9, 18, 13, 0),  // Sep 18, 2025 1:00 PM (Thursday)
      endDate: createDate(2025, 9, 18, 15, 0),    // Sep 18, 2025 3:00 PM
      startTime: '13:00',
      endTime: '15:00',
      theme: 'main',
      isAllDay: false,
    },
    {
      id: '5',
      title: 'Team Lunch',
      startDate: createDate(2025, 9, 19, 12, 0),  // Sep 19, 2025 12:00 PM (Friday)
      endDate: createDate(2025, 9, 19, 13, 30),   // Sep 19, 2025 1:30 PM
      startTime: '12:00',
      endTime: '13:30',
      theme: 'announcement',
      isAllDay: false,
    },
    {
      id: '6',
      title: 'Weekend Project',
      startDate: createDate(2025, 9, 20, 10, 0),  // Sep 20, 2025 10:00 AM (Saturday)
      endDate: createDate(2025, 9, 20, 12, 0),    // Sep 20, 2025 12:00 PM
      startTime: '10:00',
      endTime: '12:00',
      theme: 'info',
      isAllDay: false,
    },
  ]);

  const handleEventCreate = (event) => {
    console.log('Creating event:', event);
    setEvents(prevEvents => [...prevEvents, event]);
  };

  const handleEventUpdate = (updatedEvent) => {
    console.log('Updating event:', updatedEvent);
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  };

  const handleEventDelete = (eventId) => {
    console.log('Deleting event:', eventId);
    setEvents(prevEvents =>
      prevEvents.filter(event => event.id !== eventId)
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header with Navigation */}
      <div style={{
        backgroundColor: '#374151',
        color: 'white',
        padding: '16px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>

          {/* Navigation Menu */}
          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            <button
              onClick={() => setCurrentPage('default')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: currentPage === 'default' ? '#1f2937' : 'transparent',
                color: 'white',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (currentPage !== 'default') {
                  e.target.style.backgroundColor = '#4b5563';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 'default') {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Home size={16} />
              Home
            </button>

            <button
              onClick={() => setCurrentPage('calendar')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: currentPage === 'calendar' ? '#1f2937' : 'transparent',
                color: 'white',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (currentPage !== 'calendar') {
                  e.target.style.backgroundColor = '#4b5563';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 'calendar') {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Calendar size={16} />
              Calendar
            </button>
          </div>

          {/* User Authentication Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {loading ? (
              <div style={{
                color: '#9ca3af',
                fontSize: '14px'
              }}>
                Loading...
              </div>
            ) : isAuthenticated ? (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}>
                  <User size={16} />
                  <span>Welcome, {user?.username}</span>
                </div>
                <button
                  onClick={logout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    color: 'white',
                    border: '1px solid #4b5563',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#4b5563';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: '1px solid #3b82f6',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#3b82f6';
                }}
              >
                <LogIn size={16} />
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div style={{ padding: '24px' }}>
        {currentPage === 'default' && <DefaultPage />}
        {currentPage === 'calendar' && (
          <div className="app">
            <div className="calendar-container">
              <MobileCalendar
                initialDate={new Date()}
                events={events}
                onEventCreate={handleEventCreate}
                onEventUpdate={handleEventUpdate}
                onEventDelete={handleEventDelete}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main App component with routing
function App() {
  return (
    <Router>
      <Routes>
        {/* Public route - Login page */}
        <Route
          path="/login"
          element={
            <ProtectedRoute requireAuth={false}>
              <LoginPage />
            </ProtectedRoute>
          }
        />

        {/* Protected routes - Main application */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;