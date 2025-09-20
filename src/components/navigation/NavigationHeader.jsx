import React from 'react';
import { Home, Calendar, LogIn, LogOut, User } from 'lucide-react';
import NavigationButton from './NavigationButton';

/**
 * Navigation header component with mobile responsiveness
 */
const NavigationHeader = ({
  currentPage,
  onPageChange,
  isAuthenticated,
  user,
  onLogout,
  onLogin,
  loading,
  isMobile
}) => {
  return (
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
          <NavigationButton
            icon={Home}
            text="Home"
            onClick={() => onPageChange('default')}
            isActive={currentPage === 'default'}
            isMobile={isMobile}
          />
          <NavigationButton
            icon={Calendar}
            text="Calendar"
            onClick={() => onPageChange('calendar')}
            isActive={currentPage === 'calendar'}
            isMobile={isMobile}
          />
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
              <NavigationButton
                icon={LogOut}
                text="Logout"
                onClick={onLogout}
                isMobile={isMobile}
              />
            </>
          ) : (
            <NavigationButton
              icon={LogIn}
              text="Login"
              onClick={onLogin}
              variant="primary"
              isMobile={isMobile}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NavigationHeader;
