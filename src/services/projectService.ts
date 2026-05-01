import apiClient from '../api/client';
import { Project, ProjectStatus } from '../types';

// Mock data for initial fill
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Renova Cloud Migration',
    key: 'RCM',
    description: 'Migration project for moving on-premise infrastructure to AWS.',
    status: 'active',
    progress: 68,
    budget: 120000,
    startDate: '2024-01-01',
    endDate: '2024-12-15',
    dueDate: '2024-12-15',
    team: [],
    client: 'Renova Corp',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Nexus UI Redesign',
    key: 'NUR',
    description: 'Refreshing the core design system for the Nexus platform.',
    status: 'hold',
    progress: 32,
    budget: 45000,
    startDate: '2024-02-01',
    endDate: '2024-11-20',
    dueDate: '2024-11-20',
    team: [],
    client: 'Nexus Ltd',
    createdAt: '2024-02-01T00:00:00Z'
  }
];

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    try {
      const response = await apiClient.get<{ success: boolean, data: Project[] }>('/projects');
      if (response.data && (response.data as any).data) {
        return (response.data as any).data;
      }
      return response.data as any;
    } catch (error) {
      console.warn('API /projects failed, using mock data:', error);
      return MOCK_PROJECTS;
    }
  },

  getProjectById: async (id: string): Promise<Project> => {
    const response = await apiClient.get<{ success: boolean, data: Project }>(`/projects/${id}`);
    if (response.data && (response.data as any).data) {
      return (response.data as any).data;
    }
    return response.data as any;
  },

  createProject: async (project: Partial<Project>): Promise<Project> => {
    const response = await apiClient.post<{ success: boolean, data: Project }>('/projects', project);
    if (response.data && (response.data as any).data) {
      return (response.data as any).data;
    }
    return response.data as any;
  },

  updateProject: async (id: string, updates: Partial<Project>): Promise<void> => {
    await apiClient.patch(`/projects/${id}`, updates);
  },

  deleteProject: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/projects/${id}`);
    } catch (error) {
      console.warn(`API delete /projects/${id} failed:`, error);
      // We still want to allow the state update to happen in the UI for mock functionality
      // but we throw so the caller knows it failed on server
      throw error;
    }
  },

  addMembers: async (projectId: string, memberIds: string[]): Promise<void> => {
    await apiClient.post(`/projects/${projectId}/members`, { members: memberIds });
  },

  removeMembers: async (projectId: string, memberIds: string[]): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/members`, { data: { members: memberIds } });
  },

  getProjectList: async (): Promise<{ id: string, name: string }[]> => {
    const response = await apiClient.get<{ success: boolean, data: { id: string, name: string }[] }>('/projects/list');
    return response.data.data;
  },

  getProjectStats: async (): Promise<any> => {
    const response = await apiClient.get<{ success: boolean, data: any }>('/projects/stats');
    return response.data.data;
  }
};
