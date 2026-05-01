import React, { useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Users, 
  ChevronDown,
  AlertCircle,
  Save,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTasks, useProjectList, useTeamList } from '../hooks/useData';
import { useUIStore } from '../store/uiStore';
import { useUserStore } from '../store/userStore';
import { Task } from '../types';
import { cn } from '../lib/utils';

interface EditTaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditTaskModal({ task, isOpen, onClose }: EditTaskModalProps) {
  const { update, remove } = useTasks();
  const { projectList, isLoading: projectsLoading } = useProjectList();
  const { teamList, isLoading: teamLoading } = useTeamList();
  const showNotification = useUIStore((state) => state.showNotification);
  const currentUser = useUserStore((state) => state.currentUser);
  const isAdmin = currentUser?.role === 'Admin';
  
  const [formData, setFormData] = React.useState({
    title: task.title,
    projectId: task.projectId,
    priority: task.priority,
    description: task.description || '',
    dueDate: task.dueDate || '',
    assigneeId: task.assigneeId || '',
    status: task.status
  });
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState('');

  useEffect(() => {
    setFormData({
      title: task.title,
      projectId: task.projectId,
      priority: task.priority,
      description: task.description || '',
      dueDate: task.dueDate || '',
      assigneeId: task.assigneeId || '',
      status: task.status
    });
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await update(task.id, formData);
      showNotification('Task updated successfully', 'success');
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update task';
      setError(message);
      showNotification(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    console.log('Delete button clicked for task:', task.id);
    if (!window.confirm('Are you sure you want to delete this task?')) {
      console.log('Delete cancelled by user');
      return;
    }
    
    setIsDeleting(true);
    try {
      console.log('Calling remove hook for task:', task.id);
      await remove(task.id);
      console.log('Delete successful');
      showNotification('Task deleted successfully', 'info');
      onClose();
    } catch (err: any) {
      console.error('Modal catch during delete:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete task from server';
      showNotification(`Error: ${errorMessage}`, 'error');
      // Even if server delete fails, useData already removed it from store optimistically.
      // So we close the modal anyway to reflect the local state.
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-on-background/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-outline-variant flex items-center justify-between bg-surface-container-lowest">
              <div>
                <h2 className="text-2xl font-black text-on-background tracking-tight">Edit Task</h2>
                <p className="text-secondary text-xs font-bold uppercase tracking-widest mt-1">Refining details for project execution</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-surface-container rounded-full transition-colors text-secondary hover:text-on-surface"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Scroll Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
              {error && (
                <div className="bg-error-container/10 border border-error/20 p-4 rounded-2xl flex items-center gap-3 text-error text-sm font-bold">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form id="edit-task-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-secondary uppercase tracking-widest ml-1">Task Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={cn(
                      "w-full px-5 py-4 border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-lg",
                      !isAdmin ? "bg-surface-container text-secondary opacity-60 cursor-not-allowed" : "bg-surface-container-low"
                    )}
                    required
                    disabled={!isAdmin}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-secondary uppercase tracking-widest ml-1">Status</label>
                    <div className="relative">
                      <select 
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium appearance-none"
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-outline pointer-events-none w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-secondary uppercase tracking-widest ml-1">Priority</label>
                    <div className="relative">
                      <select 
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                        className={cn(
                          "w-full px-5 py-4 border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium appearance-none",
                          !isAdmin ? "bg-surface-container text-secondary opacity-60 cursor-not-allowed" : "bg-surface-container-low"
                        )}
                        disabled={!isAdmin}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-outline pointer-events-none w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-secondary uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={cn(
                      "w-full px-5 py-4 border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium resize-none",
                      !isAdmin ? "bg-surface-container text-secondary opacity-60 cursor-not-allowed" : "bg-surface-container-low"
                    )}
                    placeholder="Describe the task details..."
                    disabled={!isAdmin}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-secondary uppercase tracking-widest ml-1">Deadline</label>
                    <div className="relative">
                      <input 
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className={cn(
                          "w-full px-5 py-4 border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium",
                          !isAdmin ? "bg-surface-container text-secondary opacity-60 cursor-not-allowed" : "bg-surface-container-low"
                        )}
                        disabled={!isAdmin}
                      />
                      <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 text-outline pointer-events-none w-4 h-4" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-secondary uppercase tracking-widest ml-1">Assignee</label>
                    <div className="relative">
                      <select 
                        value={formData.assigneeId}
                        onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                        className={cn(
                          "w-full px-5 py-4 border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium appearance-none",
                          !isAdmin ? "bg-surface-container text-secondary opacity-60 cursor-not-allowed" : "bg-surface-container-low"
                        )}
                        disabled={!isAdmin}
                      >
                        <option value="">{teamLoading ? 'Loading...' : 'Select Assignee'}</option>
                        {Array.isArray(teamList) && teamList.map(member => (
                          <option key={member.id} value={member.id}>{member.name}</option>
                        ))}
                      </select>
                      <Users className="absolute right-5 top-1/2 -translate-y-1/2 text-outline pointer-events-none w-4 h-4" />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-outline-variant bg-surface-container-low flex items-center justify-between">
              {isAdmin ? (
                <button 
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-3 text-error font-bold hover:bg-error/5 rounded-xl transition-all uppercase tracking-widest text-[10px]"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'Deleting...' : 'Delete Task'}</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-6 py-3 font-bold text-secondary hover:text-on-surface transition-all uppercase tracking-widest text-[10px]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  form="edit-task-form"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest text-[10px]"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
