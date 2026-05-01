import apiClient from '../api/client';
import { Task } from '../types';

const MOCK_TASKS: Task[] = [
  { id: '1', title: 'System Architecture Review', description: 'Monthly review of the cloud infrastructure and security protocols.', status: 'in-progress', priority: 'high', dueDate: '2024-11-15', projectId: '1', assigneeId: '3', createdAt: '2024-11-01', tags: ['Backend', 'Security'] },
  { id: '2', title: 'Design System Documentation', description: 'Complete the remaining components for the brand guidelines.', status: 'done', priority: 'medium', dueDate: '2024-11-10', projectId: '2', assigneeId: '2', createdAt: '2024-11-02', tags: ['Design', 'Docs'] },
  { id: '3', title: 'Client Feedback Analysis', description: 'Review the latest user testing results and suggest improvements.', status: 'todo', priority: 'low', dueDate: '2024-11-20', projectId: '1', assigneeId: '1', createdAt: '2024-11-05', tags: ['UX', 'Research'] }
];

export const taskService = {
  getTasks: async (filters?: { projectId?: string; status?: string }): Promise<Task[]> => {
    try {
      const response = await apiClient.get<{ success: boolean, data: Task[] }>('/tasks', { params: filters });
      // Handle both wrapped and unwrapped for safety
      if (response.data && (response.data as any).data) {
        return (response.data as any).data;
      }
      return response.data as any;
    } catch (error) {
      console.warn('API /tasks failed, using mock data:', error);
      return MOCK_TASKS;
    }
  },

  createTask: async (task: Partial<Task>): Promise<Task> => {
    const response = await apiClient.post<{ success: boolean, data: Task }>('/tasks', task);
    if (response.data && (response.data as any).data) {
      return (response.data as any).data;
    }
    return response.data as any;
  },

  updateTask: async (id: string, updates: Partial<Task>): Promise<void> => {
    await apiClient.patch(`/tasks/${id}`, updates);
  },

  deleteTask: async (id: string): Promise<void> => {
    console.log(`API: Deleting task with ID: ${id}`);
    await apiClient.delete(`/tasks/${id}`);
  }
};
