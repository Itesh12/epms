'use client';

import { useEffect, useState, use } from 'react';
import { 
  Plus, Loader2, Kanban, List, BarChart3, ArrowLeft, 
  Users, Target, CheckCircle2, Clock, CircleDot, 
  TrendingUp, ListTodo, GitBranch
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { EditProjectDrawer } from '@/components/projects/EditProjectDrawer';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:      { label: 'Active',      color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  COMPLETED:   { label: 'Completed',   color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
  ON_HOLD:     { label: 'On Hold',     color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
  TODO:        { label: 'Not Started', color: 'text-slate-400',   bg: 'bg-slate-500/10 border-slate-500/20' },
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
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
          <Target size={32} className="text-muted-foreground/30" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tight">Project Not Found</h2>
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
      <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground/50 uppercase tracking-widest">
        <Link href="/projects" className="hover:text-primary transition-colors flex items-center gap-1.5">
          <ArrowLeft size={12} /> Projects
        </Link>
        <span>/</span>
        <span className="text-white/60">{project.title}</span>
      </div>

      {/* Project Header */}
      <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
        {/* Gradient Banner */}
        <div
          className="h-16 sm:h-20 w-full"
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
                className="w-16 h-16 rounded-2xl border-2 bg-background flex items-center justify-center flex-shrink-0 shadow-xl"
                style={project.color ? { borderColor: `${project.color}60`, background: `${project.color}15` } : { borderColor: 'rgba(255,255,255,0.1)' }}
              >
                <Target size={28} className="text-primary" style={project.color ? { color: project.color } : {}} />
              </div>
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{project.title}</h1>
                  <span className={cn('text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest', status.bg, status.color)}>
                    {status.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground/60 font-medium max-w-xl">
                  {project.description || 'No description provided.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditProjectModalOpen(true)}
                  className="rounded-xl h-10 px-4 text-sm font-bold border-white/10 hover:bg-white/5 bg-transparent"
                >
                  Edit Project
                </Button>
              )}
              <Button
                onClick={() => setIsTaskModalOpen(true)}
                className="rounded-xl h-10 px-5 text-sm font-bold"
                style={project.color ? { background: project.color } : {}}
              >
                <Plus size={16} className="mr-2" /> Add Task
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Total Tasks',  value: totalTasks,       icon: ListTodo,     color: 'text-primary',     bg: 'bg-primary/10' },
              { label: 'To Do',        value: todoTasks,        icon: CircleDot,    color: 'text-slate-400',   bg: 'bg-slate-500/10' },
              { label: 'In Progress',  value: inProgressTasks,  icon: Clock,        color: 'text-blue-400',    bg: 'bg-blue-500/10' },
              { label: 'Completed',    value: doneTasks,        icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', s.bg)}>
                  <s.icon size={15} className={s.color} />
                </div>
                <div>
                  <div className="text-lg font-black text-white">{s.value}</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">Overall Progress</span>
              <span className="text-[11px] font-black text-white/80" style={project.color ? { color: project.color } : {}}>{progress}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, background: project.color || 'var(--primary)' }}
              />
            </div>
          </div>

          {/* Members Row */}
          {(project.members?.length || 0) > 0 && (
            <div className="mt-5 flex items-center gap-3">
              <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                <Users size={12} /> Team
              </div>
              <div className="flex -space-x-2">
                {(project.members || []).map((m: any, i: number) => (
                  <div
                    key={m._id || i}
                    className="w-7 h-7 rounded-lg border-2 border-background bg-primary/20 flex items-center justify-center text-[10px] font-black text-white overflow-hidden"
                    title={m.email}
                  >
                    {m.email?.[0]?.toUpperCase()}
                  </div>
                ))}
              </div>
              <span className="text-[11px] text-muted-foreground/40 font-medium">
                {project.members.length} member{project.members.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-1 bg-white/5 border border-white/5 p-1 rounded-xl w-fit">
        {[
          { id: 'board',     label: 'Board',     icon: Kanban },
          { id: 'list',      label: 'List',       icon: List },
          { id: 'analytics', label: 'Analytics',  icon: BarChart3 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200',
              activeView === tab.id
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:text-white hover:bg-white/5'
            )}
          >
            <tab.icon size={14} strokeWidth={2.5} />
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
          <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                <List size={32} className="text-muted-foreground" />
                <p className="text-sm font-bold text-muted-foreground">No tasks yet. Add one using the button above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      {['Task', 'Status', 'Priority', 'Assignee', 'Due Date', 'Est. Hours'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {topLevelTasks.map((task: any) => {
                      const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
                      const taskSubtasks = tasks.filter((t: any) => t.parentId === task._id);
                      const subtaskCount = taskSubtasks.length;
                      const totalEst = (task.estimatedHours || 0) + taskSubtasks.reduce((s, t: any) => s + (t.estimatedHours || 0), 0);
                      
                      return (
                        <tr key={task._id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-start gap-2">
                              {subtaskCount > 0 && <GitBranch size={13} className="text-primary/50 flex-shrink-0 mt-0.5" />}
                              <div>
                                <div className="text-sm font-bold text-white">{task.title}</div>
                                {subtaskCount > 0 && (
                                  <div className="text-[10px] text-muted-foreground/40 mt-0.5">{subtaskCount} subtask{subtaskCount !== 1 ? 's' : ''}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={cn('text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest', statusColors[task.status] || statusColors.TODO)}>
                              {task.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={cn('text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest', priorityColors[task.priority] || priorityColors.MEDIUM)}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {task.assigneeId ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center text-[10px] font-black text-white">
                                  {task.assigneeId.email?.[0]?.toUpperCase() || '?'}
                                </div>
                                <span className="text-xs text-muted-foreground/60 truncate max-w-[120px]">{task.assigneeId.email || '—'}</span>
                              </div>
                            ) : <span className="text-muted-foreground/30 text-xs">Unassigned</span>}
                          </td>
                          <td className="px-5 py-4">
                            {task.dueDate ? (
                              <span className={cn('text-xs font-semibold', isOverdue ? 'text-red-400' : 'text-muted-foreground/60')}>
                                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            ) : <span className="text-muted-foreground/30 text-xs">—</span>}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white">{totalEst}h</span>
                              {task.estimatedHours !== totalEst && (
                                <span className="text-[10px] text-muted-foreground/40 font-medium" title="Includes subtask hours">(Total)</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="px-5 py-3 border-t border-white/5">
                  <span className="text-[11px] text-muted-foreground/40 font-medium">{tasks.length} task{tasks.length !== 1 ? 's' : ''} total</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS VIEW */}
        {activeView === 'analytics' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Status Distribution */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-5">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 size={14} className="text-primary" /> Task Status
              </h3>
              {totalTasks === 0 ? (
                <p className="text-sm text-muted-foreground/40 font-medium py-4">No tasks yet</p>
              ) : (
                [
                  { label: 'To Do',       value: todoTasks,       color: 'bg-slate-400',   text: 'text-slate-400' },
                  { label: 'In Progress', value: inProgressTasks, color: 'bg-blue-400',    text: 'text-blue-400' },
                  { label: 'Done',        value: doneTasks,       color: 'bg-emerald-400', text: 'text-emerald-400' },
                ].map(row => (
                  <div key={row.label} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground/70">{row.label}</span>
                      <span className={cn('text-xs font-black', row.text)}>
                        {row.value} ({Math.round((row.value / totalTasks) * 100)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all', row.color)}
                        style={{ width: `${(row.value / totalTasks) * 100}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Priority Distribution */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-5">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={14} className="text-primary" /> Priority Breakdown
              </h3>
              {totalTasks === 0 ? (
                <p className="text-sm text-muted-foreground/40 font-medium py-4">No tasks yet</p>
              ) : (
                [
                  { label: 'Urgent', value: byPriority.URGENT, color: 'bg-red-400',    text: 'text-red-400' },
                  { label: 'High',   value: byPriority.HIGH,   color: 'bg-orange-400', text: 'text-orange-400' },
                  { label: 'Medium', value: byPriority.MEDIUM, color: 'bg-amber-400',  text: 'text-amber-400' },
                  { label: 'Low',    value: byPriority.LOW,    color: 'bg-slate-400',  text: 'text-slate-400' },
                ].map(row => (
                  <div key={row.label} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground/70">{row.label}</span>
                      <span className={cn('text-xs font-black', row.text)}>
                        {row.value} ({totalTasks ? Math.round((row.value / totalTasks) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
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
              { label: 'Completed',     value: doneTasks,    icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Overdue',       value: overdueTasks, icon: Clock,        color: 'text-red-400',     bg: 'bg-red-500/10' },
              { label: 'With Subtasks', value: withSubtasks, icon: GitBranch,    color: 'text-blue-400',    bg: 'bg-blue-500/10' },
            ] as const).map(s => (
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
        )}
      </div>

      <CreateTaskModal
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
