import apiClient from '../api/client';
import { DashboardStats, ActivityLog } from '../types';

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<{ success: boolean, data: DashboardStats }>('/dashboard/stats');
    return response.data.data;
  },

  getRecentActivities: async (): Promise<ActivityLog[]> => {
    const response = await apiClient.get<{ success: boolean, data: ActivityLog[] }>('/dashboard/activities');
    return response.data.data;
  },

  downloadReport: async (range: 'weekly' | 'monthly'): Promise<void> => {
    // This would typically return a blob or a URL to the generated file
    const response = await apiClient.post('/reports/download', { range, format: 'pdf' }, { responseType: 'blob' });
    
    // Logic to trigger browser download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report-${range}-${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
