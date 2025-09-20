import React, { useState } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm.jsx';
import RegisterForm from './RegisterForm.jsx';

const AuthModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'

  if (!isOpen) return null;

  const handleSuccess = () => {
    // Close modal on successful login/register
    onClose();
  };

  const handleToggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={handleBackdropClick}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: '#f3f4f6',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 1001,
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#e5e7eb';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#f3f4f6';
          }}
        >
          <X size={20} color="#6b7280" />
        </button>

        {/* Form Content */}
        <div style={{ padding: '20px' }}>
          {mode === 'login' ? (
            <LoginForm
              onToggleMode={handleToggleMode}
              onSuccess={handleSuccess}
            />
          ) : (
            <RegisterForm
              onToggleMode={handleToggleMode}
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
