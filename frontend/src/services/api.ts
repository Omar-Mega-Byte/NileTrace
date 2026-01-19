import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { ApiError } from '@/types';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Token storage keys
const TOKEN_KEY = 'niletrace_token';

/**
 * Creates and configures the Axios instance for API calls
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 second timeout
  });

  // Request interceptor to add auth token
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError<ApiError>) => {
      // Handle 401 - unauthorized (token expired)
      if (error.response?.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      // Transform error to consistent format
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message || 'An unexpected error occurred',
        status: error.response?.status || 500,
        errors: error.response?.data?.errors,
      };

      return Promise.reject(apiError);
    }
  );

  return client;
};

// Export configured API client
export const apiClient = createApiClient();

// Token management utilities
export const tokenUtils = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  remove: (): void => localStorage.removeItem(TOKEN_KEY),
  exists: (): boolean => !!localStorage.getItem(TOKEN_KEY),
};
