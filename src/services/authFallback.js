// Fallback auth service using native fetch instead of graphql-request
const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT;

if (!GRAPHQL_ENDPOINT) {
  throw new Error('VITE_GRAPHQL_ENDPOINT environment variable is not set. Please check your .env file.');
}

const makeGraphQLRequest = async (query, variables = {}, token = null) => {
  console.log('Making GraphQL request with native fetch...');
  console.log('Endpoint:', GRAPHQL_ENDPOINT);
  console.log('Query:', query);
  console.log('Variables:', variables);

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    headers['x-token'] = token;
    console.log('Token added to headers');
  }

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers,
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify({
        query,
        variables
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Response data:', data);

    if (data.errors) {
      throw new Error(`GraphQL error: ${data.errors[0].message}`);
    }

    return data;

  } catch (error) {
    console.error('Native fetch request failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    throw error;
  }
};

export const authServiceFallback = {
  async login(credentials) {
    try {
      console.log('Fallback login starting...');
      const { username, password } = credentials;

      const query = `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            token
          }
        }
      `;

      const variables = {
        input: { username, password }
      };

      const data = await makeGraphQLRequest(query, variables);

      if (data.data?.login?.token) {
        localStorage.setItem('authToken', data.data.login.token);
        return { success: true, token: data.data.login.token };
      }

      return { success: false, error: 'Invalid response from server' };

    } catch (error) {
      console.error('Fallback login error:', error);

      let errorMessage = 'Login failed';

      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'CORS error. Backend configuration issue.';
      } else if (error.message.includes('Unexpected error')) {
        errorMessage = 'Server configuration error. Please contact support or try again later.';
      } else {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  },

  async register(userInfo) {
    try {
      console.log('Fallback registration starting...');
      const { username, email, password } = userInfo;

      const query = `
        mutation Register($input: RegisterInput!) {
          register(input: $input) {
            id
            username
          }
        }
      `;

      const variables = {
        input: { username, email, password }
      };

      const data = await makeGraphQLRequest(query, variables);

      if (data.data?.register) {
        return { success: true, user: data.data.register };
      }

      return { success: false, error: 'Invalid response from server' };

    } catch (error) {
      console.error('Fallback registration error:', error);

      let errorMessage = 'Registration failed';

      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'CORS error. Backend configuration issue.';
      } else if (error.message.includes('Unexpected error')) {
        errorMessage = 'Server configuration error. Please contact support or try again later.';
      } else {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  },

  async getCurrentUser() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return { success: false, error: 'No authentication token found' };
      }

      const query = `
        query Me {
          me {
            id
            username
            email
          }
        }
      `;

      const data = await makeGraphQLRequest(query, {}, token);

      if (data.data?.me) {
        return { success: true, user: data.data.me };
      }

      return { success: false, error: 'User not found' };

    } catch (error) {
      console.error('Fallback getCurrentUser error:', error);

      if (error.message.includes('token') || error.message.includes('unauthorized')) {
        this.logout();
      }

      return { success: false, error: error.message };
    }
  },

  logout() {
    localStorage.removeItem('authToken');
  },

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  getToken() {
    return localStorage.getItem('authToken');
  }
};

export default authServiceFallback;
