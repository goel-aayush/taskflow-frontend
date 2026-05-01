import { useEffect, useState } from "react";
import { useProjectStore } from "../store/projectStore";
import { useTaskStore } from "../store/taskStore";
import { useUserStore } from "../store/userStore";
import { projectService } from "../services/projectService";
import { taskService } from "../services/taskService";
import { userService } from "../services/userService";
import { dashboardService } from "../services/dashboardService";
import { User, DashboardStats, ActivityLog } from "../types";

import { useUIStore } from "../store/uiStore";

const fetchWithRetry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && error.response?.status === 429) {
      console.warn(
        `Rate limited (429). Retrying in ${delay}ms... (${retries} attempts left)`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export function useInitializeAppData() {
  const setProjects = useProjectStore((state) => state.setProjects);
  const setTasks = useTaskStore((state) => state.setTasks);
  const setTeam = useUserStore((state) => state.setTeam);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const currentUser = useUserStore((state) => state.currentUser);
  const fetchMe = useUserStore((state) => state.fetchMe);
  const setLoading = useProjectStore((state) => state.setLoading);
  const showNotification = useUIStore((state) => state.showNotification);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const user =
          currentUser ?? (await fetchMe(), useUserStore.getState().currentUser);
        if (!user) {
          return;
        }

        // Normalize role for comparison
        const normalizedRole = user.role?.toLowerCase();
        const isAdmin = normalizedRole === "admin";

        // Update user in store (which also normalizes)
        setCurrentUser(user);

        console.log(
          `Fetching remaining data for ${isAdmin ? "Admin" : "Member"}...`,
        );

        // Fetch projects and tasks
        const [projects, tasks] = await Promise.all([
          projectService.getProjects().catch((err) => {
            console.error("Failed to fetch projects:", err);
            return [];
          }),
          taskService.getTasks().catch((err) => {
            console.error("Failed to fetch tasks:", err);
            return [];
          }),
        ]);

        // Fetch team list based on role
        let team: User[] = [];
        try {
          if (isAdmin) {
            team = await userService.getUsers();
          } else {
            team = await userService.getTeamList();
          }
        } catch (teamError: any) {
          console.warn("Failed to fetch team list:", teamError);
        }

        setProjects(projects);
        setTasks(tasks);
        setTeam(team);
      } catch (error: any) {
        console.error("Failed to initialize app data:", error);
        if (error.response?.status === 401) {
          // Handled by auth interceptors/store usually, but good to be safe
          return;
        }
        const message =
          error.response?.data?.message ||
          "Failed to load application data. Please check your connection.";
        showNotification(message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    setProjects,
    setTasks,
    setTeam,
    setCurrentUser,
    setLoading,
    showNotification,
  ]);
}

export function useProjects() {
  const projects = useProjectStore((state) => state.projects);
  const isLoading = useProjectStore((state) => state.isLoading);
  const { addProject, updateProject, deleteProject } = useProjectStore();

  const create = async (data: any) => {
    const newProject = await projectService.createProject(data);
    addProject(newProject);
    return newProject;
  };

  const update = async (id: string, data: any) => {
    await projectService.updateProject(id, data);
    updateProject(id, data);
  };

  const remove = async (id: string) => {
    console.log("Removing project with id:", id);
    try {
      await projectService.deleteProject(id);
      console.log("Project deleted from server");
    } catch (error) {
      console.warn(
        "Project deletion from server failed, updating local state anyway:",
        error,
      );
    }
    deleteProject(id);
    console.log("Project deleted from local store");
  };

  const addProjectMember = async (projectId: string, user: User) => {
    console.log(
      `Hook addProjectMember: projectId=${projectId}, userId=${user.id}`,
    );
    try {
      await projectService.addMembers(projectId, [user.id]);
      console.log("API addMembers call successful");

      const currentProjects = useProjectStore.getState().projects;
      const project = currentProjects.find((p) => p.id === projectId);
      if (project) {
        console.log("Project found in store, updating team list...");
        const updatedTeam = [...(project.team || []), user];
        updateProject(projectId, { team: updatedTeam });
        console.log("Store updateProject called");
      } else {
        console.warn("Project not found in store after API call");
      }
    } catch (error) {
      console.error("API addMembers call failed:", error);
      throw error;
    }
  };

  const removeProjectMember = async (projectId: string, userId: string) => {
    console.log(
      `Hook removeProjectMember: projectId=${projectId}, userId=${userId}`,
    );
    try {
      await projectService.removeMembers(projectId, [userId]);
      console.log("API removeMembers call successful");

      const currentProjects = useProjectStore.getState().projects;
      const project = currentProjects.find((p) => p.id === projectId);

      if (project) {
        console.log("Project found in store, updating team list...");
        const updatedTeam = (project.team || []).filter((m) => m.id !== userId);
        updateProject(projectId, { team: updatedTeam });
        console.log("Store updateProject called");
      } else {
        console.warn("Project not found in store after API call");
      }
    } catch (error) {
      console.error("API removeMembers call failed:", error);
      throw error;
    }
  };

  return {
    projects,
    isLoading,
    create,
    update,
    remove,
    addProjectMember,
    removeProjectMember,
  };
}

export function useTasks() {
  const tasks = useTaskStore((state) => state.tasks);
  const isLoading = useTaskStore((state) => state.isLoading);
  const { addTask, updateTask, deleteTask } = useTaskStore();

  const create = async (data: any) => {
    const newTask = await taskService.createTask(data);
    addTask(newTask);
    return newTask;
  };

  const update = async (id: string, data: any) => {
    try {
      await fetchWithRetry(() => taskService.updateTask(id, data));
      updateTask(id, data);
    } catch (error) {
      console.error("Failed to update task:", error);
      throw error;
    }
  };

  const remove = async (id: string) => {
    console.log("Removing task with id:", id);
    // Optimistic delete: remove from local store first
    deleteTask(id);
    console.log("Task deleted from local store");

    try {
      await fetchWithRetry(() => taskService.deleteTask(id));
      console.log("Task deleted from server");
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn("Task already deleted from server (404)");
      } else {
        console.error("Task deletion from server failed:", error);
        // We already deleted locally, so we don't necessarily want to undo it
        // unless we want strict sync. For now, we'll let the user know.
        throw error;
      }
    }
  };

  return { tasks, isLoading, create, update, remove };
}

export function useProjectList() {
  const [projectList, setProjectList] = useState<
    { id: string; name: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchList = async () => {
      setIsLoading(true);
      try {
        const list = await projectService.getProjectList();
        setProjectList(list);
      } catch (error: any) {
        console.error("Failed to fetch project list:", error);
        const showNotification = useUIStore.getState().showNotification;
        showNotification(
          error.response?.data?.message || "Failed to fetch projects list",
          "error",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchList();
  }, []);

  return { projectList, isLoading };
}

export function useTeamList() {
  const [teamList, setTeamList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchList = async () => {
      setIsLoading(true);
      try {
        const list = await userService.getTeamList();
        setTeamList(list);
      } catch (error: any) {
        console.error("Failed to fetch team list:", error);
        const showNotification = useUIStore.getState().showNotification;
        showNotification(
          error.response?.data?.message || "Failed to fetch team list",
          "error",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchList();
  }, []);

  return { teamList, isLoading };
}

export function useTeamManagement() {
  const team = useUserStore((state) => state.team);
  const { setTeam } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const showNotification = useUIStore((state) => state.showNotification);

  const fetchTeam = async (params?: any) => {
    setIsLoading(true);
    try {
      const users = await userService.getUsers(params);
      setTeam(users);
    } catch (error: any) {
      console.error("Failed to fetch team members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const create = async (data: any) => {
    try {
      const newUser = await userService.createUser(data);
      setTeam([...team, newUser]);
      showNotification("Team member created successfully", "success");
      return newUser;
    } catch (error: any) {
      showNotification(
        error.response?.data?.message || "Failed to create team member",
        "error",
      );
      throw error;
    }
  };

  const update = async (id: string, data: any) => {
    try {
      const updatedUser = await userService.updateUser(id, data);
      const updatedTeam = team.map((u) => (u.id === id ? updatedUser : u));
      setTeam(updatedTeam);
      showNotification("Team member updated successfully", "success");
      return updatedUser;
    } catch (error: any) {
      showNotification(
        error.response?.data?.message || "Failed to update team member",
        "error",
      );
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      await userService.deleteUser(id);
      const updatedTeam = team.filter((u) => u.id !== id);
      setTeam(updatedTeam);
      showNotification("Team member removed successfully", "success");
    } catch (error: any) {
      showNotification(
        error.response?.data?.message || "Failed to remove team member",
        "error",
      );
      throw error;
    }
  };

  return { team, isLoading, fetchTeam, create, update, remove };
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, activityData] = await fetchWithRetry(() =>
        Promise.all([
          dashboardService.getStats().catch((err) => {
            console.error("Failed to fetch dashboard stats:", err);
            return null;
          }),
          dashboardService.getRecentActivities().catch((err) => {
            console.error("Failed to fetch activities:", err);
            return [];
          }),
        ]),
      );

      if (statsData) setStats(statsData);
      setActivities(activityData as ActivityLog[]);
    } catch (error: any) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refresh = () => fetchDashboardData();

  return { stats, activities, isLoading, refresh };
}

export function useProjectStats() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // First attempt to get specific project stats
      const data = await fetchWithRetry(() => projectService.getProjectStats());
      setStats(data);
    } catch (error) {
      console.warn(
        "Dedicated /projects/stats failed, falling back to dashboard summary:",
        error,
      );
      try {
        // Fallback to dashboard stats which we know exists
        const dashboardStats = await fetchWithRetry(() =>
          dashboardService.getStats(),
        );
        const mappedStats = [
          {
            label: "Active Tasks",
            value: String(dashboardStats.pendingTasks),
            change: "+8%",
            type: "positive",
          },
          {
            label: "Total Projects",
            value: String(dashboardStats.activeProjects).padStart(2, "0"),
            status: "Stable",
            type: "neutral",
          },
          {
            label: "Team Health",
            value: `${dashboardStats.teamProductivity}%`,
            status: "Optimal",
            type: "positive",
          },
          {
            label: "Deadline Risks",
            value: String(dashboardStats.deadlineRisks).padStart(2, "0"),
            change: "+2%",
            type: "negative",
          },
        ];
        setStats(mappedStats);
      } catch (fallbackError) {
        console.error("Failed to fetch any stats:", fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, isLoading, refresh: fetchStats };
}
