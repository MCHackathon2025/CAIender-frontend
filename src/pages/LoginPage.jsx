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
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <button
          onClick={handleBackToApp}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <ArrowLeft size={16} />
          Back to App
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'white',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          <Calendar size={24} />
          Calendar App
        </div>
      </div>

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
              {mode === 'login' ? 'Welcome Back!' : 'Join Us Today!'}
            </h1>
            <p style={{
              fontSize: '18px',
              margin: 0,
              opacity: 0.9
            }}>
              {mode === 'login'
                ? 'Sign in to access your personalized calendar and schedule'
                : 'Create your account to start organizing your schedule'
              }
            </p>
          </div>

          {/* Auth Form */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
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

          {/* Additional Info */}
          <div style={{
            textAlign: 'center',
            marginTop: '32px',
            color: 'white',
            fontSize: '14px',
            opacity: 0.8
          }}>
            <p style={{ margin: 0 }}>
              Secure authentication powered by GraphQL
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '20px 24px',
        textAlign: 'center',
        color: 'white',
        fontSize: '12px',
        opacity: 0.6
      }}>
        <p style={{ margin: 0 }}>
          © 2025 Calendar App. Built with React and GraphQL.
        </p>
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
