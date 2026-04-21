'use client';

import { useEffect, useState, use } from 'react';
import { 
  Plus, Loader2, Kanban, List, BarChart3, ArrowLeft, 
  Users, Target, CheckCircle2, Clock, CircleDot, 
  TrendingUp, ListTodo, GitBranch
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { CreateTaskDrawer } from '@/components/tasks/CreateTaskDrawer';
import { EditProjectDrawer } from '@/components/projects/EditProjectDrawer';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:      { label: 'Active',      color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  COMPLETED:   { label: 'Completed',   color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
  ON_HOLD:     { label: 'On Hold',     color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
  TODO:        { label: 'Not Started', color: 'text-slate-600 dark:text-slate-400',   bg: 'bg-slate-500/10 border-slate-500/20' },
};

export default function ProjectWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'board' | 'list' | 'analytics'>('board');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks?projectId=${id}`);
      setTasks(res.data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    }
  };

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (error) {
      console.error('Failed to fetch project', error);
    }
  };

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        await fetchProject();
        await fetchTasks();
      } catch (error) {
        console.error('Failed to fetch project data', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
          <span className="text-sm text-muted-foreground font-medium">Loading project...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-6 min-h-[60vh]">
        <div className="w-16 h-16 rounded-2xl bg-muted border border-divider flex items-center justify-center">
          <Target size={32} className="text-muted-foreground/30" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-foreground tracking-tight">Project Not Found</h2>
          <p className="text-muted-foreground text-sm">This project doesn't exist or you don't have access.</p>
        </div>
        <Link href="/projects">
          <Button variant="outline" size="lg" className="rounded-xl">
            <ArrowLeft className="mr-2" size={16} /> Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  const status = STATUS_CONFIG[project.status] || STATUS_CONFIG.TODO;
  const progress = Math.round(project.progress || 0);

  // Filter only top-level tasks for main views, but keep allTasks for subtask counting
  const topLevelTasks = tasks.filter(t => !t.parentId);

  const todoTasks = topLevelTasks.filter(t => t.status === 'TODO').length;
  const inProgressTasks = topLevelTasks.filter(t => t.status === 'IN_PROGRESS').length;
  const doneTasks = topLevelTasks.filter(t => t.status === 'DONE').length;

  // Analytics computations
  const totalTasks = topLevelTasks.length;
  const byPriority = {
    URGENT: topLevelTasks.filter(t => t.priority === 'URGENT').length,
    HIGH:   topLevelTasks.filter(t => t.priority === 'HIGH').length,
    MEDIUM: topLevelTasks.filter(t => t.priority === 'MEDIUM').length,
    LOW:    topLevelTasks.filter(t => t.priority === 'LOW').length,
  };
  const overdueTasks = topLevelTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE').length;
  const withSubtasks = topLevelTasks.filter(t => tasks.some(s => s.parentId === t._id)).length;

  const statusColors: Record<string, string> = {
    TODO:        'text-slate-400 bg-slate-500/10 border-slate-500/20',
    IN_PROGRESS: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    DONE:        'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  };
  const priorityColors: Record<string, string> = {
    LOW:    'text-slate-400 bg-slate-500/10 border-slate-500/20',
    MEDIUM: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    HIGH:   'text-orange-400 bg-orange-500/10 border-orange-500/20',
    URGENT: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1500px] w-full h-full flex flex-col">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest">
        <Link href="/projects" className="hover:text-primary transition-colors flex items-center gap-1.5">
          <ArrowLeft size={12} /> Projects
        </Link>
        <span>/</span>
        <span className="text-foreground/80">{project.title}</span>
      </div>

      {/* Project Header */}
      <div className="bg-card border border-divider rounded-2xl overflow-hidden shadow-sm">
        {/* Gradient Banner */}
        <div
          className="h-14 sm:h-16 w-full"
          style={{
            background: project.color
              ? `linear-gradient(135deg, ${project.color}40, ${project.color}10)`
              : 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(99,102,241,0.05))',
          }}
        />

        <div className="px-6 sm:px-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 -mt-8">
            <div className="flex items-end gap-5">
              <div
                className="w-12 h-12 rounded-xl border-2 bg-background flex items-center justify-center flex-shrink-0 shadow-xl"
                style={project.color ? { borderColor: `${project.color}60`, background: `${project.color}15` } : { borderColor: 'rgba(255,255,255,0.1)' }}
              >
                <Target size={24} className="text-primary" style={project.color ? { color: project.color } : {}} />
              </div>
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight">{project.title}</h1>
                  <span className={cn('text-[9px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-widest', status.bg, status.color)}>
                    {status.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-medium max-w-xl">
                  {project.description || 'No description provided.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditProjectModalOpen(true)}
                  className="rounded-xl h-9 px-3.5 text-xs font-bold border-white/10 hover:bg-white/5 bg-transparent"
                >
                  Edit Project
                </Button>
              )}
              <Button
                onClick={() => setIsTaskModalOpen(true)}
                className="rounded-xl h-9 px-4 text-xs font-bold"
                style={project.color ? { background: project.color } : {}}
              >
                <Plus size={14} className="mr-2" /> Add Task
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5">
            {[
              { label: 'Total Tasks',  value: totalTasks,       icon: ListTodo,     color: 'text-primary',     bg: 'bg-primary/10' },
              { label: 'To Do',        value: todoTasks,        icon: CircleDot,    color: 'text-slate-500',   bg: 'bg-slate-500/10' },
              { label: 'In Progress',  value: inProgressTasks,  icon: Clock,        color: 'text-blue-500',    bg: 'bg-blue-500/10' },
              { label: 'Completed',    value: doneTasks,        icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            ].map(s => (
              <div key={s.label} className="bg-muted/40 border border-divider rounded-xl p-3.5 flex items-center gap-3">
                <div className={cn('p-1.5 rounded-lg', s.bg)}>
                  <s.icon size={14} className={s.color} />
                </div>
                <div>
                  <div className="text-base font-black text-foreground leading-tight">{s.value}</div>
                  <div className="text-[9px] font-bold text-muted-foreground/80 uppercase tracking-widest leading-none mt-0.5">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.1em]">Overall Progress</span>
              <span className="text-[10px] font-black text-foreground" style={project.color ? { color: project.color } : {}}>{progress}%</span>
            </div>
            <div className="h-1.5 bg-muted border border-divider rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, background: project.color || 'var(--primary)' }}
              />
            </div>
          </div>

          {/* Members Row */}
          {(project.members?.length || 0) > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-none">
                <Users size={11} /> Team
              </div>
              <div className="flex -space-x-2">
                {(project.members || []).map((m: any, i: number) => (
                  <div
                    key={m._id || i}
                    className="w-6 h-6 rounded-lg border-2 border-background bg-primary/20 flex items-center justify-center text-[9px] font-black text-white overflow-hidden"
                    title={m.email}
                  >
                    {m.email?.[0]?.toUpperCase()}
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground/40 font-medium">
                {project.members.length} member{project.members.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-1 bg-muted border border-divider p-1 rounded-lg w-fit shadow-sm">
        {[
          { id: 'board',     label: 'Board',     icon: Kanban },
          { id: 'list',      label: 'List',       icon: List },
          { id: 'analytics', label: 'Analytics',  icon: BarChart3 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all duration-200',
              activeView === tab.id
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-background'
            )}
          >
            <tab.icon size={13} strokeWidth={2.5} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Workspace */}
      <div className="flex-1 overflow-hidden min-h-[500px]">

        {/* BOARD VIEW */}
        {activeView === 'board' && (
          <div className="h-full overflow-x-auto pb-6">
            <TaskBoard initialTasks={topLevelTasks} allTasks={tasks} projectMembers={project.members} onTaskUpdate={fetchTasks} />
          </div>
        )}

        {/* LIST VIEW */}
        {activeView === 'list' && (
          <div className="bg-card border border-divider rounded-2xl overflow-hidden shadow-sm">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                <List size={32} className="text-muted-foreground" />
                <p className="text-sm font-bold text-muted-foreground">No tasks yet. Add one using the button above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-divider bg-muted/30">
                      {['Task', 'Status', 'Priority', 'Assignee', 'Due Date', 'Est. Hours'].map(h => (
                        <th key={h} className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-divider font-medium">
                    {topLevelTasks.map((task: any) => {
                      const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
                      const taskSubtasks = tasks.filter((t: any) => t.parentId === task._id);
                      const subtaskCount = taskSubtasks.length;
                      const totalEst = (task.estimatedHours || 0) + taskSubtasks.reduce((s, t: any) => s + (t.estimatedHours || 0), 0);
                      
                      return (
                        <tr key={task._id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-start gap-2">
                              {subtaskCount > 0 && <GitBranch size={12} className="text-primary/50 flex-shrink-0 mt-0.5" />}
                              <div>
                                <div className="text-xs font-bold text-foreground leading-tight">{task.title}</div>
                                {subtaskCount > 0 && (
                                  <div className="text-[9px] text-muted-foreground/60 mt-0.5">{subtaskCount} subtask{subtaskCount !== 1 ? 's' : ''}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn('text-[9px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-widest', statusColors[task.status] || statusColors.TODO)}>
                              {task.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn('text-[9px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-widest', priorityColors[task.priority] || priorityColors.MEDIUM)}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {task.assigneeId ? (
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-lg bg-primary/20 flex items-center justify-center text-[9px] font-black text-white">
                                  {task.assigneeId.email?.[0]?.toUpperCase() || '?'}
                                </div>
                                <span className="text-[11px] text-muted-foreground/60 truncate max-w-[100px] font-medium">{task.assigneeId.email || '—'}</span>
                              </div>
                            ) : <span className="text-muted-foreground/30 text-[11px]">Unassigned</span>}
                          </td>
                          <td className="px-4 py-3">
                            {task.dueDate ? (
                              <span className={cn('text-[11px] font-bold', isOverdue ? 'text-red-500' : 'text-muted-foreground/60')}>
                                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            ) : <span className="text-muted-foreground/30 text-[11px]">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-foreground">{totalEst}h</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="px-5 py-3 border-t border-divider bg-muted/10">
                  <span className="text-[11px] text-muted-foreground/60 font-medium">{tasks.length} task{tasks.length !== 1 ? 's' : ''} total</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS VIEW */}
        {activeView === 'analytics' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Status Distribution */}
            <div className="bg-card border border-divider shadow-sm rounded-2xl p-6 space-y-4">
              <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 size={13} className="text-primary" /> Task Status
              </h3>
              {totalTasks === 0 ? (
                <p className="text-xs text-muted-foreground/40 font-medium py-3">No tasks yet</p>
              ) : (
                [
                  { label: 'To Do',       value: todoTasks,       color: 'bg-slate-500',   text: 'text-slate-500' },
                  { label: 'In Progress', value: inProgressTasks, color: 'bg-blue-500',    text: 'text-blue-500' },
                  { label: 'Done',        value: doneTasks,       color: 'bg-emerald-500', text: 'text-emerald-500' },
                ].map(row => (
                  <div key={row.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-muted-foreground/80">{row.label}</span>
                      <span className={cn('text-[11px] font-black', row.text)}>
                        {row.value} ({Math.round((row.value / totalTasks) * 100)}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden border border-divider">
                      <div className={cn('h-full rounded-full transition-all', row.color)}
                        style={{ width: `${(row.value / totalTasks) * 100}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Priority Distribution */}
            <div className="bg-card border border-divider shadow-sm rounded-2xl p-6 space-y-4">
              <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={13} className="text-primary" /> Priority Breakdown
              </h3>
              {totalTasks === 0 ? (
                <p className="text-xs text-muted-foreground/40 font-medium py-3">No tasks yet</p>
              ) : (
                [
                  { label: 'Urgent', value: byPriority.URGENT, color: 'bg-red-500',    text: 'text-red-500' },
                  { label: 'High',   value: byPriority.HIGH,   color: 'bg-orange-500', text: 'text-orange-500' },
                  { label: 'Medium', value: byPriority.MEDIUM, color: 'bg-amber-500',  text: 'text-amber-500' },
                  { label: 'Low',    value: byPriority.LOW,    color: 'bg-slate-500',  text: 'text-slate-500' },
                ].map(row => (
                  <div key={row.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-muted-foreground/80">{row.label}</span>
                      <span className={cn('text-[11px] font-black', row.text)}>
                        {row.value} ({totalTasks ? Math.round((row.value / totalTasks) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden border border-divider">
                      <div className={cn('h-full rounded-full transition-all', row.color)}
                        style={{ width: `${totalTasks ? (row.value / totalTasks) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Summary Cards */}
            {([
              { label: 'Total Tasks',   value: totalTasks,   icon: ListTodo,     color: 'text-primary',     bg: 'bg-primary/10' },
              { label: 'Completed',     value: doneTasks,    icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { label: 'Overdue',       value: overdueTasks, icon: Clock,        color: 'text-red-500',     bg: 'bg-red-500/10' },
              { label: 'With Subtasks', value: withSubtasks, icon: GitBranch,    color: 'text-blue-500',    bg: 'bg-blue-500/10' },
            ] as const).map(s => (
              <div key={s.label} className="bg-card border border-divider shadow-sm rounded-2xl p-5 flex items-center gap-4">
                <div className={cn('p-2.5 rounded-xl', s.bg)}>
                  <s.icon size={18} className={s.color} />
                </div>
                <div>
                  <div className="text-xl font-black text-foreground tabular-nums tracking-tight">{s.value}</div>
                  <div className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest leading-none mt-1">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateTaskDrawer
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSuccess={fetchTasks}
        projectId={id}
      />
      {project && isAdmin && (
        <EditProjectDrawer
          isOpen={isEditProjectModalOpen}
          onClose={() => setIsEditProjectModalOpen(false)}
          project={project}
          onSuccess={() => {
            fetchProject();
            setIsEditProjectModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
