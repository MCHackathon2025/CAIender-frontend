import { gql } from 'graphql-request';
import graphqlClient from './graphql.js';

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
  return {
    title: frontendEvent.title,
    startTime: frontendEvent.startTime,
    endTime: frontendEvent.endTime,
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
  return {
    id: backendEvent.eventId,
    title: backendEvent.title,
    startTime: backendEvent.startTime,
    endTime: backendEvent.endTime,
    description: backendEvent.description,
    theme: mapEventTypeToTheme(backendEvent.type),
    type: backendEvent.type,
    location: backendEvent.location,
    createTime: backendEvent.createTime,
    ownerId: backendEvent.ownerId,
    // Add default values for frontend compatibility
    startDate: parseEventDate(backendEvent.startTime),
    endDate: parseEventDate(backendEvent.endTime),
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
 * Parse event date from time string
 * @param {string} timeString - Time string in format "HH:MM"
 * @returns {Date} Parsed date
 */
const parseEventDate = (timeString) => {
  // For now, we'll use today's date since backend only stores time
  // In a real app, you'd want to store full datetime
  const today = new Date();
  const [hours, minutes] = timeString.split(':');
  today.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  return today;
};

/**
 * Calendar API service for CRUD operations
 */
export const calendarAPI = {
  /**
   * Get all events for the current user
   * @returns {Promise<Array>} Array of events in frontend format
   */
  async getEvents() {
    try {
      console.log('Fetching user events...');
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

export default calendarAPI;
