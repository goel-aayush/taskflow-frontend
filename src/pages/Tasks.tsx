import {
  Plus,
  MoreHorizontal,
  Share,
  Filter,
  ChevronRight,
  Calendar,
  CheckCircle2,
  Edit2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { useTasks } from "../hooks/useData";
import { useUserStore } from "../store/userStore";
import EditTaskModal from "../components/EditTaskModal";
import { Task } from "../types";

const COLUMNS = [
  { id: "todo", label: "TO DO", count: 4, color: "bg-slate-200" },
  {
    id: "inprogress",
    label: "IN PROGRESS",
    count: 2,
    color: "bg-primary-container/20",
    textColor: "text-primary",
  },
  {
    id: "review",
    label: "UNDER REVIEW",
    count: 1,
    color: "bg-amber-100",
    textColor: "text-amber-700",
  },
  {
    id: "completed",
    label: "COMPLETED",
    count: 12,
    color: "bg-emerald-100",
    textColor: "text-emerald-700",
  },
];

export default function Tasks() {
  const { tasks, isLoading } = useTasks();
  const team = useUserStore((state) => state.team);
  const currentUser = useUserStore((state) => state.currentUser);
  const isAdmin = currentUser?.role === "Admin";

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-rose-50 text-rose-700";
      case "medium":
        return "bg-primary-container/10 text-primary";
      case "low":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getAssigneeAvatar = (assigneeId: string) => {
    const member = team.find((m) => m.id === assigneeId);
    return member?.avatar || `https://i.pravatar.cc/150?u=${assigneeId}`;
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="font-black text-secondary uppercase tracking-widest text-xs">
            Syncing Tasks...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
      {/* Board Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <nav className="flex items-center gap-2 text-sm text-secondary font-bold mb-2">
            <span>Tasks</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-on-background font-black uppercase tracking-tight">
              Task Board
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-3 mr-2">
            {[1, 2, 3].map((i) => (
              <div
                key={`avatar-placeholder-${i}`}
                className="w-9 h-9 rounded-full border-2 border-white bg-surface-container shadow-sm ring-1 ring-black/5"
              />
            ))}
            <div className="w-9 h-9 rounded-full border-2 border-white bg-white flex items-center justify-center text-xs font-black text-secondary shadow-sm">
              +4
            </div>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-outline-variant rounded-xl text-sm font-bold hover:bg-surface-container-low transition-all shadow-sm">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">
            <Share className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto no-scrollbar pb-6">
        <div className="flex gap-8 h-full min-h-[700px]">
          {COLUMNS.map((column) => {
            const columnTasks = tasks.filter((t) => {
              const statusNormalized = t.status
                ?.toLowerCase()
                .replace(/[^a-z]/g, "");
              const colId = column.id.toLowerCase().replace(/[^a-z]/g, "");

              if (statusNormalized === colId) return true;

              // Map legacy/internal IDs to UI columns
              if (statusNormalized === "todo" && colId === "todo") return true;
              if (
                (statusNormalized === "inprogress" ||
                  statusNormalized === "in-progress") &&
                colId === "inprogress"
              )
                return true;
              if (
                (statusNormalized === "underreview" ||
                  statusNormalized === "review") &&
                colId === "review"
              )
                return true;
              if (
                (statusNormalized === "done" ||
                  statusNormalized === "completed") &&
                colId === "completed"
              )
                return true;

              return false;
            });

            return (
              <div
                key={column.id}
                className="kanban-column flex flex-col gap-5 min-w-[300px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-black text-secondary uppercase tracking-widest text-xs">
                      {column.label}
                    </span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-lg text-[10px] flex items-center justify-center font-black transition-all",
                        column.color,
                        column.textColor || "text-slate-700",
                      )}
                    >
                      {columnTasks.length}
                    </span>
                  </div>
                  <button className="text-outline hover:text-on-surface transition-colors p-1 rounded-md hover:bg-surface-container">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Column Cards */}
                <div className="flex flex-col gap-4">
                  {columnTasks.map((task, idx) => (
                    <motion.div
                      key={`${column.id}-${task.id || idx}`}
                      layoutId={`task-${task.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "bg-white p-6 border-2 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-grab active:cursor-grabbing group relative",
                        task.status === "in-progress"
                          ? "border-primary/30 ring-4 ring-primary/5"
                          : "border-transparent hover:border-primary/50",
                      )}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span
                            className={cn(
                              "px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider shrink-0",
                              getPriorityColor(task.priority),
                            )}
                          >
                            {task.priority}
                          </span>
                          {task.projectName && (
                            <span
                              className="text-[10px] font-bold text-outline uppercase tracking-tight truncate"
                              title={task.projectName}
                            >
                              {task.projectName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {task.status === "done" && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10 shrink-0" />
                          )}
                          <button
                            onClick={() => handleEditTask(task)}
                            className="opacity-0 group-hover:opacity-100 text-outline hover:text-primary transition-opacity shrink-0"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h3
                        className={cn(
                          "font-bold text-on-surface text-lg leading-tight",
                          task.status === "done" &&
                            "line-through text-outline decoration-2 shadow-sm",
                        )}
                      >
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="text-sm text-secondary font-medium mt-3 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div
                        className={cn(
                          "flex items-center justify-between mt-6 pt-4 border-t border-outline-variant/30",
                          task.status === "done" && "grayscale opacity-60",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {task.dueDate && (
                            <div className="flex items-center gap-1.5 text-outline">
                              <Calendar className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-bold uppercase tracking-tight">
                                {task.dueDate}
                              </span>
                            </div>
                          )}
                        </div>
                        <img
                          src={
                            task.assignee?.avatar ||
                            getAssigneeAvatar(task.assigneeId || "")
                          }
                          className="w-7 h-7 rounded-full border border-outline-variant/30 shadow-sm transition-transform hover:scale-125"
                          alt="assignee"
                          title={task.assignee?.name || "Assignee"}
                        />
                      </div>
                    </motion.div>
                  ))}

                  {column.id === "todo" && isAdmin && (
                    <NavLink
                      key="add-new-task-button"
                      to="/tasks/new"
                      className="flex items-center justify-center gap-3 py-4 border-2 border-dashed border-outline-variant rounded-2xl text-outline hover:border-primary hover:text-primary hover:bg-white transition-all group active:scale-[0.98]"
                    >
                      <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="font-bold uppercase tracking-widest text-xs">
                        Add New Task
                      </span>
                    </NavLink>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Task Modal */}
      {selectedTask && (
        <EditTaskModal
          task={selectedTask}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTask(null);
          }}
        />
      )}

      {/* Mobile Contextual FAB */}
      {isAdmin && (
        <NavLink
          to="/tasks/new"
          className="fixed bottom-10 right-10 w-16 h-16 bg-primary text-white rounded-[2rem] shadow-2xl shadow-primary/40 flex items-center justify-center md:hidden z-50 ring-4 ring-white transition-transform active:scale-95"
        >
          <Plus className="w-8 h-8" />
        </NavLink>
      )}
    </div>
  );
}
