import React from 'react';

/**
 * Reusable navigation button component
 */
const NavigationButton = ({
  icon: Icon,
  text,
  onClick,
  isActive = false,
  isMobile = false,
  variant = 'default' // 'default' or 'primary'
}) => {
  const getButtonStyles = () => {
    const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '0px' : '8px',
      padding: isMobile ? '8px' : '8px 16px',
      color: 'white',
      border: '1px solid #4b5563',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.2s'
    };

    if (variant === 'primary') {
      return {
        ...baseStyles,
        backgroundColor: '#3b82f6',
        border: '1px solid #3b82f6'
      };
    }

    return {
      ...baseStyles,
      backgroundColor: isActive ? '#1f2937' : 'transparent'
    };
  };

  const handleMouseEnter = (e) => {
    if (variant === 'primary') {
      e.target.style.backgroundColor = '#2563eb';
    } else if (!isActive) {
      e.target.style.backgroundColor = '#4b5563';
    }
  };

  const handleMouseLeave = (e) => {
    if (variant === 'primary') {
      e.target.style.backgroundColor = '#3b82f6';
    } else if (!isActive) {
      e.target.style.backgroundColor = 'transparent';
    }
  };

  return (
    <button
      onClick={onClick}
      style={getButtonStyles()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Icon size={16} />
      {!isMobile && text}
    </button>
  );
};

export default NavigationButton;
