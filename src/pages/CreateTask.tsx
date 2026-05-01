import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronRight, 
  Plus, 
  Calendar, 
  Users, 
  Lightbulb, 
  Activity, 
  History,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTasks, useProjectList, useTeamList } from '../hooks/useData';
import { useUIStore } from '../store/uiStore';
import { useUserStore } from '../store/userStore';
import { useEffect } from 'react';

export default function CreateTask() {
  const navigate = useNavigate();
  const { create } = useTasks();
  const { projectList, isLoading: projectsLoading } = useProjectList();
  const { teamList, isLoading: teamLoading } = useTeamList();
  const showNotification = useUIStore((state) => state.showNotification);
  const currentUser = useUserStore((state) => state.currentUser);
  
  useEffect(() => {
    if (currentUser && currentUser.role !== 'Admin') {
      showNotification('Only administrators can create new tasks', 'error');
      navigate('/tasks');
    }
  }, [currentUser, navigate, showNotification]);
  
  const [formData, setFormData] = React.useState({
    title: '',
    projectId: '',
    status: 'To Do' as any,
    priority: 'medium' as any,
    description: '',
    dueDate: '',
    assigneeId: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId) {
      setError('Please select a project');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await create({
        ...formData,
        tags: [],
      });
      showNotification('Task created successfully', 'success');
      navigate('/tasks');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create task';
      setError(message);
      showNotification(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumbs & Header */}
      <div>
        <nav className="flex items-center gap-2 text-sm text-secondary font-bold mb-4 uppercase tracking-widest">
          <Link to="/tasks" className="hover:text-primary transition-colors">Tasks</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-on-background">New Task</span>
        </nav>
        <h1 className="text-4xl font-black text-on-background tracking-tight">Create New Task</h1>
        <p className="text-lg text-secondary font-medium mt-2">
          Define the details of your task and assign it to a team member.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-[2rem] border border-outline-variant shadow-xl shadow-primary/5 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {error && (
            <div className="bg-error-container/10 border border-error/20 p-4 rounded-2xl flex items-center gap-3 text-error text-sm font-bold animate-in bounce-in duration-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          <div className="space-y-3">
            <label className="text-sm font-bold text-on-surface uppercase tracking-wider">Task Title</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Design system audit"
              className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-lg placeholder:text-outline/40"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-on-surface uppercase tracking-wider">Project</label>
              <div className="relative">
                <select 
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium appearance-none"
                  required
                >
                  <option value="">{projectsLoading ? 'Loading Projects...' : 'Select Project'}</option>
                  {Array.isArray(projectList) && projectList.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-outline pointer-events-none w-5 h-5" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold text-on-surface uppercase tracking-wider">Status</label>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-on-surface uppercase tracking-wider">Priority</label>
              <div className="relative">
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium appearance-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-outline pointer-events-none w-5 h-5" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold text-on-surface uppercase tracking-wider">Assignee</label>
              <div className="relative">
                <select 
                  value={formData.assigneeId}
                  onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                  className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium appearance-none"
                >
                  <option value="">{teamLoading ? 'Loading Assignees...' : 'Select Assignee'}</option>
                  {Array.isArray(teamList) && teamList.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
                <Users className="absolute right-5 top-1/2 -translate-y-1/2 text-outline pointer-events-none w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-on-surface uppercase tracking-wider">Description</label>
            <div className="border border-outline-variant rounded-[1.5rem] overflow-hidden focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all">
              <div className="bg-surface-container-high/50 border-b border-outline-variant px-4 py-2.5 flex items-center gap-1.5 shadow-sm">
                <button type="button" className="p-2 hover:bg-white rounded-lg transition-colors text-secondary hover:text-primary"><Bold className="w-4 h-4" /></button>
                <button type="button" className="p-2 hover:bg-white rounded-lg transition-colors text-secondary hover:text-primary"><Italic className="w-4 h-4" /></button>
                <button type="button" className="p-2 hover:bg-white rounded-lg transition-colors text-secondary hover:text-primary"><List className="w-4 h-4" /></button>
                <button type="button" className="p-2 hover:bg-white rounded-lg transition-colors text-secondary hover:text-primary"><LinkIcon className="w-4 h-4" /></button>
              </div>
              <textarea 
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What needs to be done?"
                className="w-full px-5 py-4 bg-surface-container-low border-none text-on-surface font-medium placeholder:text-outline/40 focus:ring-0 resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-on-surface uppercase tracking-wider">Deadline</label>
              <div className="relative">
                <input 
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                />
                <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 text-outline pointer-events-none w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-outline-variant/30 flex items-center justify-end gap-5">
            <button 
              type="button" 
              onClick={() => navigate('/tasks')}
              className="px-8 py-3.5 font-bold text-secondary hover:text-on-surface hover:bg-surface-container rounded-2xl transition-all uppercase tracking-widest text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-3 uppercase tracking-widest text-sm disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Creating...' : 'Create Task'}</span>
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 bg-surface-container-low border border-outline-variant rounded-2xl flex flex-col gap-4">
          <div className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-primary">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-on-surface">AI Suggestions</h4>
            <p className="text-sm text-secondary font-medium mt-1 leading-relaxed">Based on current context, we suggest adding the 'High Priority' tag for this scope.</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 bg-surface-container-low border border-outline-variant rounded-2xl flex flex-col gap-4">
          <div className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-primary">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-on-surface">Workload Check</h4>
            <p className="text-sm text-secondary font-medium mt-1 leading-relaxed">Alex has 4 active tasks this week. Capacity is at 80% with this addition.</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 bg-surface-container-low border border-outline-variant rounded-2xl flex flex-col gap-4">
          <div className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-primary">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-on-surface">Related Tasks</h4>
            <p className="text-sm text-secondary font-medium mt-1 leading-relaxed">A similar task 'UI Polish' was successfully completed last Friday by this member.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
