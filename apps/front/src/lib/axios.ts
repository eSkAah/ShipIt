import axios from 'axios';

const API_URL = import.meta.env['VITE_API_URL'] || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const organizationId = localStorage.getItem('currentOrganizationId');
    if (organizationId) {
      config.headers['X-Organization-Id'] = organizationId;
    }

    // Let axios set the correct Content-Type with boundary for FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect for auth endpoints (session check, login, signup, etc.)
      const isAuthEndpoint = error.config?.url?.startsWith('/auth/');
      if (!isAuthEndpoint && window.location.pathname !== '/login') {
        localStorage.removeItem('currentOrganizationId');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
