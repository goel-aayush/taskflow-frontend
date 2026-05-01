import { create } from 'zustand';
import { Task, TaskStatus } from '../types';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
}

const normalizeTask = (t: any): Task => {
  let status = t.status;
  
  // Normalize status strings to match our internal IDs if necessary
  const statusMap: Record<string, TaskStatus> = {
    'todo': 'To Do',
    'inprogress': 'In Progress',
    'in-progress': 'In Progress',
    'review': 'Under Review',
    'done': 'Completed',
    'completed': 'Completed'
  };

  if (statusMap[status.toLowerCase().replace('-', '').replace(' ', '')]) {
    status = statusMap[status.toLowerCase().replace('-', '').replace(' ', '')];
  }

  return {
    id: String(t._id || t.id || ''),
    projectId: (t.projectId && typeof t.projectId === 'object') ? String(t.projectId?._id || t.projectId?.id || '') : String(t.projectId || ''),
    projectName: (t.projectId && typeof t.projectId === 'object') ? t.projectId?.name : undefined,
    title: t.title,
    description: t.description || '',
    status: status as TaskStatus,
    priority: t.priority,
    assigneeId: (t.assignedTo && typeof t.assignedTo === 'object') ? String(t.assignedTo._id || t.assignedTo.id || '') : String(t.assigneeId || t.assignedTo || ''),
    assignee: (t.assignedTo && typeof t.assignedTo === 'object') ? {
      id: String(t.assignedTo._id || t.assignedTo.id || ''),
      name: t.assignedTo.name,
      email: t.assignedTo.email,
      avatar: t.assignedTo.avatar || `https://i.pravatar.cc/150?u=${t.assignedTo._id || t.assignedTo.id}`,
      role: t.assignedTo.role || 'Member'
    } : undefined,
    tags: t.tags || [],
    dueDate: t.dueDate ? (t.dueDate.includes('T') ? t.dueDate.split('T')[0] : t.dueDate) : '',
    createdAt: t.createdAt || new Date().toISOString(),
    updatedAt: t.updatedAt
  };
};

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),
  setTasks: (data) => {
    let tasksArray: Task[] = [];
    if (Array.isArray(data)) {
      tasksArray = data.map(normalizeTask);
    } else if (data && typeof data === 'object') {
      // Handle format: { success: true, data: { tasks: [...] } }
      if ((data as any).data && Array.isArray((data as any).data.tasks)) {
        tasksArray = (data as any).data.tasks.map(normalizeTask);
      }
      // Handle format: { success: true, data: [...] }
      else if ((data as any).data && Array.isArray((data as any).data)) {
        tasksArray = (data as any).data.map(normalizeTask);
      }
      // Handle format: { tasks: [...] }
      else if (Array.isArray((data as any).tasks)) {
        tasksArray = (data as any).tasks.map(normalizeTask);
      }
      // Handle format: { items: [...] }
      else if (Array.isArray((data as any).items)) {
        tasksArray = (data as any).items.map(normalizeTask);
      }
    }
    set({ tasks: tasksArray, isLoading: false });
  },
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, normalizeTask(task)] })),
  updateTask: (id, updates) => set((state) => {
    const taskIndex = state.tasks.findIndex((t) => String(t.id) === String(id));
    if (taskIndex === -1) return state;
    
    const task = state.tasks[taskIndex];
    const normalizedUpdates = { ...updates };
    
    if (normalizedUpdates.status) {
      const statusMap: Record<string, TaskStatus> = {
        'todo': 'To Do',
        'inprogress': 'In Progress',
        'in-progress': 'In Progress',
        'review': 'Under Review',
        'done': 'Completed',
        'completed': 'Completed'
      };
      const key = String(normalizedUpdates.status).toLowerCase().replace('-', '').replace(' ', '');
      if (statusMap[key]) {
        normalizedUpdates.status = statusMap[key];
      }
    }

    const updatedTasks = [...state.tasks];
    updatedTasks[taskIndex] = { ...task, ...normalizedUpdates };
    
    return { tasks: updatedTasks };
  }),
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => String(t.id) !== String(id))
  })),
}));
