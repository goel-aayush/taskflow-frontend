import {
  UserPlus,
  TrendingUp,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Activity,
  Plus,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { useTeamManagement, useTeamList } from "../hooks/useData";
import { useUserStore } from "../store/userStore";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import EditMemberModal from "../components/EditMemberModal";
import { User as UserType } from "../types";

export default function Team() {
  const currentUser = useUserStore((state) => state.currentUser);
  const isAdmin = currentUser?.role === "Admin";

  const {
    team: fullTeam,
    isLoading: managementLoading,
    fetchTeam,
    remove,
  } = useTeamManagement();
  const { teamList: simpleTeam, isLoading: simpleLoading } = useTeamList();

  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  const [selectedMember, setSelectedMember] = useState<UserType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchTeam();
    }
  }, [isAdmin]);

  const teamData = isAdmin
    ? fullTeam
    : simpleTeam.map((u) => ({
        ...u,
        email: u.email || "",
        role: u.role || "Member",
        dept: u.dept || u.department || "N/A",
        department: u.department || u.dept || "N/A",
        status: u.status || "Active",
        avatar:
          u.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`,
      }));
  const isLoading = isAdmin ? managementLoading : simpleLoading;

  // Filter teamData
  const filteredTeam = (teamData || []).filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member as any).email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept =
      deptFilter === "All" || (member as any).dept === deptFilter;
    return matchesSearch && matchesDept;
  });

  const handleDeleteMember = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this team member?")) {
      await remove(id);
    }
  };

  const handleEditMember = (member: UserType) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const totalMembers = teamData.length;
  const activeMembers = teamData.filter(
    (m) => (m as any).status === "Active" || !(m as any).status,
  ).length;
  const uniqueDepts = new Set(
    teamData.map((m) => (m as any).dept || (m as any).department || "General"),
  ).size;
  const activeAvatars = teamData
    .filter((m) => (m as any).status === "Active" || !(m as any).status)
    .slice(0, 2)
    .map(
      (m) =>
        m.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=random`,
    );

  const dynamicStats = [
    {
      label: "Total Members",
      value: totalMembers.toString(),
      change: "+2",
      trend: "up",
    },
    {
      label: "Active Now",
      value: activeMembers.toString(),
      avatars: activeAvatars,
      count: Math.max(0, activeMembers - 2),
    },
    { label: "Departments", value: uniqueDepts.toString(), icon: Activity },
    { label: "System Status", value: "OK", status: "Healthy" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-on-background tracking-tight">
            Team Management
          </h2>
          <p className="text-lg text-secondary font-medium mt-1">
            Manage your team members, roles, and department access.
          </p>
        </div>
        {isAdmin && (
          <NavLink
            to="/team/new"
            className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all font-bold"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add New Member</span>
          </NavLink>
        )}
      </div>

      {/* Stats Bento Grid (Only if Admin or we have data) */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dynamicStats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-outline-variant flex flex-col justify-between hover:border-primary transition-colors cursor-default"
            >
              <span className="text-slate-500 text-[10px] font-black tracking-widest uppercase">
                {stat.label}
              </span>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-3xl font-black text-on-background tracking-tight">
                  {stat.value}
                </span>
                {stat.trend === "up" && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </span>
                )}
                {stat.avatars && (
                  <div className="flex -space-x-2">
                    {stat.avatars.map((avatar, i) => (
                      <img
                        key={i}
                        src={avatar}
                        className="w-6 h-6 rounded-full border-2 border-white bg-surface-container shadow-sm"
                        alt="Active user"
                      />
                    ))}
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-surface-container-low flex items-center justify-center text-[8px] font-black text-secondary shadow-inner">
                      +{stat.count}
                    </div>
                  </div>
                )}
                {stat.status && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 uppercase tracking-tight">
                    {stat.status}
                  </span>
                )}
                {stat.icon && (
                  <stat.icon className="w-5 h-5 text-outline-variant" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-container-low p-4 rounded-[1.5rem] border border-outline-variant">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 text-sm font-bold text-secondary uppercase tracking-widest px-2">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-white border border-outline-variant rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary font-medium min-w-[150px]"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product Design">Product Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Operations">Operations</option>
          </select>
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-white border border-outline-variant rounded-[2rem] overflow-hidden shadow-xl shadow-primary/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant">
                <th className="px-8 py-5 text-xs font-bold text-secondary uppercase tracking-widest">
                  Name
                </th>
                <th className="px-8 py-5 text-xs font-bold text-secondary uppercase tracking-widest">
                  Role
                </th>
                <th className="px-8 py-5 text-xs font-bold text-secondary uppercase tracking-widest">
                  Department
                </th>
                <th className="px-8 py-5 text-xs font-bold text-secondary uppercase tracking-widest">
                  Status
                </th>
                <th className="px-8 py-5 text-xs font-bold text-secondary uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-secondary font-bold">
                        Loading team members...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredTeam.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-8 py-20 text-center text-secondary font-bold"
                  >
                    No members found matching your search.
                  </td>
                </tr>
              ) : (
                filteredTeam.map((member, idx) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 + 0.2 }}
                    className="hover:bg-surface-container-low/30 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <img
                          className="w-10 h-10 rounded-full object-cover border-2 border-surface-container group-hover:ring-2 group-hover:ring-primary/20 transition-all"
                          src={
                            member.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`
                          }
                          alt={member.name}
                        />
                        <div>
                          <div className="font-bold text-on-background group-hover:text-primary transition-colors">
                            {member.name}
                          </div>
                          <div className="text-xs text-secondary font-medium tracking-tight">
                            {(member as any).email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                          member.role === "Admin"
                            ? "bg-primary-container/10 text-primary"
                            : "bg-surface-container text-secondary",
                        )}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-secondary">
                      {(member as any).dept ||
                        (member as any).department ||
                        "General"}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            (member as any).status === "Away"
                              ? "bg-amber-400"
                              : "bg-emerald-500",
                          )}
                        ></div>
                        <span className="text-sm font-black text-on-background tracking-tight">
                          {(member as any).status || "Active"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditMember(member)}
                          className="p-2 text-outline hover:text-primary hover:bg-primary-container/10 rounded-xl transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="p-2 text-outline hover:text-error hover:bg-error-container/20 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-5 bg-surface-container-low/20 border-t border-outline-variant flex items-center justify-between">
          <span className="text-sm text-secondary font-medium tracking-tight">
            Showing {filteredTeam.length} of {teamData.length} members
          </span>
          <div className="flex items-center gap-2">
            <button
              className="p-2 border border-outline-variant rounded-xl text-secondary hover:bg-white hover:text-on-surface transition-all disabled:opacity-30"
              disabled
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              className="p-2 border border-outline-variant rounded-xl text-secondary hover:bg-white hover:text-on-surface transition-all disabled:opacity-30"
              disabled
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <EditMemberModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        member={selectedMember || ({} as UserType)}
      />
    </div>
  );
}
