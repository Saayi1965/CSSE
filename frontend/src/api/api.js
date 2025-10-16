import axios from 'axios';

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: 'http://127.0.0.1:8081/api',
  withCredentials: false, // Set to false to avoid CORS preflight issues
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    // Don't attach Authorization header for auth endpoints (login/register/test)
    const url = config.url || '';
    const isAuthEndpoint = url.includes('/auth');
    const token = localStorage.getItem('token');
    if (!isAuthEndpoint && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request for debugging
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url} (authEndpoint=${isAuthEndpoint})`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`Response received: ${response.status}`, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    if (error.response) {
      // Server responded with error status
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
      
      if (error.response.status === 401) {
        // Clear storage and redirect to login if token is invalid
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
    } else {
      // Something else happened
      console.error('Error message:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Test function to check backend connection
export const testBackendConnection = async () => {
  try {
    const response = await api.get('/auth/test');
    console.log('Backend connection test successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return { success: false, error: error.message };
  }
};

export default api;