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
      localStorage.removeItem('currentOrganizationId');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
