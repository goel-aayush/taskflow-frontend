import apiClient from '../api/client';
import { AuthResponse, LoginCredentials, SignupData, User } from '../types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<any>('/auth/login', credentials);
    // Handle nested data structures like { data: { token, user } }
    const data = response.data.data || response.data;
    return {
      token: data.token || data.accessToken || data.access_token,
      user: data.user || data
    };
  },

  signup: async (signupData: SignupData): Promise<AuthResponse> => {
    const response = await apiClient.post<any>('/auth/signup', signupData);
    const data = response.data.data || response.data;
    return {
      token: data.token || data.accessToken || data.access_token,
      user: data.user || data
    };
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<any>('/users/me');
    const data = response.data.data || response.data;
    return data.user || data;
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};
