import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Lightbulb, 
  Info,
  DollarSign,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  ChevronDown,
  X,
  PlusCircle,
  Search,
  AlertCircle
} from 'lucide-react';
import { useProjects } from '../hooks/useData';
import { useUIStore } from '../store/uiStore';
import { useUserStore } from '../store/userStore';
import { useEffect } from 'react';

export default function CreateProject() {
  const navigate = useNavigate();
  const { projects, create } = useProjects();
  const showNotification = useUIStore((state) => state.showNotification);
  const currentUser = useUserStore((state) => state.currentUser);
  
  useEffect(() => {
    if (currentUser && currentUser.role !== 'Admin') {
      showNotification('Only administrators can create new projects', 'error');
      navigate('/projects');
    }
  }, [currentUser, navigate, showNotification]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    client: '',
    description: '',
    budget: 0,
    status: 'active' as const,
    startDate: '',
    endDate: '',
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const key = name.substring(0, 3).toUpperCase();
    setFormData({ ...formData, name, key });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      // Basic check for duplicate keys in local state
      const keyExists = projects.some(p => p.key === formData.key);
      if (keyExists) {
        setError(`A project with key "${formData.key}" already exists. Please choose a different key.`);
        setIsSubmitting(false);
        return;
      }

      await create({
        ...formData,
        dueDate: formData.endDate || '2024-12-31',
      });
      showNotification('Project created successfully', 'success');
      navigate('/projects');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create project';
      setError(message);
      showNotification(message, 'error');
      console.error('Failed to create project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-on-background tracking-tight">Create New Project</h1>
          <p className="text-lg text-secondary font-medium mt-2">
            Define the parameters, objectives, and team for your next big venture.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            type="button" 
            onClick={() => navigate('/projects')}
            className="px-6 py-2.5 font-bold text-secondary hover:text-on-surface hover:bg-surface-container rounded-xl transition-all uppercase tracking-widest text-xs"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3.5 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Project'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error-container/10 border border-error/20 p-4 rounded-2xl flex items-center gap-3 text-error text-sm font-bold animate-in bounce-in duration-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Primary Details */}
        <div className="lg:col-span-8 space-y-8">
          {/* Project Identity */}
          <div className="bg-white p-8 rounded-[2rem] border border-outline-variant shadow-xl shadow-primary/5 space-y-8">
            <h3 className="text-xl font-black text-on-background tracking-tight flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Info className="w-5 h-5" />
              </div>
              Project Identity
            </h3>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 space-y-2">
                  <label className="text-sm font-bold text-on-surface uppercase tracking-wider">Project Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Q4 Growth Strategy"
                    className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-lg placeholder:text-outline/40"
                  />
                </div>
                <div className="md:col-span-1 space-y-2">
                  <label className="text-sm font-bold text-on-surface uppercase tracking-wider">Key</label>
                  <input 
                    type="text" 
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                    placeholder="KEY"
                    maxLength={5}
                    className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-lg text-center uppercase"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface uppercase tracking-wider">Client / Account</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                  <input 
                    type="text" 
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    placeholder="Search existing clients..."
                    className="w-full px-12 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium placeholder:text-outline/40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface uppercase tracking-wider">Project Description</label>
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
                    placeholder="Provide a high-level summary of goals, deliverables, and success metrics..."
                    className="w-full px-5 py-4 bg-surface-container-low border-none text-on-surface font-medium placeholder:text-outline/40 focus:ring-0 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Team & Collaborators */}
          <div className="bg-white p-8 rounded-[2rem] border border-outline-variant shadow-xl shadow-primary/5 space-y-8">
            <h3 className="text-xl font-black text-on-background tracking-tight flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Users className="w-5 h-5" />
              </div>
              Team & Collaborators
            </h3>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-on-surface uppercase tracking-wider">Assigned Members</label>
                <div className="flex flex-wrap gap-3 p-3 bg-surface-container-low/50 border border-outline-variant rounded-2xl min-h-[64px]">
                  <div className="flex items-center gap-2 bg-primary-container/10 text-primary px-3 py-1.5 rounded-xl font-bold text-xs ring-1 ring-primary/20">
                    <img className="w-5 h-5 rounded-full object-cover" src="https://i.pravatar.cc/150?u=1" alt="Sarah Chen" />
                    <span>Sarah Chen</span>
                    <button className="text-primary hover:text-primary/70"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-center gap-2 bg-primary-container/10 text-primary px-3 py-1.5 rounded-xl font-bold text-xs ring-1 ring-primary/20">
                    <img className="w-5 h-5 rounded-full object-cover" src="https://i.pravatar.cc/150?u=10" alt="Marcus Wright" />
                    <span>Marcus Wright</span>
                    <button className="text-primary hover:text-primary/70"><X className="w-4 h-4" /></button>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Add more..." 
                    className="flex-1 min-w-[150px] bg-transparent border-none outline-none text-sm font-medium focus:ring-0 px-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Jessica Miller", role: "Product Designer", avatar: "https://i.pravatar.cc/150?u=3" },
                  { name: "Liam Thompson", role: "Data Analyst", avatar: "https://i.pravatar.cc/150?u=4" }
                ].map((user) => (
                  <div key={user.name} className="flex items-center justify-between p-3 border border-outline-variant rounded-2xl bg-white hover:border-primary transition-all group cursor-pointer shadow-sm">
                    <div className="flex items-center gap-3">
                      <img className="w-10 h-10 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all" src={user.avatar} alt={user.name} />
                      <div>
                        <p className="font-bold text-on-surface group-hover:text-primary transition-colors text-sm">{user.name}</p>
                        <p className="text-xs text-secondary font-medium tracking-tight">{user.role}</p>
                      </div>
                    </div>
                    <PlusCircle className="w-5 h-5 text-outline group-hover:text-primary transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Financials */}
        <div className="lg:col-span-4 space-y-8">
          {/* Timeline Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-outline-variant shadow-xl shadow-primary/5 space-y-6">
            <h3 className="text-xl font-black text-on-surface tracking-tight flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              Timeline
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-secondary uppercase tracking-widest">Start Date</label>
                <input 
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-secondary uppercase tracking-widest">End Date</label>
                <input 
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm"
                />
              </div>

              <div className="p-4 bg-surface-container-low/50 rounded-2xl border border-outline-variant/30 space-y-3">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-secondary">
                  <span>Est. Duration</span>
                  <span className="text-primary">45 Days</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden shadow-inner">
                  <div className="h-full w-1/3 bg-primary rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Financials Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-outline-variant shadow-xl shadow-primary/5 space-y-6">
            <h3 className="text-xl font-black text-on-surface tracking-tight flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-primary" />
              Financials
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-secondary uppercase tracking-widest">Project Budget (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline font-black">$</span>
                  <input 
                    type="number" 
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-secondary uppercase tracking-widest">Resource Allocation</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold appearance-none">
                    <option>Full Capacity (100%)</option>
                    <option>Partial (50%)</option>
                    <option>Maintenance (20%)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none w-4 h-4" />
                </div>
              </div>

              <div className="flex items-center gap-3 py-2 border-t border-outline-variant/20">
                <input 
                  type="checkbox" 
                  id="billable"
                  className="w-5 h-5 text-primary border-outline-variant rounded-md focus:ring-primary/20 cursor-pointer"
                />
                <label htmlFor="billable" className="text-sm font-bold text-on-surface cursor-pointer">Mark project as billable</label>
              </div>
            </div>
          </div>

          {/* Pro Tip Card */}
          <div className="bg-primary p-8 rounded-[2.5rem] text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Lightbulb className="w-40 h-40" />
            </div>
            <div className="relative z-10 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 underline underline-offset-4 decoration-white/30">Pro Tip</span>
              <p className="font-bold text-lg leading-relaxed">
                Defining clear success metrics in the description helps the system generate automated progress reports.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
