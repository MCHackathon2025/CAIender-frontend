import React, { useState, useEffect } from 'react';
import { Clock, MapPin, CheckCircle, X, AlertTriangle } from 'lucide-react';

function App() {
  // 時間狀態
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // 狀態管理：控制通知是否顯示
  const [showWeatherAlert, setShowWeatherAlert] = useState(true);
  const [showMeetingAlert, setShowMeetingAlert] = useState(true);
  
  // 狀態管理：控制日程任務是否顯示
  const [showSnackTime, setShowSnackTime] = useState(true);
  const [showReport, setShowReport] = useState(true);
  const [showDinner, setShowDinner] = useState(true);
  const [showWorkOut, setShowWorkOut] = useState(true);

  // 自動更新時間
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // 每秒更新一次
    
    return () => clearInterval(timer); // 清理定時器
  }, []);

  // 格式化時間顯示 (HH:MM)
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 格式化日期顯示 (Sep. 14 Thu.)
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
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#374151',
        color: 'white',
        padding: '16px'
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          margin: 0
        }}>會議記錄</h1>
      </div>
      
      <div style={{padding: '24px'}}>
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
              <span style={{fontSize: '14px'}}>Default Page</span>
            </div>
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '2px'
              }}>
                {[...Array(9)].map((_, i) => (
                  <div key={i} style={{
                    width: '4px',
                    height: '4px',
                    backgroundColor: '#4b5563',
                    borderRadius: '50%'
                  }}></div>
                ))}
              </div>
            </div>
            
            <div style={{marginTop: '32px'}}>
              <div style={{
                color: '#374151',
                fontSize: '14px',
                marginBottom: '8px'
              }}>{formatDate(currentTime)}</div>
              <div style={{
                fontSize: '60px',
                fontWeight: '300',
                color: '#374151',
                marginBottom: '16px'
              }}>{formatTime(currentTime)}</div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: '#374151'
              }}>
                <span>33°C</span>
                <div style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: '#4b5563',
                  borderRadius: '4px'
                }}></div>
                <span>20%</span>
              </div>
            </div>
          </div>

          {/* Schedule Section */}
          <div style={{display: 'flex'}}>
            {/* Left Side - Schedule */}
            <div style={{
              flex: 1,
              padding: '24px',
              backgroundColor: '#374151',
              color: 'white'
            }}>
              {/* Snack Time */}
              {showSnackTime && (
                <div style={{marginBottom: '24px'}}>
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
                    <div style={{display: 'flex', gap: '8px'}}>
                      <CheckCircle 
                        size={20} 
                        color="#fbbf24" 
                        style={{cursor: 'pointer'}}
                        onClick={() => console.log('標記完成: Snack Time')} 
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
                  <div style={{fontSize: '14px', color: '#d1d5db'}}>
                    <div>• 點心：瑪士塔、奶凍捲、小蛋糕</div>
                    <div>• 飲料：五十嵐</div>
                  </div>
                </div>
              )}

              {/* Q3 Report */}
              {showReport && (
                <div style={{marginBottom: '24px'}}>
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
                    <div style={{display: 'flex', gap: '8px'}}>
                      <CheckCircle 
                        size={20} 
                        color="#fbbf24" 
                        style={{cursor: 'pointer'}}
                        onClick={() => console.log('標記完成: Q3 Report')} 
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
                <div style={{marginBottom: '24px'}}>
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
                    <div style={{display: 'flex', gap: '8px'}}>
                      <CheckCircle 
                        size={20} 
                        color="#fbbf24" 
                        style={{cursor: 'pointer'}}
                        onClick={() => console.log('標記完成: 晚餐')} 
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
                  <div style={{fontSize: '14px', color: '#d1d5db'}}>
                    晚餐推薦 — OOO：今日推薦菜單：韓式部隊鍋+洋蔥炸雞
                  </div>
                </div>
              )}

              {/* Work Out */}
              {showWorkOut && (
                <div style={{marginBottom: '24px'}}>
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
                    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                      <MapPin size={20} color="#9ca3af" />
                      <span style={{fontSize: '14px', color: '#d1d5db'}}>健身工廠</span>
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
              {/* Weather Alert - 只有在 showWeatherAlert 為 true 時才顯示 */}
              {showWeatherAlert && (
                <div style={{
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px',
                  padding: '16px',
                  borderLeft: '4px solid #fbbf24'
                }}>
                  <div style={{display: 'flex', alignItems: 'flex-start', gap: '12px'}}>
                    <AlertTriangle size={20} color="#fbbf24" style={{marginTop: '2px'}} />
                    <div style={{flex: 1}}>
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

              {/* Tomorrow Meeting - 只有在 showMeetingAlert 為 true 時才顯示 */}
              {showMeetingAlert && (
                <div style={{
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px',
                  padding: '16px',
                  borderLeft: '4px solid #3b82f6'
                }}>
                  <div style={{display: 'flex', alignItems: 'flex-start', gap: '12px'}}>
                    <Clock size={20} color="#3b82f6" style={{marginTop: '2px'}} />
                    <div style={{flex: 1}}>
                      <div style={{
                        fontWeight: '500',
                        color: '#1f2937',
                        marginBottom: '4px'
                      }}>明天（9/5）Daily Meeting</div>
                      <div style={{
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>需準行李報 report</div>
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
      </div>
    </div>
  );
}

export default App;