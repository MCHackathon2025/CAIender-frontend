import { gql } from 'graphql-request';
import graphqlClient, { setAuthToken } from './graphql.js';

// GraphQL mutations and queries
const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      id
      username
    }
  }
`;

const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
    }
  }
`;

// Auth service functions
export const authService = {
  // Login user
  async login(credentials) {
    try {
      console.log('Starting login process...');
      const { username, password } = credentials;
      const variables = {
        input: {
          username,
          password
        }
      };

      console.log('Sending login request with variables:', {
        username,
        password: '***masked***'
      });
      console.log('GraphQL endpoint:', graphqlClient.url);
      console.log('Request headers:', graphqlClient.requestConfig?.headers);

      const data = await graphqlClient.request(LOGIN_MUTATION, variables);
      console.log('Login response received:', data);

      if (data.login?.token) {
        // Store token in localStorage
        localStorage.setItem('authToken', data.login.token);
        // Set token in GraphQL client headers
        setAuthToken(data.login.token);
        return { success: true, token: data.login.token };
      }

      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      console.error('Login error occurred');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Has response?', !!error.response);

      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        console.error('Response errors:', error.response.errors);
        console.error('Response data:', error.response.data);
      }

      if (error.request) {
        console.error('Request details:', {
          url: error.request.url,
          method: error.request.method,
          headers: error.request.headers
        });
      }

      console.error('Full error object:', error);

      // Handle different types of errors
      let errorMessage = 'Login failed';

      if (error.response?.errors?.[0]) {
        console.log('Detected GraphQL error with response');
        const graphqlError = error.response.errors[0];

        if (graphqlError.extensions?.code === 'INTERNAL_SERVER_ERROR') {
          console.log('Server configuration error detected');
          errorMessage = 'Server configuration error. Please contact support or try again later.';
        } else {
          console.log('Using GraphQL error message:', graphqlError.message);
          errorMessage = graphqlError.message;
        }
      } else if (error.message) {
        console.log('Analyzing error message:', error.message);
        // Check if it's actually a network error or just a poorly formatted GraphQL error
        if (error.message.includes('fetch') && !error.response) {
          console.log('True network error detected (no response)');
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('Unexpected error') && error.response) {
          console.log('Server error with response detected');
          errorMessage = 'Server configuration error. Please contact support or try again later.';
        } else {
          console.log('Using raw error message');
          errorMessage = error.message;
        }
      }

      console.log('Final error message:', errorMessage);

      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Register user
  async register(userInfo) {
    try {
      const { username, email, password } = userInfo;
      const variables = {
        input: {
          username,
          email,
          password
        }
      };

      console.log('Starting registration process...');
      console.log('Sending registration request with:', { username, email, password: '***masked***' });
      console.log('GraphQL endpoint:', graphqlClient.url);
      console.log('Request headers:', graphqlClient.requestConfig?.headers);

      const data = await graphqlClient.request(REGISTER_MUTATION, variables);
      console.log('Registration response received:', data);

      if (data.register) {
        return { success: true, user: data.register };
      }

      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      console.error('Registration error occurred');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Has response?', !!error.response);

      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        console.error('Response errors:', error.response.errors);
        console.error('Response data:', error.response.data);
      }

      if (error.request) {
        console.error('Request details:', {
          url: error.request.url,
          method: error.request.method,
          headers: error.request.headers
        });
      }

      console.error('Full error object:', error);

      // Handle different types of errors
      let errorMessage = 'Registration failed';

      if (error.response?.errors?.[0]) {
        console.log('Detected GraphQL error with response');
        const graphqlError = error.response.errors[0];

        if (graphqlError.extensions?.code === 'INTERNAL_SERVER_ERROR') {
          console.log('Server configuration error detected');
          errorMessage = 'Server configuration error. Please contact support or try again later.';
        } else {
          console.log('Using GraphQL error message:', graphqlError.message);
          errorMessage = graphqlError.message;
        }
      } else if (error.message) {
        console.log('Analyzing error message:', error.message);
        // Check if it's actually a network error or just a poorly formatted GraphQL error
        if (error.message.includes('fetch') && !error.response) {
          console.log('True network error detected (no response)');
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('Unexpected error') && error.response) {
          console.log('Server error with response detected');
          errorMessage = 'Server configuration error. Please contact support or try again later.';
        } else {
          console.log('Using raw error message');
          errorMessage = error.message;
        }
      }

      console.log('Final error message:', errorMessage);

      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return { success: false, error: 'No authentication token found' };
      }

      setAuthToken(token);
      const data = await graphqlClient.request(ME_QUERY);

      if (data.me) {
        return { success: true, user: data.me };
      }

      return { success: false, error: 'User not found' };
    } catch (error) {
      console.error('Get current user error:', error);
      // If token is invalid, remove it
      if (error.response?.errors?.[0]?.message?.includes('token') ||
        error.response?.errors?.[0]?.message?.includes('unauthorized')) {
        this.logout();
      }
      return {
        success: false,
        error: error.response?.errors?.[0]?.message || error.message || 'Failed to get user'
      };
    }
  },

  // Logout user
  logout() {
    localStorage.removeItem('authToken');
    setAuthToken(null);
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  // Get stored token
  getToken() {
    return localStorage.getItem('authToken');
  }
};

export default authService;
