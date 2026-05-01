import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ListTodo, 
  Calendar, 
  Download, 
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useUserStore } from '../store/userStore';
import { useProjectStore } from '../store/projectStore';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { useDashboardStats } from '../hooks/useData';
import { DashboardStats, ActivityLog } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);
  const isAdmin = currentUser?.role === 'Admin';
  const projects = useProjectStore((state) => state.projects);
  const { stats, activities, isLoading: statsLoading } = useDashboardStats();
  const [reportRange, setReportRange] = useState<'weekly' | 'monthly'>('weekly');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      await dashboardService.downloadReport(reportRange);
    } catch (error) {
      console.error('Failed to download report:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const getBarColor = (name: string) => {
    switch (name) {
      case 'To Do': return '#cbd5e1'; // slate-300
      case 'In Progress': return '#005bbf'; // primary
      case 'Under Review': return '#fbbf24'; // amber-400
      case 'Completed': return '#10b981'; // emerald-500
      default: return '#005bbf';
    }
  };

  const dashboardStatsCards = [
    { label: "Total tasks", value: stats ? String(stats.totalTasks) : '0', change: "+12%", icon: ListTodo, color: "text-primary", bg: "bg-primary-container/10" },
    { label: "Completed", value: stats ? String(stats.completedTasks) : '0', change: "+8%", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pending", value: stats ? String(stats.pendingTasks) : '0', status: "Stable", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Overdue", value: stats ? String(stats.overdueTasks).padStart(2, '0') : '00', change: "+2%", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  if (statsLoading && !stats) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-on-background tracking-tight">Dashboard</h1>
          <p className="text-lg text-secondary font-medium mt-1">Welcome back, {String(currentUser?.name || 'User').split(' ')[0]}. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <button className="bg-white border border-outline-variant px-5 py-2.5 rounded-xl font-bold text-on-surface hover:bg-surface-container-low transition-all flex items-center gap-2 shadow-sm uppercase tracking-widest text-[10px]">
              <Calendar className="w-4 h-4" />
              <span>{reportRange === 'weekly' ? 'This Week' : 'This Month'}</span>
              <ChevronRight className="w-4 h-4 rotate-90" />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white border border-outline-variant rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
               <button onClick={() => setReportRange('weekly')} className="w-full px-4 py-3 text-left text-xs font-bold hover:bg-surface-container-low transition-colors uppercase tracking-widest">Weekly Report</button>
               <button onClick={() => setReportRange('monthly')} className="w-full px-4 py-3 text-left text-xs font-bold hover:bg-surface-container-low transition-colors uppercase tracking-widest border-t border-outline-variant/10">Monthly Report</button>
            </div>
          </div>
          <button 
            onClick={handleDownloadReport}
            disabled={isDownloading}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:brightness-110 shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest text-[10px] disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Downloading...' : 'Export Report'}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStatsCards.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col gap-5 group hover:border-primary transition-all"
          >
            <div className="flex justify-between items-start">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              {stat.change && (
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">{stat.change}</span>
              )}
              {stat.status && (
                <span className="text-xs font-black text-secondary bg-surface-container px-2.5 py-1 rounded-full uppercase tracking-wider">{stat.status}</span>
              )}
            </div>
            <div>
              <p className="font-bold text-secondary uppercase tracking-widest text-[10px]">{stat.label}</p>
              <h2 className="text-4xl font-black text-on-background mt-1 tracking-tight">{stat.value}</h2>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task status distribution */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-outline-variant shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-on-background tracking-tight">Task Distribution</h3>
              <p className="text-sm text-secondary font-medium mt-1">Overview of current project status</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-full">
                <div className="w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-primary/20"></div>
                <span className="text-xs font-bold text-secondary uppercase tracking-tight">In Progress</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-full">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20"></div>
                <span className="text-xs font-bold text-secondary uppercase tracking-tight">Done</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.productivityData || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                   dataKey="name" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }}
                   dy={10}
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }} 
                />
                <Tooltip 
                   cursor={{ fill: '#F3F4F6' }}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {(stats?.productivityData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.name)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Progress */}
        <div className="bg-white p-8 rounded-[2rem] border border-outline-variant shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-on-background tracking-tight">Active Projects</h3>
            {projects.length > 3 && (
              <button 
                onClick={() => navigate('/projects')}
                className="text-primary hover:underline text-xs font-black uppercase tracking-widest"
              >
                View All
              </button>
            )}
          </div>
          <div className="space-y-8 flex-1">
            {Array.isArray(projects) && projects.length > 0 ? projects.slice(0, 3).map((project) => (
              <div key={project.id} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-on-surface uppercase tracking-tight">{project.name}</span>
                  <span className="text-sm font-black text-primary">{project.progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-surface-container-low rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full", 
                      project.status === 'active' ? "bg-primary" : "bg-secondary"
                    )}
                  />
                </div>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {Array.isArray(project.team) && project.team.slice(0, 3).map((member) => (
                        <img 
                          key={member.id} 
                          src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
                          alt={member.name}
                          title={member.name}
                          className="w-7 h-7 rounded-full border-2 border-white bg-surface-container ring-1 ring-black/5 object-cover" 
                        />
                      ))}
                      {Array.isArray(project.team) && project.team.length > 3 && (
                        <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 ring-1 ring-black/5 flex items-center justify-center text-[8px] font-black text-slate-500">
                          +{project.team.length - 3}
                        </div>
                      )}
                    </div>
                    {isAdmin && (
                      <button 
                        onClick={() => navigate(`/projects/${project.id}/settings`)}
                        className="text-primary hover:underline text-xs font-black uppercase tracking-widest"
                      >
                        Details
                      </button>
                    )}
                  </div>
              </div>
            )) : (
              <div className="text-center py-10">
                <p className="text-secondary font-medium">No projects found</p>
                {isAdmin && (
                  <button onClick={() => navigate('/projects/new')} className="text-primary font-bold text-xs mt-2 uppercase tracking-widest hover:underline">Create Project</button>
                )}
              </div>
            )}
          </div>
          <button 
            onClick={() => navigate('/projects')}
            className="w-full mt-10 py-3 text-primary font-bold text-sm hover:underline decoration-2 underline-offset-4 uppercase tracking-widest border-t border-outline-variant/30 text-center"
          >
            View All Projects
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-2xl font-black text-on-background tracking-tight mb-6">Recent Activities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.isArray(activities) && activities.length > 0 ? activities.map((activity, idx) => (
            <motion.div 
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-5 rounded-2xl border border-outline-variant flex items-center gap-5 hover:shadow-md hover:border-primary transition-all group cursor-pointer"
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", 
                activity.type === 'task' ? "bg-primary-container/10 text-primary" : 
                activity.type === 'project' ? "bg-emerald-50 text-emerald-600" :
                "bg-amber-50 text-amber-600"
              )}>
                {activity.type === 'task' ? <ListTodo className="w-6 h-6" /> : 
                 activity.type === 'project' ? <CheckCircle className="w-6 h-6" /> : 
                 <UserPlus className="w-6 h-6" />}
              </div>
              <div className="flex-grow">
                <h4 className="font-bold text-on-surface leading-tight">
                  <span className="text-primary">{activity.userName}</span> {activity.action}
                </h4>
                {activity.detail && <p className="text-xs text-secondary font-medium mt-1">{activity.detail}</p>}
                <p className="text-[10px] text-outline font-bold uppercase mt-1.5 tracking-wider">{activity.time}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-outline opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          )) : (
            <div className="col-span-full text-center py-12 bg-white border border-outline-variant rounded-2xl">
              <p className="text-secondary font-medium">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
