// src/hooks/useGPS.js

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getCurrentPosition,
  watchPosition,
  clearWatch,
  reverseGeocode,
  checkGPSPermissions,
  requestGPSPermissions,
  getCachedLocation,
  getCachedAddress,
  clearLocationCache,
  isLocationCacheValid,
  getLocationCacheAge
} from '../services/gpsAPI';

/**
 * GPS Hook
 * Provides GPS functionality with React state management
 */
export function useGPS(options = {}) {
  const { useCache = true, autoLoadCache = true } = options;

  // Initialize with cached data if available
  const [coordinates, setCoordinates] = useState(() => {
    if (useCache && autoLoadCache) {
      return getCachedLocation();
    }
    return null;
  });

  const [address, setAddress] = useState(() => {
    if (useCache && autoLoadCache && coordinates) {
      return getCachedAddress(coordinates.latitude, coordinates.longitude);
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const watchIdRef = useRef(null);

  // Check permissions and cache validity on mount
  useEffect(() => {
    const checkPermissionsAndCache = async () => {
      try {
        const granted = await checkGPSPermissions();
        setPermissionsGranted(granted);

        // If we have cached data, check if it's still valid
        if (coordinates && useCache) {
          const isValid = isLocationCacheValid();
          if (!isValid) {
            console.log('Cached location data is expired, clearing...');
            setCoordinates(null);
            setAddress(null);
          } else {
            console.log('Using valid cached location data');
            const cacheAge = getLocationCacheAge();
            console.log(`Cache age: ${Math.round(cacheAge / 1000)}s`);
          }
        }
      } catch (err) {
        console.warn('Failed to check GPS permissions:', err);
      }
    };

    checkPermissionsAndCache();
  }, [coordinates, useCache]);

  // Cleanup watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        clearWatch(watchIdRef.current);
      }
    };
  }, []);

  /**
   * Get current GPS position
   */
  const getCurrentLocation = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const coords = await getCurrentPosition({
        ...options,
        useCache,
        forceRefresh
      });
      setCoordinates(coords);

      // Get address from coordinates
      try {
        const addr = await reverseGeocode(
          coords.latitude,
          coords.longitude,
          { useCache, forceRefresh }
        );
        setAddress(addr);
      } catch (geocodeError) {
        console.warn('Reverse geocoding failed:', geocodeError);
        setAddress(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      }

      setPermissionsGranted(true);
      return coords;
    } catch (err) {
      setError(err.message);
      setPermissionsGranted(false);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options, useCache]);

  /**
   * Start watching position changes
   */
  const startWatching = useCallback(() => {
    if (watchIdRef.current) {
      clearWatch(watchIdRef.current);
    }

    watchIdRef.current = watchPosition(
      (coords, err) => {
        if (err) {
          setError(err.message);
          return;
        }

        setCoordinates(coords);
        setError(null);

        // Update address
        reverseGeocode(coords.latitude, coords.longitude)
          .then(setAddress)
          .catch(() => {
            setAddress(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
          });
      },
      options
    );

    return watchIdRef.current;
  }, [options]);

  /**
   * Stop watching position changes
   */
  const stopWatching = useCallback(() => {
    if (watchIdRef.current) {
      clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  /**
   * Request GPS permissions
   */
  const requestPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const granted = await requestGPSPermissions();
      setPermissionsGranted(granted);

      if (granted) {
        await getCurrentLocation();
      } else {
        setError('GPS permissions were denied');
      }

      return granted;
    } catch (err) {
      setError(err.message);
      setPermissionsGranted(false);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getCurrentLocation]);

  /**
   * Clear all GPS data
   */
  const clearLocation = useCallback(() => {
    setCoordinates(null);
    setAddress(null);
    setError(null);
    stopWatching();

    // Clear cache if enabled
    if (useCache) {
      clearLocationCache();
    }
  }, [stopWatching, useCache]);

  /**
   * Refresh location data (force refresh from GPS)
   */
  const refreshLocation = useCallback(async () => {
    return getCurrentLocation(true);
  }, [getCurrentLocation]);

  /**
   * Get cache information
   */
  const getCacheInfo = useCallback(() => {
    if (!useCache) return null;

    return {
      isValid: isLocationCacheValid(),
      age: getLocationCacheAge(),
      hasCachedLocation: !!getCachedLocation(),
      coordinates: getCachedLocation(),
      address: coordinates ? getCachedAddress(coordinates.latitude, coordinates.longitude) : null,
    };
  }, [useCache, coordinates]);

  return {
    // State
    coordinates,
    address,
    loading,
    error,
    permissionsGranted,

    // Actions
    getCurrentLocation,
    startWatching,
    stopWatching,
    requestPermissions,
    clearLocation,
    refreshLocation,

    // Cache management
    getCacheInfo,

    // Computed values
    hasLocation: !!coordinates,
    isWatching: !!watchIdRef.current,
    cacheEnabled: useCache,
  };
}

/**
 * Simple GPS hook for one-time location fetch
 */
export function useCurrentLocation(options = {}) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const coords = await getCurrentPosition(options);
      const addr = await reverseGeocode(coords.latitude, coords.longitude);

      setLocation({
        coordinates: coords,
        address: addr,
      });

      return { coordinates: coords, address: addr };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return {
    location,
    loading,
    error,
    refetch: fetchLocation,
  };
}
