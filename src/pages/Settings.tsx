import React from 'react';
import { 
  User, 
  Bell, 
  ShieldCheck, 
  Building2, 
  Camera, 
  Mail, 
  Lock, 
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useState } from 'react';

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'workspace', label: 'Workspace', icon: Building2 },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState('profile');

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h1 className="text-4xl font-black text-on-background tracking-tight">Settings</h1>
        <p className="text-lg text-secondary font-medium mt-2">
          Manage your personal account and workspace preferences.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Navigation Sidebar */}
        <nav className="w-full lg:w-64 shrink-0 space-y-2">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all uppercase tracking-widest text-xs",
                activeSection === section.id 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-secondary hover:bg-surface-container-high hover:text-on-surface"
              )}
            >
              <section.icon className="w-5 h-5" />
              <span>{section.label}</span>
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <div className="flex-1 space-y-10">
          {/* Public Profile Section */}
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-outline-variant rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-primary/5"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-on-surface tracking-tight">Public Profile</h3>
              <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-md">
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>

            <div className="space-y-8">
              {/* Profile Photo */}
              <div className="flex items-center gap-8 pb-8 border-b border-outline-variant/30">
                <div className="relative group cursor-pointer">
                  <img 
                    className="w-28 h-28 rounded-full object-cover ring-4 ring-primary-container/10 group-hover:ring-primary/20 transition-all" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDISF19s1bvtI-vYo92iks9SUJaHB63ep-crcLwIw6H_SrKjeviCKdKhBM0XPocl7mrGFNhu_8C9VOtdXFbeI_59Bir3uoo9yTZhAaeiLnlP-vtMsircF4I4OpikTD7cLRBA6V4TOU-z8smVltZHfA67kHrN9c1dWFDiHHXHrpVXF5oN8xY_1yBjK3emhlEB3f_6zxnMIt1kOjdpct6X5VkVqgXa4ov1yC_XCHogGi15JLqmu-wYeww5UBiEp4WgxUbNnTyzp0NduOi" 
                    alt="Current profile"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <p className="font-black text-on-surface uppercase tracking-widest text-[10px] mb-1.5">Profile Photo</p>
                  <p className="text-xs text-secondary font-medium mb-4">JPG, GIF or PNG. Max size of 800K</p>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 border border-outline-variant text-on-surface text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-surface-container transition-all">Update</button>
                    <button className="px-4 py-2 border border-rose-100 text-rose-600 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-rose-50 transition-all">Remove</button>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue="Alex Rivera"
                    className="w-full px-5 py-3.5 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    defaultValue="alex.rivera@company.com"
                    className="w-full px-5 py-3.5 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                  />
                </div>
                <div className="col-span-full space-y-2">
                  <label className="text-sm font-bold text-on-surface uppercase tracking-wider">Bio</label>
                  <textarea 
                    rows={4}
                    defaultValue="Project Lead at Acme Corp. Passionate about streamlining workflows and building high-performance teams."
                    className="w-full px-5 py-3.5 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium resize-none"
                  />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Notification Preferences */}
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-outline-variant rounded-[2.5rem] overflow-hidden shadow-xl shadow-primary/5"
          >
            <div className="p-8 md:p-10 border-b border-outline-variant/30 bg-surface-container-lowest">
              <h3 className="text-2xl font-black text-on-surface tracking-tight">Notification Preferences</h3>
              <p className="text-sm text-secondary font-medium mt-1">Choose how you want to be notified about activity in TaskFlow.</p>
            </div>
            
            <div className="divide-y divide-outline-variant/20">
              {[
                { label: "Direct Mentions", desc: "Receive email when someone @mentions you", icon: Mail, checked: true },
                { label: "Task Updates", desc: "Notify when tasks I'm watching are updated", icon: CheckCircle2, checked: true },
                { label: "Workspace News", desc: "Receive monthly tips and feature updates", icon: Bell, checked: false },
              ].map((item, idx) => (
                <div key={idx} className="p-6 md:p-8 flex items-center justify-between hover:bg-surface-container-low transition-colors group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-primary-container/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">{item.label}</p>
                      <p className="text-sm text-secondary font-medium">{item.desc}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                    <div className="w-14 h-7 bg-outline-variant/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                  </label>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Security Section */}
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-outline-variant rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-primary/5"
          >
            <div className="mb-10">
              <h3 className="text-2xl font-black text-on-surface tracking-tight mb-2">Password & Security</h3>
              <p className="text-sm text-secondary font-medium">Ensure your account is using a long, random password to stay secure.</p>
            </div>

            <div className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <label className="text-sm font-bold text-on-surface uppercase tracking-wider">Current Password</label>
                <div className="md:col-span-2">
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full px-5 py-3.5 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <label className="text-sm font-bold text-on-surface uppercase tracking-wider">New Password</label>
                <div className="md:col-span-2">
                  <input 
                    type="password" 
                    placeholder="Min. 12 characters"
                    className="w-full px-5 py-3.5 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <label className="text-sm font-bold text-on-surface uppercase tracking-wider">Confirm New Password</label>
                <div className="md:col-span-2">
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full px-5 py-3.5 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <button className="px-8 py-3.5 bg-primary/10 text-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/20 transition-all">
                Update Password
              </button>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
