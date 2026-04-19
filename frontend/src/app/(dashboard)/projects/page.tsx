'use client';

import { useEffect, useState } from 'react';
import { 
  Plus, Loader2, Briefcase, RefreshCw, ListTodo, Users, 
  CheckCircle2, Clock, CircleDot, MoreVertical, Pencil, Trash2,
  TrendingUp, Search
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { EditProjectModal } from '@/components/projects/EditProjectModal';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; dot: string }> = {
  TODO:        { label: 'Not Started', icon: CircleDot,    color: 'text-slate-400',   bg: 'bg-slate-500/10 border-slate-500/20',   dot: 'bg-slate-400' },
  IN_PROGRESS: { label: 'In Progress', icon: Clock,        color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',     dot: 'bg-blue-400 animate-pulse' },
  DONE:        { label: 'Completed',   icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
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
    const handler = () => setOpenMenu(null);
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
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Project Portfolio
          </h1>
          <p className="text-muted-foreground text-sm font-medium max-w-md leading-relaxed">
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
              <div key={s.label} className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                <div className={cn('p-2.5 rounded-xl', s.bg)}>
                  <s.icon size={18} className={s.color} />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{s.value}</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl h-10 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl h-10 px-4 text-xs font-bold text-white uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/50 min-w-[160px]"
            >
              <option value="ALL">All Status</option>
              <option value="TODO">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Completed</option>
            </select>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((p) => {
                const styleIdx = getProjectStyle(p._id);
                const status = STATUS_CONFIG[p.status] || STATUS_CONFIG.TODO;
                const StatusIcon = status.icon;
                const progress = Math.round(p.progress || 0);
                const memberCount = p.members?.length || 0;
                const isMenuOpen = openMenu === p._id;

                return (
                  <div
                    key={p._id}
                    onClick={() => router.push(`/projects/${p._id}`)}
                    className={cn(
                      'group relative bg-white/5 border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:bg-white/[0.08] hover:scale-[1.01] hover:shadow-xl hover:shadow-black/20 flex flex-col',
                      PROJECT_ACCENT[styleIdx]
                    )}
                  >
                    {/* Gradient Header */}
                    <div className={cn(
                      'h-24 bg-gradient-to-br relative flex items-end p-5',
                      PROJECT_GRADIENTS[styleIdx]
                    )}
                      style={p.color ? { background: `linear-gradient(135deg, ${p.color}30, ${p.color}10)` } : {}}
                    >
                      {/* Status Badge */}
                      <span className={cn(
                        'absolute top-4 left-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border',
                        status.bg, status.color
                      )}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                        {status.label}
                      </span>

                      {/* Actions menu */}
                      {isAdmin && (
                        <div className="absolute top-3 right-3" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={e => { e.stopPropagation(); setOpenMenu(isMenuOpen ? null : p._id); }}
                            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white/60 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                          >
                            <MoreVertical size={14} />
                          </button>
                          {isMenuOpen && (
                            <div className="absolute right-0 top-8 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden min-w-[140px]">
                              <button
                                onClick={e => handleEditClick(p, e)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-white/70 hover:text-white hover:bg-white/5 transition-all"
                              >
                                <Pencil size={13} /> Edit Project
                              </button>
                              <button
                                onClick={e => handleDelete(p._id, e)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Project icon */}
                      <div
                        className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center"
                        style={p.color ? { borderColor: `${p.color}50`, background: `${p.color}20` } : {}}
                      >
                        <Briefcase size={18} className="text-white/80" style={p.color ? { color: p.color } : {}} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col gap-4">
                      <div>
                        <h3 className="font-black text-base text-white tracking-tight line-clamp-1">{p.title}</h3>
                        <p className="text-xs text-muted-foreground/60 mt-1 line-clamp-2 leading-relaxed font-medium">
                          {p.description || 'No description provided.'}
                        </p>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">Progress</span>
                          <span className="text-[11px] font-black text-white/80" style={p.color ? { color: p.color } : {}}>{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${progress}%`,
                              background: p.color || 'var(--primary)',
                            }}
                          />
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
                        <div className="flex items-center gap-1.5 text-muted-foreground/50">
                          <ListTodo size={13} />
                          <span className="text-[11px] font-bold">
                            {p.totalTasks > 0 ? `${p.completedTasks}/${p.totalTasks} tasks` : 'No tasks yet'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {memberCount > 0 ? (
                            <>
                              <div className="flex -space-x-2">
                                {(p.members || []).slice(0, 3).map((m: any, i: number) => (
                                  <div
                                    key={i}
                                    className="w-6 h-6 rounded-lg border-2 border-background bg-primary/20 flex items-center justify-center text-[9px] font-black text-white overflow-hidden"
                                    title={m.email}
                                  >
                                    {m.email?.[0]?.toUpperCase()}
                                  </div>
                                ))}
                              </div>
                              {memberCount > 3 && (
                                <span className="text-[10px] font-black text-muted-foreground/40 ml-1">+{memberCount - 3}</span>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center gap-1 text-muted-foreground/30">
                              <Users size={12} />
                              <span className="text-[10px] font-bold">Unassigned</span>
                            </div>
                          )}
                        </div>
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

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchProjects(true)}
      />
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => fetchProjects(true)}
        project={selectedProject}
      />
    </div>
  );
}
