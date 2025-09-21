// src/services/eventApi.js
import { gql } from 'graphql-request';
import graphqlClient from './graphql.js';
import authService from './auth.js';

// GraphQL queries
const FETCH_MY_EVENTS_QUERY = gql`
  query {
    me {
      events { eventId }
    }
  }
`;

const FETCH_EVENT_QUERY = gql`
  query($input: GetEventInput!) {
    getEvent(input: $input) {
      eventId
      title
      description
      startTime
      endTime
      type
      location
    }
  }
`;

const UPDATE_EVENT_MUTATION = gql`
  mutation($input: UpdateEventInput!) {
    updateEvent(input: $input) {
      eventId
      title
      description
      startTime
      endTime
      type
      location
    }
  }
`;

const DELETE_EVENT_MUTATION = gql`
  mutation($input: DeleteEventInput!) {
    deleteEvent(input: $input)
  }
`;

// Get current user's events
export async function fetchMyEvents() {
  try {
    // Ensure user is authenticated
    if (!authService.isAuthenticated()) {
      throw new Error('User not authenticated');
    }

    const data = await graphqlClient.request(FETCH_MY_EVENTS_QUERY);
    return data.me?.events || [];
  } catch (error) {
    console.error('Error fetching my events:', error);
    throw error;
  }
}

// Get specific event by ID
export async function fetchEvent(eventId) {
  try {
    // Ensure user is authenticated
    if (!authService.isAuthenticated()) {
      throw new Error('User not authenticated');
    }

    const data = await graphqlClient.request(FETCH_EVENT_QUERY, {
      input: { eventId }
    });
    return data.getEvent;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
}

export async function fetchAllEvents() {
  const basicEvents = await fetchMyEvents();
  const fullEvents = await Promise.all(basicEvents.map(e => fetchEvent(e.eventId)));
  return fullEvents
    .filter(Boolean)
    .sort((a, b) => {
      if (a.startTime === b.startTime) {
        return new Date(a.endTime) - new Date(b.endTime);
      }
      return new Date(a.startTime) - new Date(b.startTime);
    });
}

export async function updateEvent(input) {
  try {
    // Ensure user is authenticated
    if (!authService.isAuthenticated()) {
      throw new Error('User not authenticated');
    }

    const data = await graphqlClient.request(UPDATE_EVENT_MUTATION, { input });
    return data.updateEvent;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
}

export async function deleteEvent(eventId) {
  try {
    // Ensure user is authenticated
    if (!authService.isAuthenticated()) {
      throw new Error('User not authenticated');
    }

    const data = await graphqlClient.request(DELETE_EVENT_MUTATION, {
      input: { eventId }
    });
    return data.deleteEvent;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
}
