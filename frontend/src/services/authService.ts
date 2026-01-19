import { apiClient, tokenUtils } from './api';
import { AuthResponse, LoginRequest, SignupRequest, User } from '@/types';

/**
 * Authentication service - handles all auth-related API calls
 */
export const authService = {
  /**
   * Register a new user
   */
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/signup', data);
    
    // Store token on successful signup
    if (response.data.token) {
      tokenUtils.set(response.data.token);
    }
    
    return response.data;
  },

  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    
    // Store token on successful login
    if (response.data.token) {
      tokenUtils.set(response.data.token);
    }
    
    return response.data;
  },

  /**
   * Validate current token and get user info
   */
  async validate(): Promise<User> {
    // Use /auth/me endpoint to get full user info
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Logout - clears stored token
   */
  logout(): void {
    tokenUtils.remove();
  },

  /**
   * Check if user is authenticated (has token)
   */
  isAuthenticated(): boolean {
    return tokenUtils.exists();
  },

  /**
   * Get current token
   */
  getToken(): string | null {
    return tokenUtils.get();
  },
};
