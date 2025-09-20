import { gql } from 'graphql-request';
import graphqlClient, { setAuthToken } from './graphql.js';

// GraphQL mutations and queries
const GET_EVENT_QUERY = gql`
  query GetEvent {
    suggestEvent {
      eventId
    }
  }
`;

/**
 * Fetch suggested events from the backend
 * @returns {Promise<Array>} Array of suggested events
 * @throws {Error} If the request fails or user is not authenticated
 */
export const getSuggestedEvents = async () => {
  try {
    // Ensure auth token is set
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
    }

    const data = await graphqlClient.request(GET_EVENT_QUERY);
    return data.SuggestEvents || [];
  } catch (error) {
    console.error('Error fetching suggested events:', error);
    throw new Error('Failed to fetch suggested events. Please try again.');
  }
};

export default getSuggestedEvents;