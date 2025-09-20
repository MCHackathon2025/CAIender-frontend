import { GraphQLClient } from 'graphql-request';

// GraphQL endpoint
const GRAPHQL_ENDPOINT = 'https://86hofs0dtf.execute-api.ap-east-2.amazonaws.com/Prod/graphql';

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
