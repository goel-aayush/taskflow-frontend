import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderPlus,
  CheckSquare,
  Users,
  Settings,
  LogOut,
  Plus,
  Rocket,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const NAV_ITEMS: {
  icon: React.ComponentType<any>;
  label: string;
  path: string;
}[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FolderPlus, label: "Projects", path: "/projects" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: Users, label: "Team", path: "/team" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

import { useUserStore } from "../store/userStore";

export default function Sidebar() {
  const logout = useUserStore((state) => state.logout);
  const currentUser = useUserStore((state) => state.currentUser);
  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  return (
    <aside className="hidden md:flex w-64 h-screen fixed left-0 top-0 overflow-y-auto bg-surface-container-low border-r border-outline-variant z-50 flex-col">
      <div className="p-6 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
            <Rocket className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-on-background">
              Project Space
            </h1>
            <p className="text-xs text-secondary font-medium uppercase tracking-tight">
              Reliable Facilitator
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1 p-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }: { isActive: boolean }) =>
              cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ease-in-out",
                isActive
                  ? "bg-primary-container/10 text-primary"
                  : "text-secondary hover:bg-surface-container-high hover:text-on-surface",
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto space-y-2">
        {isAdmin && (
          <NavLink
            to="/tasks/new"
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span>Create Task</span>
          </NavLink>
        )}
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-secondary hover:bg-surface-container-high hover:text-on-surface rounded-lg font-medium transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
