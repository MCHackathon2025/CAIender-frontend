import React, { useEffect, useState, useCallback } from 'react';
import { fetchWeather } from '../services/weatherAPI';
import './App.css';

/**
 * WeatherCard component - Displays weather information for a specific region
 * Provides loading states, error handling, and retry functionality
 */
const WeatherCard = ({
  region,
  showDetails = false,
  refreshInterval = 0,
  onError = null,
  className = '',
  style = {}
}) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Maximum retry attempts
  const MAX_RETRIES = 3;

  // Fetch weather data with error handling and retry logic
  const fetchWeatherData = useCallback(async (isRetry = false) => {
    if (!region) {
      setError('No region specified');
      setLoading(false);
      return;
    }

    try {
      if (!isRetry) {
        setLoading(true);
      }
      setError(null);

      const weatherData = await fetchWeather(region);

      setWeather(weatherData);
      setLastUpdated(new Date());
      setRetryCount(0);

      console.log('Weather data fetched successfully:', { region, weatherData });
    } catch (err) {
      console.error('Weather fetch failed:', err);

      const errorMessage = err.message || 'Failed to fetch weather data';
      setError(errorMessage);

      // Notify parent component of error
      if (onError) {
        onError(errorMessage, retryCount);
      }
    } finally {
      setLoading(false);
    }
  }, [region, onError, retryCount]);

  // Initial data fetch
  useEffect(() => {
    fetchWeatherData();
  }, [region]);

  // Auto-refresh functionality
  useEffect(() => {
    if (refreshInterval > 0 && weather) {
      const interval = setInterval(() => {
        fetchWeatherData();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval, weather, fetchWeatherData]);

  // Retry function with exponential backoff
  const handleRetry = useCallback(() => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1);
      // Exponential backoff: wait 1s, 2s, 4s
      const delay = Math.pow(2, retryCount) * 1000;

      setTimeout(() => {
        fetchWeatherData(true);
      }, delay);
    }
  }, [retryCount, fetchWeatherData]);

  // Format last updated time
  const formatLastUpdated = (date) => {
    if (!date) return '';

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString();
  };

  // Loading state
  if (loading && !weather) {
    return (
      <div
        className={`weather-card loading ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: 'var(--text-secondary)',
          fontSize: 'var(--font-size-sm)',
          ...style
        }}
      >
        <div
          className="loading-spinner"
          style={{
            width: '16px',
            height: '16px',
            borderWidth: '2px'
          }}
        />
        <span>Loading weather...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`weather-card error ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: 'var(--error-color)',
          fontSize: 'var(--font-size-sm)',
          ...style
        }}
      >
        <span>⚠️</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span>{error}</span>
          {retryCount < MAX_RETRIES && (
            <button
              onClick={handleRetry}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--error-color)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-xs)',
                textDecoration: 'underline'
              }}
              disabled={loading}
            >
              {loading ? 'Retrying...' : 'Retry'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // No weather data
  if (!weather) {
    return (
      <div
        className={`weather-card no-data ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: 'var(--text-muted)',
          fontSize: 'var(--font-size-sm)',
          ...style
        }}
      >
        <span>No weather data available</span>
      </div>
    );
  }

  // Success state - Compact view
  if (!showDetails) {
    return (
      <div
        className={`weather-card compact ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: 'var(--text-primary)',
          fontSize: 'var(--font-size-sm)',
          ...style
        }}
        title={`${weather.temperature}°C, ${weather.humidity}% humidity - ${region}${lastUpdated ? ` (${formatLastUpdated(lastUpdated)})` : ''}`}
      >
        <span style={{ fontWeight: '500' }}>{weather.temperature}°C</span>
        <div
          style={{
            width: '20px',
            height: '20px',
            backgroundColor: 'var(--primary-color)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px'
          }}
          title="Temperature"
        >
          🌡️
        </div>
        <span>{weather.humidity}%</span>
      </div>
    );
  }

  // Success state - Detailed view
  return (
    <div
      className={`weather-card detailed ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
        backgroundColor: 'var(--background-color)',
        borderRadius: 'var(--border-radius)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        minWidth: '200px',
        ...style
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>
          {region}
        </h4>
        {lastUpdated && (
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            {formatLastUpdated(lastUpdated)}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600' }}>
            {weather.temperature}°C
          </span>
          <div
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: 'var(--primary-color)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px'
            }}
          >
            🌡️
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            Humidity:
          </span>
          <span style={{ fontWeight: '500' }}>
            {weather.humidity}%
          </span>
        </div>
      </div>

      {refreshInterval > 0 && (
        <button
          onClick={() => fetchWeatherData()}
          style={{
            background: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius)',
            padding: '4px 8px',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Refresh'}
        </button>
      )}
    </div>
  );
};

export default WeatherCard;