import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  UserPlus, 
  Mail, 
  Lock, 
  Briefcase, 
  Shield, 
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTeamManagement } from '../hooks/useData';
import { useUIStore } from '../store/uiStore';
import { useUserStore } from '../store/userStore';

export default function CreateMember() {
  const navigate = useNavigate();
  const { create } = useTeamManagement();
  const showNotification = useUIStore((state) => state.showNotification);
  const currentUser = useUserStore((state) => state.currentUser);
  
  useEffect(() => {
    if (currentUser && currentUser.role !== 'Admin') {
      showNotification('Only administrators can create new team members', 'error');
      navigate('/team');
    }
  }, [currentUser, navigate, showNotification]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Engineering',
    role: 'member',
    status: 'Active'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await create(formData);
      navigate('/team');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create team member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => navigate('/team')}
        className="flex items-center gap-2 text-secondary hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px] mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Team</span>
      </button>

      <div className="bg-white rounded-[2.5rem] border border-outline-variant shadow-2xl shadow-primary/5 overflow-hidden">
        <div className="bg-primary px-10 py-10 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-black tracking-tight">Add Team Member</h1>
            <p className="text-primary-container/80 font-medium mt-2">Initialize a new account for your colleague.</p>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <UserPlus className="w-64 h-64" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-error/5 border border-error/20 text-error p-4 rounded-2xl flex items-center gap-3 overflow-hidden"
              >
                <XCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Name */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Mike Wilson"
                  className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                  required
                />
                <UserPlus className="absolute right-5 top-1/2 -translate-y-1/2 text-outline pointer-events-none w-4 h-4" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="mike@taskflow.com"
                  className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                  required
                />
                <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-outline pointer-events-none w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Password */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Temporary Password</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mike@1234"
                  className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                  required
                />
                <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-outline pointer-events-none w-4 h-4" />
              </div>
            </div>

            {/* Department */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Department</label>
              <div className="relative">
                <select 
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium appearance-none"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Product Design">Product Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                  <option value="Management">Management</option>
                </select>
                <Briefcase className="absolute right-5 top-1/2 -translate-y-1/2 text-outline pointer-events-none w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-outline-variant/30">
            {/* Role */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Initial Role</label>
              <div className="flex gap-4">
                {['member', 'admin'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({ ...formData, role })}
                    className={`flex-1 py-4 px-4 rounded-xl border-2 transition-all font-bold flex items-center justify-center gap-2 ${
                      formData.role === role 
                        ? 'bg-primary/5 border-primary text-primary shadow-lg shadow-primary/5' 
                        : 'bg-white border-outline-variant text-secondary hover:border-outline'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span className="capitalize">{role}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Initial Status</label>
              <div className="flex gap-4">
                {['Active', 'Away'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData({ ...formData, status })}
                    className={`flex-1 py-4 px-4 rounded-xl border-2 transition-all font-bold flex items-center justify-center gap-2 ${
                      formData.status === status 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-lg shadow-emerald-500/5' 
                        : 'bg-white border-outline-variant text-secondary hover:border-outline'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${formData.status === status ? 'text-emerald-600' : 'text-outline'}`} />
                    <span>{status}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black tracking-tight text-lg shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="w-6 h-6" />
                  <span>Create Team Member</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
