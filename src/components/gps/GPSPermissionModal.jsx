// src/components/gps/GPSPermissionModal.jsx

import React, { useState } from 'react';
import { useGPS } from '../../hooks/useGPS';

/**
 * GPS Permission Modal Component
 * Handles GPS permissions and provides user-friendly error messages
 */
export function GPSPermissionModal({ isOpen, onClose, onPermissionGranted, onPermissionDenied }) {
  const [isRequesting, setIsRequesting] = useState(false);
  const { requestPermissions, error } = useGPS();

  const handleRequestPermission = async () => {
    setIsRequesting(true);

    try {
      const granted = await requestPermissions();

      if (granted) {
        onPermissionGranted?.();
        onClose?.();
      } else {
        onPermissionDenied?.();
      }
    } catch (err) {
      console.error('GPS permission request failed:', err);
      onPermissionDenied?.();
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDeny = () => {
    onPermissionDenied?.();
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="gps-modal-overlay">
      <div className="gps-modal">
        <div className="gps-modal-header">
          <h3>Location Access Required</h3>
        </div>

        <div className="gps-modal-content">
          <div className="gps-icon">📍</div>

          <p>
            This app needs access to your location to provide accurate weather information
            and location-based features.
          </p>

          <div className="gps-benefits">
            <h4>Benefits of enabling location:</h4>
            <ul>
              <li>Get weather for your exact location</li>
              <li>Receive location-based recommendations</li>
              <li>Enhanced calendar and scheduling features</li>
            </ul>
          </div>

          {error && (
            <div className="gps-error">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        <div className="gps-modal-actions">
          <button
            className="gps-btn gps-btn-secondary"
            onClick={handleDeny}
            disabled={isRequesting}
          >
            Not Now
          </button>

          <button
            className="gps-btn gps-btn-primary"
            onClick={handleRequestPermission}
            disabled={isRequesting}
          >
            {isRequesting ? 'Requesting...' : 'Allow Location Access'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * GPS Error Alert Component
 * Shows GPS-related errors in a user-friendly way
 */
export function GPSErrorAlert({ error, onRetry, onDismiss }) {
  if (!error) return null;

  const getErrorMessage = (errorMessage) => {
    if (errorMessage.includes('denied')) {
      return {
        title: 'Location Access Denied',
        message: 'Please enable location permissions in your browser settings to use GPS features.',
        action: 'Enable Location'
      };
    }

    if (errorMessage.includes('unavailable')) {
      return {
        title: 'Location Unavailable',
        message: 'Unable to determine your location. Please check your GPS/network connection.',
        action: 'Retry'
      };
    }

    if (errorMessage.includes('timeout')) {
      return {
        title: 'Location Request Timed Out',
        message: 'The location request took too long. Please try again.',
        action: 'Retry'
      };
    }

    return {
      title: 'Location Error',
      message: errorMessage,
      action: 'Retry'
    };
  };

  const { title, message, action } = getErrorMessage(error);

  return (
    <div className="gps-error-alert">
      <div className="gps-error-content">
        <div className="gps-error-icon">⚠️</div>
        <div className="gps-error-text">
          <h4>{title}</h4>
          <p>{message}</p>
        </div>
      </div>

      <div className="gps-error-actions">
        {onDismiss && (
          <button
            className="gps-btn gps-btn-secondary gps-btn-sm"
            onClick={onDismiss}
          >
            Dismiss
          </button>
        )}

        {onRetry && (
          <button
            className="gps-btn gps-btn-primary gps-btn-sm"
            onClick={onRetry}
          >
            {action}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * GPS Status Indicator Component
 * Shows current GPS status and location info
 */
export function GPSStatusIndicator({ coordinates, address, loading, error }) {
  if (loading) {
    return (
      <div className="gps-status gps-status-loading">
        <div className="gps-spinner"></div>
        <span>Getting location...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gps-status gps-status-error">
        <span className="gps-icon">❌</span>
        <span>Location unavailable</span>
      </div>
    );
  }

  if (coordinates) {
    return (
      <div className="gps-status gps-status-success">
        <span className="gps-icon">📍</span>
        <div className="gps-location-info">
          <div className="gps-address">{address}</div>
          <div className="gps-coordinates">
            {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gps-status gps-status-inactive">
      <span className="gps-icon">📍</span>
      <span>Location not available</span>
    </div>
  );
}
