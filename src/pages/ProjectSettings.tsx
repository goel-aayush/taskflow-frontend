import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ChevronRight, 
  Info, 
  Users, 
  Shield, 
  Trash2, 
  CheckCircle2, 
  PauseCircle, 
  UserPlus, 
  Save,
  AlertTriangle,
  Search,
  X,
  UserCheck,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useProjects } from '../hooks/useData';
import { userService } from '../services/userService';
import { useUIStore } from '../store/uiStore';
import { useUserStore } from '../store/userStore';
import { User } from '../types';

const TABS = [
  { id: 'general', label: 'General', icon: Info },
  { id: 'team', label: 'Team Access', icon: Users },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'advanced', label: 'Advanced', icon: AlertTriangle },
];

export default function ProjectSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, update, remove, addProjectMember, removeProjectMember } = useProjects();
  const showNotification = useUIStore((state) => state.showNotification);
  const currentUser = useUserStore((state) => state.currentUser);

  useEffect(() => {
    if (currentUser && currentUser.role !== 'Admin') {
      showNotification('Only administrators can access project settings', 'error');
      navigate('/projects');
    }
  }, [currentUser, navigate, showNotification]);

  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client: '',
    budget: 0,
    status: 'active' as any
  });
  
  const project = projects.find(p => p.id === id);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        client: project.client || '',
        budget: project.budget || 0,
        status: project.status || 'active'
      });
    }
  }, [project]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSaving(true);
    try {
      await update(id, formData);
      showNotification('Project settings saved successfully', 'success');
      navigate('/projects');
    } catch (error) {
      console.error('Failed to save:', error);
      showNotification('Failed to save project settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isAddingMember) {
      const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
          const users = await userService.getUsers();
          setAvailableUsers(users);
        } catch (error) {
          console.error('Failed to fetch users:', error);
        } finally {
          setIsLoadingUsers(false);
        }
      };
      fetchUsers();
    }
  }, [isAddingMember]);

  const handleAddMember = async (user: User) => {
    if (!id || !project) return;
    
    if (project.team?.some(m => m.id === user.id)) {
      showNotification('User is already a member of this project.', 'warning');
      return;
    }

    try {
      await addProjectMember(id, user);
      showNotification(`${user.name} added to the team`, 'success');
      setIsAddingMember(false);
    } catch (error: any) {
      console.error('Failed to add member:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Failed to add member. Please try again.';
      showNotification(message, 'error');
    }
  };

  const [confirmingRemoveMemberId, setConfirmingRemoveMemberId] = useState<string | null>(null);

  const handleRemoveMember = async (userId: string) => {
    if (!id || !project) return;
    
    if (confirmingRemoveMemberId !== userId) {
      setConfirmingRemoveMemberId(userId);
      setTimeout(() => setConfirmingRemoveMemberId(null), 3000);
      return;
    }

    console.log('Confirmed removing member:', userId, 'from project:', id);
    try {
      await removeProjectMember(id, userId);
      setConfirmingRemoveMemberId(null);
      showNotification('Member removed from team', 'success');
      console.log('Member removed successfully');
    } catch (error: any) {
      console.error('Failed to remove member:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Failed to remove member. Please try again.';
      showNotification(message, 'error');
    }
  };

  const filteredUsers = availableUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      setTimeout(() => setIsConfirmingDelete(false), 3000); // Reset after 3s
      return;
    }

    console.log('Confirmed delete for id:', id);
    if (!id) return;

    try {
      setIsSaving(true);
      await remove(id);
      showNotification('Project deleted permanently', 'success');
      navigate('/projects');
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Delete operation failed. Please try again.';
      showNotification(message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-secondary font-bold">Project not found</p>
        <Link to="/projects" className="text-primary hover:underline font-black uppercase text-xs">Back to Projects</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Breadcrumbs & Header */}
      <div>
        <nav className="flex items-center gap-2 text-xs font-black text-secondary uppercase tracking-widest mb-4">
          <Link to="/projects" className="hover:text-primary transition-colors">Projects</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-on-background">{project.name}</span>
        </nav>
        <h1 className="text-4xl font-black text-on-background tracking-tight">Project Settings</h1>
        <p className="text-lg text-secondary font-medium mt-2">
          Manage your project configuration, team permissions, and lifecycle status.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Tabs */}
        <aside className="lg:col-span-3">
          <div className="bg-white border border-outline-variant rounded-3xl p-4 flex flex-col gap-1 shadow-sm">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all uppercase tracking-widest text-xs text-left",
                  activeTab === tab.id 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-secondary hover:bg-surface-container-low hover:text-on-surface"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-8">
          {activeTab === 'general' && (
            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-outline-variant rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-primary/5 space-y-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-3">
                  <Info className="w-6 h-6 text-primary" />
                  Project Details
                </h3>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-secondary uppercase tracking-widest">Project Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-secondary uppercase tracking-widest">Project Key</label>
                    <input 
                      type="text" 
                      value={project.key}
                      readOnly
                      className="w-full px-5 py-4 bg-surface-container/50 border border-outline-variant rounded-2xl text-outline font-bold text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-secondary uppercase tracking-widest">Client</label>
                    <input 
                      type="text" 
                      value={formData.client}
                      onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                      className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-secondary uppercase tracking-widest">Budget (USD)</label>
                    <input 
                      type="number" 
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                      className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-secondary uppercase tracking-widest">Description</label>
                  <textarea 
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-sm resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-secondary uppercase tracking-widest">Project Status</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: 'active', label: 'Active', icon: CheckCircle2, color: 'text-emerald-600', border: 'border-emerald-600' },
                      { id: 'hold', label: 'On Hold', icon: PauseCircle, color: 'text-amber-600', border: 'border-amber-600' },
                      { id: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-primary', border: 'border-primary' }
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, status: s.id })}
                        className={cn(
                          "flex items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-widest",
                          formData.status === s.id 
                            ? `${s.border} bg-surface-container-low shadow-md` 
                            : "border-outline-variant text-secondary hover:border-primary/30"
                        )}
                      >
                        <s.icon className={cn("w-5 h-5", formData.status === s.id ? s.color : "text-outline")} />
                        <span className={formData.status === s.id ? s.color : ""}>{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-outline-variant/30 flex justify-end gap-4">
                <button 
                  onClick={() => navigate('/projects')}
                  className="px-8 py-3.5 font-bold text-secondary hover:text-on-surface hover:bg-surface-container rounded-2xl transition-all uppercase tracking-widest text-xs"
                >
                  Discard
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-8 py-3.5 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </motion.section>
          )}

          {activeTab === 'team' && (
            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-outline-variant rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-primary/5 space-y-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" />
                  Team Members
                </h3>
                <button 
                  onClick={() => setIsAddingMember(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-surface-container-high text-primary rounded-xl font-bold text-xs uppercase tracking-widest hover:brightness-95 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Member</span>
                </button>
              </div>

              <div className="space-y-3">
                {(project.team || []).length > 0 ? (
                  project.team?.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-5 border border-outline-variant rounded-2xl hover:bg-surface-container-low transition-all group">
                      <div className="flex items-center gap-5">
                        <img 
                          className="w-12 h-12 rounded-full object-cover shadow-sm group-hover:ring-4 group-hover:ring-primary/10 transition-all" 
                          src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`} 
                          alt={member.name} 
                        />
                        <div>
                          <p className="font-bold text-on-surface group-hover:text-primary transition-colors">{member.name}</p>
                          <p className="text-xs text-secondary font-medium tracking-tight uppercase tracking-widest">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <span className="hidden md:block px-3 py-1 bg-surface-container text-secondary text-[10px] font-black uppercase tracking-wider rounded-lg">
                          {member.role}
                        </span>
                        <button 
                          onClick={() => handleRemoveMember(member.id)}
                          className={cn(
                            "p-2 rounded-xl transition-all",
                            confirmingRemoveMemberId === member.id
                              ? "bg-rose-500 text-white opacity-100"
                              : "md:opacity-0 group-hover:opacity-100 text-outline hover:text-rose-500 hover:bg-rose-50"
                          )}
                          title={confirmingRemoveMemberId === member.id ? "Click again to confirm" : "Remove member"}
                        >
                          {confirmingRemoveMemberId === member.id ? <X className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                   <div className="py-10 text-center text-secondary font-medium">No team members assigned yet.</div>
                )}
              </div>
            </motion.section>
          )}

          {activeTab === 'advanced' && (
            <section className="bg-rose-50 border border-rose-100 rounded-[2.5rem] p-8 md:p-10 space-y-8">
              <h3 className="text-2xl font-black text-rose-600 tracking-tight flex items-center gap-3">
                <AlertTriangle className="w-6 h-6" />
                Danger Zone
              </h3>

              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-rose-100/50 shadow-sm">
                  <div>
                    <p className="font-bold text-on-background">Archive this project</p>
                    <p className="text-sm text-secondary font-medium">Mark the project as inactive. It can be restored later.</p>
                  </div>
                  <button 
                    onClick={async () => {
                      if (!id) return;
                      try {
                        await update(id, { status: 'hold' as any });
                        setFormData({ ...formData, status: 'hold' });
                        showNotification('Project archived', 'success');
                      } catch (error) {
                        console.error('Failed to archive:', error);
                        showNotification('Failed to archive project', 'error');
                      }
                    }}
                    className="px-6 py-2.5 border-2 border-outline-variant text-on-surface hover:bg-surface-container rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                  >
                    Archive Project
                  </button>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-rose-200/50 shadow-sm">
                  <div>
                    <p className="font-bold text-rose-600">Delete this project</p>
                    <p className="text-sm text-secondary font-medium">Once deleted, all data including tasks and files will be permanently removed.</p>
                  </div>
                  <button 
                    onClick={handleDelete}
                    className={cn(
                      "px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg",
                      isConfirmingDelete 
                        ? "bg-rose-700 text-white shadow-rose-300 scale-105" 
                        : "bg-rose-600 text-white hover:brightness-110 active:scale-95 shadow-rose-200"
                    )}
                  >
                    {isConfirmingDelete ? 'Are you sure?' : 'Delete Permanently'}
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {isAddingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingMember(false)}
              className="absolute inset-0 bg-on-background/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-on-surface tracking-tight">Add Team Member</h2>
                    <p className="text-secondary font-medium text-sm">Select a colleague to join this project.</p>
                  </div>
                  <button 
                    onClick={() => setIsAddingMember(false)}
                    className="p-2 hover:bg-surface-container rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-outline" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                  <input 
                    type="text" 
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm"
                  />
                </div>

                <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {isLoadingUsers ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                      <p className="text-xs font-black text-secondary uppercase tracking-widest">Searching Users...</p>
                    </div>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => {
                      const isAlreadyInTeam = project.team?.some(m => m.id === user.id);
                      return (
                        <button
                          key={user.id}
                          disabled={isAlreadyInTeam}
                          onClick={() => handleAddMember(user)}
                          className={cn(
                            "w-full flex items-center justify-between p-4 rounded-2xl border border-transparent transition-all text-left group",
                            isAlreadyInTeam 
                              ? "opacity-50 cursor-not-allowed bg-surface-container-low" 
                              : "hover:border-primary hover:bg-surface-container-low"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <img 
                              className="w-10 h-10 rounded-full object-cover" 
                              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} 
                              alt={user.name} 
                            />
                            <div>
                              <p className="font-bold text-on-surface text-sm group-hover:text-primary transition-colors">{user.name}</p>
                              <p className="text-[10px] text-secondary font-black uppercase tracking-widest">{user.email}</p>
                            </div>
                          </div>
                          {isAlreadyInTeam ? (
                            <UserCheck className="w-5 h-5 text-primary" />
                          ) : (
                            <Plus className="w-5 h-5 text-outline group-hover:text-primary" />
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="py-20 text-center space-y-2">
                      <p className="font-bold text-secondary">No users found</p>
                      <p className="text-xs text-outline font-medium">Try a different search term</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
