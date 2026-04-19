'use client';

import { useEffect, useState } from 'react';
import { 
  Plus, Loader2, Briefcase, RefreshCw, ListTodo, Users, 
  CheckCircle2, Clock, CircleDot, MoreVertical, Pencil, Trash2,
  TrendingUp, Search, Activity, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { CreateProjectDrawer } from '@/components/projects/CreateProjectDrawer';
import { EditProjectDrawer } from '@/components/projects/EditProjectDrawer';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; dot: string }> = {
  ACTIVE:      { label: 'Active',      icon: Activity,     color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
  COMPLETED:   { label: 'Completed',   icon: CheckCircle2, color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',     dot: 'bg-blue-400' },
  ON_HOLD:     { label: 'On Hold',     icon: Clock,        color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',   dot: 'bg-amber-400' },
  TODO:        { label: 'Pending',     icon: CircleDot,    color: 'text-slate-400',   bg: 'bg-slate-500/10 border-slate-500/20',   dot: 'bg-slate-400' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; shadow: string }> = {
  URGENT: { label: 'URGENT',   color: 'bg-red-500',    shadow: 'shadow-[0_0_12px_rgba(239,68,68,0.4)]' },
  HIGH:   { label: 'HIGH',     color: 'bg-orange-500', shadow: 'shadow-[0_0_12px_rgba(249,115,22,0.4)]' },
  MEDIUM: { label: 'NORMAL',   color: 'bg-amber-500',  shadow: 'shadow-[0_0_12px_rgba(245,158,11,0.4)]' },
  LOW:    { label: 'LOW',      color: 'bg-blue-500',   shadow: 'shadow-[0_0_12px_rgba(59,130,246,0.4)]' },
};

const PROJECT_GRADIENTS = [
  'from-violet-500/20 to-purple-600/10',
  'from-blue-500/20 to-cyan-600/10',
  'from-emerald-500/20 to-teal-600/10',
  'from-rose-500/20 to-pink-600/10',
  'from-amber-500/20 to-orange-600/10',
  'from-indigo-500/20 to-blue-600/10',
];

const PROJECT_ACCENT = [
  'border-violet-500/30',
  'border-blue-500/30',
  'border-emerald-500/30',
  'border-rose-500/30',
  'border-amber-500/30',
  'border-indigo-500/30',
];

function getProjectStyle(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % PROJECT_GRADIENTS.length;
}

export default function ProjectsPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';
  const router = useRouter();

  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const fetchProjects = async (silent = false) => {
    if (silent) setIsRefreshing(true);
    else setIsLoading(true);
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenu(null);
    if (!confirm('Delete this project? All associated tasks will be permanently removed.')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      fetchProjects(true);
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const handleEditClick = (project: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenu(null);
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };

  useEffect(() => { fetchProjects(); }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      // Don't close if we clicked the menu button itself (handled by the toggle)
      if ((e.target as HTMLElement).closest('.menu-trigger')) return;
      setOpenMenu(null);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const filtered = projects.filter(p => {
    const matchSearch = !search.trim() || 
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Stats
  const stats = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'IN_PROGRESS').length,
    completed: projects.filter(p => p.status === 'DONE').length,
    avgProgress: projects.length > 0 
      ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
      : 0,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Briefcase size={14} className="text-primary" />
            </div>
            <span className="text-[11px] font-black text-primary uppercase tracking-widest">Projects</span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight leading-tight">
            Project Dashboard
          </h1>
          <p className="text-muted-foreground text-sm font-medium max-w-md leading-relaxed opacity-70">
            Track, manage, and deliver projects across all teams and departments.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => fetchProjects(true)}
            disabled={isRefreshing}
            className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-muted-foreground hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          {isAdmin && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none rounded-xl h-10 px-5 text-sm font-bold"
            >
              <Plus size={16} className="mr-2" />
              New Project
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
            <span className="text-sm text-muted-foreground font-medium">Loading projects...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Projects',  value: stats.total,      icon: Briefcase,    color: 'text-primary',      bg: 'bg-primary/10' },
              { label: 'In Progress',     value: stats.inProgress, icon: Clock,        color: 'text-blue-400',     bg: 'bg-blue-500/10' },
              { label: 'Completed',       value: stats.completed,  icon: CheckCircle2, color: 'text-emerald-400',  bg: 'bg-emerald-500/10' },
              { label: 'Avg. Progress',   value: `${stats.avgProgress}%`, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            ].map(s => (
              <div key={s.label} className="bg-muted/50 border border-divider rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                <div className={cn('p-2 rounded-xl', s.bg)}>
                  <s.icon size={16} className={s.color} />
                </div>
                <div>
                  <div className="text-xl font-black text-foreground tabular-nums leading-none">{s.value}</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1 opacity-60">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-muted/50 border border-divider rounded-xl h-9 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground/30 outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium"
              />
            </div>
            <CustomSelect
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { value: 'ALL', label: 'All Status' },
                { value: 'TODO', label: 'Not Started', color: 'text-slate-400' },
                { value: 'IN_PROGRESS', label: 'In Progress', color: 'text-amber-400' },
                { value: 'DONE', label: 'Completed', color: 'text-emerald-400' }
              ]}
              className="bg-muted/50 border border-divider rounded-xl h-9 px-4 text-[10px] font-black text-foreground/70 uppercase tracking-widest min-w-[140px] hover:bg-muted transition-all"
              dropdownClassName="uppercase text-[9px] tracking-widest"
            />
          </div>

          {/* Project Grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 bg-white/[0.02] border border-white/5 rounded-2xl">
              <Briefcase size={36} className="text-muted-foreground/30" />
              <div className="text-center">
                <p className="font-bold text-muted-foreground">No projects found</p>
                <p className="text-sm text-muted-foreground/50 mt-1">
                  {search || filterStatus !== 'ALL' ? 'Try adjusting your filters' : 'Create your first project to get started'}
                </p>
              </div>
              {isAdmin && !search && filterStatus === 'ALL' && (
                <Button onClick={() => setIsModalOpen(true)} className="rounded-xl mt-2" size="sm">
                  <Plus size={14} className="mr-2" /> New Project
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((p) => {
                const status = STATUS_CONFIG[p.status] || STATUS_CONFIG.TODO;
                const priority = PRIORITY_CONFIG[p.priority] || PRIORITY_CONFIG.MEDIUM;
                const progress = Math.round(p.progress || 0);
                const memberCount = p.members?.length || 0;
                const isMenuOpen = openMenu === p._id;

                return (
                  <div
                    key={p._id}
                    onClick={() => router.push(`/projects/${p._id}`)}
                    className="group relative bg-card border border-divider rounded-[24px] p-5 transition-all duration-500 hover:bg-muted/10 hover:border-primary/30 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] cursor-pointer overflow-hidden flex flex-col"
                  >
                    {/* Background accent */}
                    <div 
                       className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"
                       style={{ background: p.color || 'var(--primary)' }}
                    />

                    {/* Header */}
                    <div className="flex items-start justify-between mb-6 relative z-10">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl border flex items-center justify-center shadow-inner"
                          style={p.color ? { borderColor: `${p.color}40`, background: `${p.color}15` } : { borderColor: 'rgba(255,255,255,0.1)' }}
                        >
                          <Briefcase size={18} style={p.color ? { color: p.color } : { color: 'var(--primary)' }} />
                        </div>
                        <div>
                           <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="font-extrabold text-base text-foreground tracking-tight line-clamp-1">{p.title}</h3>
                              <div 
                                className={cn("w-1.5 h-1.5 rounded-full", priority.color, priority.shadow)} 
                                title={`Priority: ${priority.label}`}
                              />
                           </div>
                           <div className={cn("text-[9px] font-black uppercase tracking-[0.2em]", status.color)}>
                              {status.label}
                           </div>
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="relative menu-trigger">
                          <button
                            onClick={e => { 
                              e.stopPropagation(); 
                              setOpenMenu(isMenuOpen ? null : p._id); 
                            }}
                            className={cn(
                              "p-2 rounded-xl border transition-all duration-300",
                              isMenuOpen 
                                ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20" 
                                : "bg-muted border-divider text-muted-foreground/40 hover:text-foreground hover:border-primary/30"
                            )}
                          >
                            <MoreVertical size={16} strokeWidth={2.5} />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-0 top-12 bg-card border border-divider rounded-2xl shadow-2xl z-50 overflow-hidden min-w-[180px] animate-in slide-in-from-top-2 duration-200">
                              <button
                                onClick={e => handleEditClick(p, e)}
                                className="w-full flex items-center gap-3 px-5 py-4 text-[11px] font-black uppercase tracking-widest text-foreground/40 hover:text-primary hover:bg-primary/5 transition-all text-left"
                              >
                                <Pencil size={14} /> Edit Project
                              </button>
                              <button
                                onClick={e => handleDelete(p._id, e)}
                                className="w-full flex items-center gap-3 px-5 py-4 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all text-left border-t border-divider"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="space-y-2 mb-6 relative z-10">
                       <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Progress</span>
                          <span className="text-[10px] font-black text-foreground/60 tabular-nums">{progress}%</span>
                       </div>
                       <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${progress}%`,
                              background: p.color || 'var(--primary)',
                              boxShadow: `0 0 10px ${p.color}40`
                            }}
                          />
                       </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-5 border-t border-divider mt-auto relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-muted-foreground/40">
                          <ListTodo size={13} strokeWidth={2.5} />
                          <span className="text-[10px] font-bold">
                            {p.totalTasks > 0 ? `${p.completedTasks}/${p.totalTasks}` : '0/0'}
                          </span>
                        </div>
                        {p.updatedAt && (
                          <div className="flex items-center gap-1.5 text-muted-foreground/30 border-l border-divider pl-3 ml-1">
                            <Calendar size={12} />
                            <span className="text-[9px] font-bold uppercase tracking-tight">
                               {new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center">
                        {memberCount > 0 ? (
                          <div className="flex -space-x-2.5 hover:space-x-0.5 transition-all">
                            {(p.members || []).slice(0, 3).map((m: any, i: number) => {
                              const initials = m.firstName && m.lastName 
                                ? `${m.firstName[0]}${m.lastName[0]}`.toUpperCase()
                                : (m.firstName || m.email)[0].toUpperCase();
                              return (
                                <div
                                  key={m._id || i}
                                  className="w-7 h-7 rounded-xl border-2 border-background bg-muted flex items-center justify-center text-[9px] font-black text-foreground overflow-hidden shadow-xl"
                                  title={m.email}
                                >
                                  {initials}
                                </div>
                              );
                            })}
                            {memberCount > 3 && (
                              <div className="w-7 h-7 rounded-xl border-2 border-background bg-muted/50 flex items-center justify-center text-[9px] font-black text-muted-foreground/40 shadow-xl">
                                +{memberCount - 3}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-widest">Unassigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filtered.length > 0 && (
            <p className="text-center text-[11px] text-muted-foreground/40 font-medium pb-4">
              Showing {filtered.length} of {projects.length} projects
            </p>
          )}
        </>
      )}

      <CreateProjectDrawer
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchProjects(true)}
      />
      <EditProjectDrawer
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => fetchProjects(true)}
        project={selectedProject}
      />
    </div>
  );
}
