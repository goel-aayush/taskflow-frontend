import { create } from 'zustand';
import { Project } from '../types';

interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),
  setProjects: (data) => {
    let projectsArray: Project[] = [];
    if (Array.isArray(data)) {
      projectsArray = data;
    } else if (data && typeof data === 'object') {
      // Handle format: { success: true, data: { projects: [...] } }
      if ((data as any).data && Array.isArray((data as any).data.projects)) {
        projectsArray = (data as any).data.projects;
      }
      // Handle format: { success: true, data: [...] }
      else if ((data as any).data && Array.isArray((data as any).data)) {
        projectsArray = (data as any).data;
      }
      // Handle format: { projects: [...] }
      else if (Array.isArray((data as any).projects)) {
        projectsArray = (data as any).projects;
      }
      // Handle format: { items: [...] }
      else if (Array.isArray((data as any).items)) {
        projectsArray = (data as any).items;
      }
    }
    set({ projects: projectsArray, isLoading: false });
  },
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p))
  })),
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== id)
  })),
}));
