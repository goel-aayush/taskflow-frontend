import { create } from "zustand";
import { User } from "../types";

let fetchMeInFlight: Promise<void> | null = null;

interface UserState {
  currentUser: User | null;
  team: User[];
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: () => boolean;
  setCurrentUser: (user: User | null) => void;
  setTeam: (team: User[]) => void;
  setLoading: (isLoading: boolean) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: null,
  team: [],
  isLoading: false,
  isAuthenticated: !!localStorage.getItem("token"),
  isAdmin: () => get().currentUser?.role?.toLowerCase() === "admin",
  setCurrentUser: (user) => {
    if (user && user.role) {
      user.role =
        user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase();
    }
    set({ currentUser: user, isAuthenticated: !!user });
  },
  setTeam: (data) => {
    let teamArray: User[] = [];
    if (Array.isArray(data)) {
      teamArray = data;
    } else if (data && typeof data === "object") {
      // Handle format: { success: true, data: { users: [...] } } or { team: [...] }
      if ((data as any).data && Array.isArray((data as any).data.users)) {
        teamArray = (data as any).data.users;
      }
      // Handle format: { success: true, data: { team: [...] } }
      else if ((data as any).data && Array.isArray((data as any).data.team)) {
        teamArray = (data as any).data.team;
      }
      // Handle format: { success: true, data: [...] }
      else if ((data as any).data && Array.isArray((data as any).data)) {
        teamArray = (data as any).data;
      }
      // Handle format: { users: [...] }
      else if (Array.isArray((data as any).users)) {
        teamArray = (data as any).users;
      }
      // Handle format: { team: [...] }
      else if (Array.isArray((data as any).team)) {
        teamArray = (data as any).team;
      }
    }

    // Normalize roles in team as well
    teamArray = teamArray.map((m) => {
      if (m.role) {
        return {
          ...m,
          role: m.role.charAt(0).toUpperCase() + m.role.slice(1).toLowerCase(),
        };
      }
      return m;
    });

    set({ team: teamArray });
  },
  setLoading: (isLoading) => set({ isLoading }),
  login: (user, token) => {
    const authToken = token || (user as any).token || (user as any).accessToken;
    if (authToken) {
      if (user && user.role) {
        user.role =
          user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase();
      }
      localStorage.setItem("token", authToken);
      set({ currentUser: user, isAuthenticated: true });
    } else {
      console.error("Login failed: No token received in response", {
        user,
        token,
      });
    }
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ currentUser: null, isAuthenticated: false });
  },
  fetchMe: async () => {
    const { isAuthenticated, currentUser } = get();
    if (!isAuthenticated) return;
    if (currentUser) return;
    if (fetchMeInFlight) return fetchMeInFlight;

    fetchMeInFlight = (async () => {
      set({ isLoading: true });
      const { userService } = await import("../services/userService");
      const user = await userService.getMe();
      if (user && user.role) {
        user.role =
          user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase();
      }
      set({ currentUser: user, isAuthenticated: true });
    })()
      .catch((error) => {
        console.error("Failed to fetch user profile:", error);
        // If unauthorized, logout
        if ((error as any).response?.status === 401) {
          localStorage.removeItem("token");
          set({ currentUser: null, isAuthenticated: false });
        }
      })
      .finally(() => {
        set({ isLoading: false });
        fetchMeInFlight = null;
      });

    return fetchMeInFlight;
  },
}));
