import { GraphQLClient } from 'graphql-request';

// GraphQL endpoint from environment variable
const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT;

if (!GRAPHQL_ENDPOINT) {
  throw new Error('VITE_GRAPHQL_ENDPOINT environment variable is not set. Please check your .env file.');
}

console.log('Initializing GraphQL client...');
console.log('Endpoint:', GRAPHQL_ENDPOINT);

// Create GraphQL client with browser-specific configuration
const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Allow-Control-Allow-Origin': '*',
  },

  // mode: 'cors',
  // credentials: 'omit',
});

console.log('GraphQL client created successfully');

// Update client headers with authorization token
export const setAuthToken = (token) => {
  console.log('Setting auth token:', token ? '***token-present***' : 'null');
  if (token) {
    graphqlClient.setHeader('x-token', token);
    console.log('Auth token set in headers');
  } else {
    graphqlClient.setHeader('x-token', '');
    console.log('Auth token cleared from headers');
  }
};

export default graphqlClient;
