// src/services/gpsAPI.js

/**
 * GPS API Service
 * Provides geolocation functionality with error handling and fallbacks
 * Uses client-side caching and HTTP headers for location data
 */

// Default GPS options
const DEFAULT_GPS_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000, // 5 minutes
};

// Cache configuration
const CACHE_CONFIG = {
  LOCATION_KEY: 'gps_location_cache',
  ADDRESS_KEY: 'gps_address_cache',
  TTL: 15 * 60 * 1000, // 15 minutes in milliseconds
  MAX_AGE: 30 * 60 * 1000, // 30 minutes maximum age
};

/**
 * Cache Management Utilities
 */
class LocationCache {
  /**
   * Get cached location data
   * @param {string} key - Cache key
   * @returns {Object|null} Cached data or null if expired/missing
   */
  static get(key) {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      const age = now - timestamp;

      // Check if cache is expired
      if (age > CACHE_CONFIG.MAX_AGE) {
        this.clear(key);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Failed to read from cache:', error);
      return null;
    }
  }

  /**
   * Set cached location data
   * @param {string} key - Cache key
   * @param {Object} data - Data to cache
   */
  static set(key, data) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to write to cache:', error);
    }
  }

  /**
   * Clear cached data
   * @param {string} key - Cache key (optional, clears all if not provided)
   */
  static clear(key) {
    try {
      if (key) {
        localStorage.removeItem(key);
      } else {
        // Clear all GPS-related cache
        Object.values(CACHE_CONFIG).forEach(k => {
          if (typeof k === 'string' && k.includes('cache')) {
            localStorage.removeItem(k);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Check if cached data is still valid (not expired)
   * @param {string} key - Cache key
   * @returns {boolean} True if valid
   */
  static isValid(key) {
    const cached = localStorage.getItem(key);
    if (!cached) return false;

    try {
      const { timestamp } = JSON.parse(cached);
      const now = Date.now();
      const age = now - timestamp;
      return age < CACHE_CONFIG.TTL;
    } catch {
      return false;
    }
  }

  /**
   * Get cache age in milliseconds
   * @param {string} key - Cache key
   * @returns {number} Age in ms, or 0 if not found
   */
  static getAge(key) {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return 0;

      const { timestamp } = JSON.parse(cached);
      return Date.now() - timestamp;
    } catch {
      return 0;
    }
  }
}

/**
 * HTTP Headers Utilities for Location Data
 */
class LocationHeaders {
  /**
   * Create headers object with location data
   * @param {Object} coordinates - GPS coordinates
   * @param {string} address - Location address
   * @returns {Object} Headers object
   */
  static createLocationHeaders(coordinates, address) {
    if (!coordinates) return {};

    return {
      'X-Location-Latitude': coordinates.latitude.toString(),
      'X-Location-Longitude': coordinates.longitude.toString(),
      'X-Location-Accuracy': coordinates.accuracy?.toString() || '',
      'X-Location-Address': address || '',
      'X-Location-Timestamp': coordinates.timestamp?.toString() || Date.now().toString(),
    };
  }

  /**
   * Extract location data from response headers
   * @param {Headers} headers - Response headers
   * @returns {Object|null} Location data or null
   */
  static extractFromHeaders(headers) {
    const lat = headers.get('X-Location-Latitude');
    const lng = headers.get('X-Location-Longitude');

    if (!lat || !lng) return null;

    return {
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      accuracy: parseFloat(headers.get('X-Location-Accuracy')) || null,
      address: headers.get('X-Location-Address') || null,
      timestamp: parseInt(headers.get('X-Location-Timestamp')) || Date.now(),
    };
  }

  /**
   * Enhanced fetch with location headers
   * @param {string} url - Request URL
   * @param {Object} options - Fetch options
   * @returns {Promise<Response>} Fetch response
   */
  static async fetchWithLocation(url, options = {}) {
    // Get cached location
    const cachedLocation = LocationCache.get(CACHE_CONFIG.LOCATION_KEY);
    const cachedAddress = LocationCache.get(CACHE_CONFIG.ADDRESS_KEY);

    // Add location headers if available
    const headers = {
      ...options.headers,
      ...this.createLocationHeaders(cachedLocation, cachedAddress),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response;
  }
}

/**
 * Get current GPS coordinates
 * @param {Object} options - GPS options
 * @returns {Promise<Object>} Coordinates object with lat, lng, accuracy
 */
export async function getCurrentPosition(options = {}) {
  const { useCache = true, forceRefresh = false } = options;

  // Check cache first if not forcing refresh
  if (useCache && !forceRefresh) {
    const cachedLocation = LocationCache.get(CACHE_CONFIG.LOCATION_KEY);
    if (cachedLocation && LocationCache.isValid(CACHE_CONFIG.LOCATION_KEY)) {
      console.log('Using cached location data');
      return cachedLocation;
    }
  }

  const gpsOptions = { ...DEFAULT_GPS_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        // Cache the location data
        if (useCache) {
          LocationCache.set(CACHE_CONFIG.LOCATION_KEY, coordinates);
        }

        resolve(coordinates);
      },
      (error) => {
        const errorMessage = getGeolocationErrorMessage(error);
        reject(new Error(errorMessage));
      },
      gpsOptions
    );
  });
}

/**
 * Watch GPS position changes
 * @param {Function} callback - Callback function for position updates
 * @param {Object} options - GPS options
 * @returns {number} Watch ID for clearing the watch
 */
export function watchPosition(callback, options = {}) {
  const gpsOptions = { ...DEFAULT_GPS_OPTIONS, ...options };

  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by this browser');
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      const coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      };
      callback(coordinates);
    },
    (error) => {
      const errorMessage = getGeolocationErrorMessage(error);
      callback(null, new Error(errorMessage));
    },
    gpsOptions
  );
}

/**
 * Clear position watch
 * @param {number} watchId - Watch ID returned by watchPosition
 */
export function clearWatch(watchId) {
  if (navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
}

/**
 * Get human-readable error message for geolocation errors
 * @param {Object} error - Geolocation error object
 * @returns {string} Error message
 */
function getGeolocationErrorMessage(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location access denied by user. Please enable location permissions in your browser settings.';
    case error.POSITION_UNAVAILABLE:
      return 'Location information is unavailable. Please check your GPS/network connection.';
    case error.TIMEOUT:
      return 'Location request timed out. Please try again.';
    default:
      return 'An unknown error occurred while retrieving location.';
  }
}

/**
 * Convert coordinates to address using reverse geocoding
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {Object} options - Options including useCache
 * @returns {Promise<string>} Address string
 */
export async function reverseGeocode(latitude, longitude, options = {}) {
  const { useCache = true, forceRefresh = false } = options;
  const cacheKey = `${CACHE_CONFIG.ADDRESS_KEY}_${latitude.toFixed(4)}_${longitude.toFixed(4)}`;

  // Check cache first if not forcing refresh
  if (useCache && !forceRefresh) {
    const cachedAddress = LocationCache.get(cacheKey);
    if (cachedAddress && LocationCache.isValid(cacheKey)) {
      console.log('Using cached address data');
      return cachedAddress;
    }
  }

  try {
    // Using a free reverse geocoding service (you can replace with your preferred service)
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();
    const address = data.locality || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

    // Cache the address
    if (useCache) {
      LocationCache.set(cacheKey, address);
    }

    return address;
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
    const fallbackAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

    // Cache fallback address
    if (useCache) {
      LocationCache.set(cacheKey, fallbackAddress);
    }

    return fallbackAddress;
  }
}

/**
 * Calculate distance between two coordinates (in kilometers)
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if GPS permissions are granted
 * @returns {Promise<boolean>} True if permissions are granted
 */
export async function checkGPSPermissions() {
  if (!navigator.permissions) {
    // Fallback: try to get position with very short timeout
    try {
      await getCurrentPosition({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return permission.state === 'granted';
  } catch {
    return false;
  }
}

/**
 * Request GPS permissions
 * @returns {Promise<boolean>} True if permissions are granted
 */
export async function requestGPSPermissions() {
  try {
    await getCurrentPosition();
    return true;
  } catch (error) {
    console.warn('GPS permission request failed:', error);
    return false;
  }
}

/**
 * Cache Management Functions
 */

/**
 * Get cached location data
 * @returns {Object|null} Cached location or null
 */
export function getCachedLocation() {
  return LocationCache.get(CACHE_CONFIG.LOCATION_KEY);
}

/**
 * Get cached address data
 * @param {number} latitude - Latitude (optional, for specific coordinate cache)
 * @param {number} longitude - Longitude (optional, for specific coordinate cache)
 * @returns {string|null} Cached address or null
 */
export function getCachedAddress(latitude, longitude) {
  if (latitude && longitude) {
    const cacheKey = `${CACHE_CONFIG.ADDRESS_KEY}_${latitude.toFixed(4)}_${longitude.toFixed(4)}`;
    return LocationCache.get(cacheKey);
  }
  return LocationCache.get(CACHE_CONFIG.ADDRESS_KEY);
}

/**
 * Clear all location cache
 */
export function clearLocationCache() {
  LocationCache.clear();
}

/**
 * Check if location cache is valid
 * @returns {boolean} True if valid
 */
export function isLocationCacheValid() {
  return LocationCache.isValid(CACHE_CONFIG.LOCATION_KEY);
}

/**
 * Get cache age in milliseconds
 * @returns {number} Age in ms
 */
export function getLocationCacheAge() {
  return LocationCache.getAge(CACHE_CONFIG.LOCATION_KEY);
}

/**
 * Enhanced fetch with automatic location headers
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response with location headers
 */
export async function fetchWithLocation(url, options = {}) {
  return LocationHeaders.fetchWithLocation(url, options);
}

/**
 * Create location headers for manual use
 * @param {Object} coordinates - GPS coordinates
 * @param {string} address - Location address
 * @returns {Object} Headers object
 */
export function createLocationHeaders(coordinates, address) {
  return LocationHeaders.createLocationHeaders(coordinates, address);
}

/**
 * Extract location from response headers
 * @param {Headers} headers - Response headers
 * @returns {Object|null} Location data or null
 */
export function extractLocationFromHeaders(headers) {
  return LocationHeaders.extractFromHeaders(headers);
}
