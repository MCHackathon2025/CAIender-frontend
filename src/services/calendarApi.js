import { gql } from 'graphql-request';
import graphqlClient, { setAuthToken } from './graphql.js';

// GraphQL queries and mutations for calendar events
const GET_USER_EVENTS_QUERY = gql`
  query GetUserEvents {
    me {
      id
      events {
        eventId
        title
        startTime
        endTime
        description
        type
        location
        createTime
        ownerId
      }
    }
  }
`;

const GET_EVENT_QUERY = gql`
  query GetEvent($input: GetEventInput!) {
    getEvent(input: $input) {
      eventId
      title
      startTime
      endTime
      description
      type
      location
      createTime
      ownerId
    }
  }
`;

const CREATE_EVENT_MUTATION = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      eventId
      title
      startTime
      endTime
      description
      type
      location
      createTime
      ownerId
    }
  }
`;

const UPDATE_EVENT_MUTATION = gql`
  mutation UpdateEvent($input: UpdateEventInput!) {
    updateEvent(input: $input) {
      eventId
      title
      startTime
      endTime
      description
      type
      location
      createTime
      ownerId
    }
  }
`;

const DELETE_EVENT_MUTATION = gql`
  mutation DeleteEvent($input: DeleteEventInput!) {
    deleteEvent(input: $input)
  }
`;

/**
 * Transform frontend event format to backend format
 * @param {Object} frontendEvent - Event in frontend format
 * @returns {Object} Event in backend format
 */
const transformToBackendFormat = (frontendEvent) => {
  // Helper function to convert date/time to full datetime string for backend storage
  const formatDateTimeForBackend = (timeValue, dateValue) => {
    if (!timeValue) return '';

    // If it's already in HH:MM format, combine with date
    if (typeof timeValue === 'string' && /^\d{2}:\d{2}$/.test(timeValue)) {
      if (dateValue) {
        // Create a Date object from the date and time
        const eventDate = dateValue instanceof Date ? dateValue : new Date(dateValue);
        const [hours, minutes] = timeValue.split(':');
        eventDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        return eventDate.toISOString();
      }
      // Fallback to time-only if no date available
      return timeValue;
    }

    // If it's a Date object, convert to ISO string
    if (timeValue instanceof Date) {
      return timeValue.toISOString();
    }

    // If it's a datetime string, try to parse and return as ISO
    if (typeof timeValue === 'string') {
      try {
        const date = new Date(timeValue);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      } catch (e) {
        console.warn('Failed to parse time value:', timeValue);
      }
    }

    // Fallback - return original value as string
    return String(timeValue);
  };

  // Extract date from startDate or endDate if available
  const eventDate = frontendEvent.startDate || frontendEvent.endDate;

  return {
    title: frontendEvent.title,
    startTime: formatDateTimeForBackend(frontendEvent.startTime, eventDate),
    endTime: formatDateTimeForBackend(frontendEvent.endTime, eventDate),
    description: frontendEvent.description || '',
    type: frontendEvent.type || 'USER_CREATE',
    location: frontendEvent.location || null
  };
};

/**
 * Transform backend event format to frontend format
 * @param {Object} backendEvent - Event in backend format
 * @returns {Object} Event in frontend format
 */
const transformToFrontendFormat = (backendEvent) => {
  // Helper function to extract time from datetime string or return time as-is
  const extractTimeFromDateTime = (timeString) => {
    if (!timeString) return '00:00';

    // If it's already in HH:MM format, return as-is
    if (typeof timeString === 'string' && /^\d{2}:\d{2}$/.test(timeString)) {
      return timeString;
    }

    // If it's a datetime string, extract time
    try {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      }
    } catch (e) {
      console.warn('Failed to parse datetime string:', timeString);
    }

    return '00:00'; // Fallback
  };

  // Helper function to extract date from datetime string or use today as fallback
  const extractDateFromDateTime = (timeString) => {
    if (!timeString) return new Date();

    // If it's a datetime string, parse it
    try {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (e) {
      console.warn('Failed to parse datetime string for date:', timeString);
    }

    // Fallback: use today with the time component if it's in HH:MM format
    if (typeof timeString === 'string' && /^\d{2}:\d{2}$/.test(timeString)) {
      const today = new Date();
      const [hours, minutes] = timeString.split(':');
      today.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      return today;
    }

    return new Date(); // Final fallback
  };

  return {
    id: backendEvent.eventId,
    title: backendEvent.title,
    startTime: extractTimeFromDateTime(backendEvent.startTime),
    endTime: extractTimeFromDateTime(backendEvent.endTime),
    description: backendEvent.description,
    theme: mapEventTypeToTheme(backendEvent.type),
    type: backendEvent.type,
    location: backendEvent.location,
    createTime: backendEvent.createTime,
    ownerId: backendEvent.ownerId,
    // Extract dates from datetime strings
    startDate: extractDateFromDateTime(backendEvent.startTime),
    endDate: extractDateFromDateTime(backendEvent.endTime),
    isAllDay: false
  };
};

/**
 * Map backend event type to frontend theme
 * @param {string} eventType - Backend event type
 * @returns {string} Frontend theme
 */
const mapEventTypeToTheme = (eventType) => {
  const themeMap = {
    'USER_CREATE': 'main',
    'BROADCAST': 'announcement',
    'AI_SUGGESTION': 'suggestion',
    'AI_RECOMMENDATION': 'info'
  };
  return themeMap[eventType] || 'main';
};


/**
 * Ensure auth token is set before making requests
 */
const ensureAuthToken = () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    setAuthToken(token);
  }
  return token;
};

/**
 * Calendar API service for CRUD operations
 */
export const calendarApi = {
  /**
   * Get all events for the current user
   * @returns {Promise<Array>} Array of events in frontend format
   */
  async getEvents() {
    try {
      console.log('Fetching user events...');

      // Ensure auth token is set
      const token = ensureAuthToken();
      if (!token) {
        return { success: false, error: 'No authentication token found. Please log in.' };
      }

      const data = await graphqlClient.request(GET_USER_EVENTS_QUERY);

      if (data.me?.events) {
        const transformedEvents = data.me.events.map(transformToFrontendFormat);
        console.log('Events fetched successfully:', transformedEvents.length);
        return { success: true, events: transformedEvents };
      }

      return { success: true, events: [] };
    } catch (error) {
      console.error('Error fetching events:', error);
      return {
        success: false,
        error: error.response?.errors?.[0]?.message || error.message || 'Failed to fetch events'
      };
    }
  },

  /**
   * Get a specific event by ID
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} Event in frontend format
   */
  async getEvent(eventId) {
    try {
      console.log('Fetching event:', eventId);

      // Ensure auth token is set
      const token = ensureAuthToken();
      if (!token) {
        return { success: false, error: 'No authentication token found. Please log in.' };
      }

      const data = await graphqlClient.request(GET_EVENT_QUERY, {
        input: { eventId }
      });

      if (data.getEvent) {
        const transformedEvent = transformToFrontendFormat(data.getEvent);
        console.log('Event fetched successfully:', transformedEvent);
        return { success: true, event: transformedEvent };
      }

      return { success: false, error: 'Event not found' };
    } catch (error) {
      console.error('Error fetching event:', error);
      return {
        success: false,
        error: error.response?.errors?.[0]?.message || error.message || 'Failed to fetch event'
      };
    }
  },

  /**
   * Create a new event
   * @param {Object} eventData - Event data in frontend format
   * @returns {Promise<Object>} Created event in frontend format
   */
  async createEvent(eventData) {
    try {
      console.log('Creating event:', eventData);

      // Ensure auth token is set
      const token = ensureAuthToken();
      if (!token) {
        return { success: false, error: 'No authentication token found. Please log in.' };
      }

      const backendEvent = transformToBackendFormat(eventData);

      const data = await graphqlClient.request(CREATE_EVENT_MUTATION, {
        input: backendEvent
      });

      if (data.createEvent) {
        const transformedEvent = transformToFrontendFormat(data.createEvent);
        console.log('Event created successfully:', transformedEvent);
        return { success: true, event: transformedEvent };
      }

      return { success: false, error: 'Failed to create event' };
    } catch (error) {
      console.error('Error creating event:', error);
      return {
        success: false,
        error: error.response?.errors?.[0]?.message || error.message || 'Failed to create event'
      };
    }
  },

  /**
   * Update an existing event
   * @param {string} eventId - Event ID
   * @param {Object} eventData - Updated event data in frontend format
   * @returns {Promise<Object>} Updated event in frontend format
   */
  async updateEvent(eventId, eventData) {
    try {
      console.log('Updating event:', eventId, eventData);

      // Ensure auth token is set
      const token = ensureAuthToken();
      if (!token) {
        return { success: false, error: 'No authentication token found. Please log in.' };
      }

      const backendEvent = transformToBackendFormat(eventData);

      const data = await graphqlClient.request(UPDATE_EVENT_MUTATION, {
        input: {
          eventID: eventId,
          ...backendEvent
        }
      });

      if (data.updateEvent) {
        const transformedEvent = transformToFrontendFormat(data.updateEvent);
        console.log('Event updated successfully:', transformedEvent);
        return { success: true, event: transformedEvent };
      }

      return { success: false, error: 'Failed to update event' };
    } catch (error) {
      console.error('Error updating event:', error);
      return {
        success: false,
        error: error.response?.errors?.[0]?.message || error.message || 'Failed to update event'
      };
    }
  },

  /**
   * Delete an event
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteEvent(eventId) {
    try {
      console.log('Deleting event:', eventId);

      // Ensure auth token is set
      const token = ensureAuthToken();
      if (!token) {
        return { success: false, error: 'No authentication token found. Please log in.' };
      }

      const data = await graphqlClient.request(DELETE_EVENT_MUTATION, {
        input: { eventId }
      });

      if (data.deleteEvent) {
        console.log('Event deleted successfully:', data.deleteEvent);
        return { success: true, message: data.deleteEvent };
      }

      return { success: false, error: 'Failed to delete event' };
    } catch (error) {
      console.error('Error deleting event:', error);
      return {
        success: false,
        error: error.response?.errors?.[0]?.message || error.message || 'Failed to delete event'
      };
    }
  }
};

export default calendarApi;