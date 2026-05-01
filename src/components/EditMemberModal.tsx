import React, { useState } from 'react';
import { 
  X, 
  User, 
  Shield, 
  Briefcase, 
  CheckCircle2, 
  Mail,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTeamManagement } from '../hooks/useData';
import { useUserStore } from '../store/userStore';
import { cn } from '../lib/utils';
import { User as UserType } from '../types';

interface EditMemberModalProps {
  member: UserType;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditMemberModal({ member, isOpen, onClose }: EditMemberModalProps) {
  const { update } = useTeamManagement();
  const currentUser = useUserStore((state) => state.currentUser);
  const isAdmin = currentUser?.role === 'Admin';
  
  const [formData, setFormData] = useState({
    name: member.name,
    email: (member as any).email || '',
    role: member.role || 'member',
    department: (member as any).dept || (member as any).department || 'Engineering',
    status: (member as any).status || 'Active'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // If not admin, only send status
      const dataToUpdate = isAdmin ? formData : { status: formData.status };
      await update(member.id, dataToUpdate);
      onClose();
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-8 py-8 border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-on-background tracking-tight">
                  {isAdmin ? 'Edit Member' : 'Edit Status'}
                </h2>
                <p className="text-sm font-bold text-secondary uppercase tracking-widest mt-0.5">
                  {(member as any).email || 'Team Profile'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 text-secondary hover:text-on-background hover:bg-surface-container-high rounded-2xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-8 space-y-6">
              {/* Member Basic Info (Read Only if not Admin) */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Member Name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isAdmin}
                      className={cn(
                        "w-full px-5 py-4 border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium",
                        !isAdmin ? "bg-surface-container opacity-60 cursor-not-allowed" : "bg-surface-container-low"
                      )}
                    />
                    <User className="absolute right-5 top-1/2 -translate-y-1/2 text-outline pointer-events-none w-4 h-4" />
                  </div>
                </div>

                {isAdmin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-nowrap">Role</label>
                       <div className="relative">
                        <select 
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium appearance-none"
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                        </select>
                        <Shield className="absolute right-5 top-1/2 -translate-y-1/2 text-outline pointer-events-none w-4 h-4" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-nowrap">Department</label>
                       <div className="relative">
                        <select 
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium appearance-none text-nowrap pr-10"
                        >
                          <option value="Engineering">Engineering</option>
                          <option value="Product Design">Product Design</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Operations">Operations</option>
                        </select>
                        <Briefcase className="absolute right-5 top-1/2 -translate-y-1/2 text-outline pointer-events-none w-4 h-4" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status (Editable by both Admin and Member) */}
              <div className="space-y-3 pt-4 border-t border-outline-variant/30">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Status</label>
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

            {/* Footer */}
            <div className="px-8 py-6 border-t border-outline-variant bg-surface-container-low flex items-center justify-end gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-secondary font-bold hover:bg-surface-container-high rounded-xl transition-all uppercase tracking-widest text-[10px]"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 bg-primary text-white rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Update {isAdmin ? 'Member' : 'Status'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
