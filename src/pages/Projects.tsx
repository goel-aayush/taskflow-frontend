import { 
  Plus, 
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useProjects, useProjectStats } from '../hooks/useData';
import { useUserStore } from '../store/userStore';

export default function Projects() {
  const navigate = useNavigate();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { stats, isLoading: statsLoading } = useProjectStats();
  const currentUser = useUserStore((state) => state.currentUser);
  const isAdmin = currentUser?.role === 'Admin';

  const projectStats = stats || [
    { label: "Active Tasks", value: "24", change: "+12%", type: "positive" },
    { label: "Total Projects", value: "08", status: "Stable", type: "neutral" },
    { label: "Team Health", value: "94%", status: "Optimal", type: "positive" },
    { label: "Deadline Risks", value: "02", change: "-5%", type: "negative" },
  ];

  if (projectsLoading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-on-background tracking-tight">Active Projects</h2>
          <p className="text-lg text-secondary font-medium mt-1">Overview of your current ongoing initiatives and team performance.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => navigate('/projects/new')}
            className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all font-bold"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Project</span>
          </button>
        )}
      </div>

      {/* Quick Stats Bento */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {projectStats.map((stat: any, idx: number) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-outline-variant flex flex-col justify-between hover:border-primary transition-colors cursor-default"
          >
            <span className="text-slate-500 text-[10px] font-black tracking-widest uppercase">{stat.label}</span>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-3xl font-black text-on-background tracking-tight">{stat.value}</span>
              {stat.change && (
                <span className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-tight",
                  stat.type === "positive" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>{stat.change}</span>
              )}
              {stat.status && (
                <span className={cn(
                   "text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-tight",
                   (stat.status === "Optimal" || stat.status === "Stable") ? "bg-emerald-50 text-emerald-600" : "bg-surface-container text-secondary"
                )}>{stat.status}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {Array.isArray(projects) && projects.map((project, idx) => (
          <motion.article 
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-white border border-outline-variant rounded-3xl overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-primary/5 hover:translate-y-[-4px] transition-all duration-300"
          >
            <div className="h-44 w-full bg-surface-container relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/30 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 right-4">
                <span className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm",
                  project.status === 'active' ? "bg-emerald-100 text-emerald-700" :
                  project.status === 'hold' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                )}>
                  {project.status}
                </span>
              </div>
            </div>
            
            <div className="p-8 flex-1 flex flex-col">
              <h3 className="text-2xl font-black text-on-surface tracking-tight group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <p className="text-sm text-secondary font-medium mt-3 leading-relaxed line-clamp-2">
                {project.description}
              </p>
              
              <div className="mt-auto pt-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Progress</span>
                  <span className={cn(
                    "text-sm font-black",
                    project.progress > 80 ? "text-emerald-600" : project.progress > 40 ? "text-primary" : "text-amber-600"
                  )}>{project.progress}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={cn(
                      "h-full rounded-full",
                      project.progress > 80 ? "bg-emerald-500" : project.progress > 40 ? "bg-primary" : "bg-amber-500"
                    )}
                  />
                </div>
                
                <div className="mt-8 flex items-center justify-between border-t border-outline-variant/30 pt-4">
                  <div className="flex -space-x-3">
                    {Array.isArray(project.team) && project.team.slice(0, 4).map((member) => (
                      <img 
                        key={member.id} 
                        src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
                        alt={member.name}
                        title={member.name}
                        className="w-9 h-9 rounded-full border-2 border-white bg-surface-container ring-1 ring-black/5 object-cover" 
                      />
                    ))}
                    {Array.isArray(project.team) && project.team.length > 4 && (
                      <div className="w-9 h-9 rounded-full border-2 border-white bg-slate-100 ring-1 ring-black/5 flex items-center justify-center text-[10px] font-black text-slate-500">
                        +{project.team.length - 4}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {isAdmin && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/projects/${project.id}/settings`);
                        }}
                        className="font-bold text-primary flex items-center gap-1 group text-sm uppercase tracking-widest hover:translate-x-1 transition-transform"
                      >
                        Manage <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.article>
        ))}

        {/* Empty State / Add Project Card - Only for Admin */}
        {isAdmin && (
          <button 
            onClick={() => navigate('/projects/new')}
            className="border-2 border-dashed border-outline-variant rounded-[2rem] flex flex-col items-center justify-center p-12 hover:bg-white hover:border-primary/50 transition-all group min-h-[450px] shadow-sm hover:shadow-xl hover:shadow-primary/5"
          >
            <div className="w-20 h-20 rounded-3xl bg-primary-container/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all transform duration-300">
              <Plus className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-on-background tracking-tight">Start New Project</h3>
            <p className="text-sm text-secondary font-medium mt-3 text-center max-w-[240px] leading-relaxed">
              Kick off a new initiative with your team members and start delivering results.
            </p>
          </button>
        )}
      </div>
    </div>
  );
}
