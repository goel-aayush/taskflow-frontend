export type ProjectStatus = "active" | "hold" | "completed";
export type TaskStatus =
  | "todo"
  | "in-progress"
  | "review"
  | "done"
  | "completed"
  | "To Do"
  | "In Progress"
  | "Under Review"
  | "Completed";
export type Priority = "low" | "medium" | "high";

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password?: string; // Optional depending on backend requirements
}

export interface SignupData {
  name: string;
  email: string;
  password?: string;
  role?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  dept?: string;
  department?: string;
  status?: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  budget: number;
  startDate?: string;
  endDate?: string;
  dueDate: string;
  team: User[];
  client?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  projectName?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string;
  assignee?: User;
  tags: string[];
  dueDate: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectStat {
  label: string;
  value: string;
  change: string;
  type: "positive" | "negative" | "neutral";
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  activeProjects: number;
  teamProductivity: number;
  deadlineRisks: number;
  productivityData: { name: string; value: number }[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  detail: string;
  time: string;
  type: "task" | "project" | "team";
}
