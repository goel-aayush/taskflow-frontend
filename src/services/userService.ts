import apiClient from "../api/client";
import { User } from "../types";

export const userService = {
  getUsers: async (params?: {
    search?: string;
    department?: string;
    page?: number;
  }): Promise<User[]> => {
    const response = await apiClient.get<{
      success: boolean;
      data: { users: User[] };
    }>("/users", { params });
    return response.data.data.users;
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get<{
      success: boolean;
      data: { user: User };
    }>(`/users/${id}`);
    return response.data.data.user;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<{
      success: boolean;
      data: { user: User };
    }>("/users/me");
    return response.data.data.user;
  },

  updateProfile: async (updates: Partial<User>): Promise<void> => {
    await apiClient.patch("/users/me", updates);
  },

  getTeamList: async (): Promise<User[]> => {
    const response = await apiClient.get<{ success: boolean; data: User[] }>(
      "/users/team",
    );
    return response.data.data;
  },

  createUser: async (userData: any): Promise<User> => {
    const response = await apiClient.post<{
      success: boolean;
      data: { user: User };
    }>("/users", userData);
    return response.data.data.user;
  },

  updateUser: async (id: string, updates: any): Promise<User> => {
    const response = await apiClient.patch<{
      success: boolean;
      data: { user: User };
    }>(`/users/${id}`, updates);
    return response.data.data.user;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
