import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import LoginForm from '../components/auth/LoginForm.jsx';
import RegisterForm from '../components/auth/RegisterForm.jsx';
import { Calendar, ArrowLeft } from 'lucide-react';

const LoginPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login'); // 'login' or 'register'

  // Redirect to intended page or home if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, location]);

  const handleSuccess = () => {
    // Navigation will be handled by the useEffect above
  };

  const handleToggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  const handleBackToApp = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#64748b'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
      background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '480px'
        }}>
          {/* Welcome Section */}
          <div style={{
            textAlign: 'center',
            marginBottom: '40px',
            color: 'white'
          }}>
            <h1 style={{
              fontSize: '36px',
              fontWeight: '700',
              margin: '0 0 16px 0',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              CAIendar
            </h1>
            <p style={{
              fontSize: '18px',
              margin: 0,
              opacity: 0.9
            }}>
              An AI-powered calendar app powering your life
            </p>
          </div>

          {/* Auth Form */}
          <div style={{
            backgroundColor: 'transparent',

          }}>
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


      {/* CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
