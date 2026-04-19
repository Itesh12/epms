'use client';

import { useState, useMemo } from 'react';
import { 
  Shield, Trash2, Mail, Search, ChevronUp, ChevronDown, 
  Users, Briefcase, Building2, Loader2, UserCheck, UserX
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CustomSelect } from '@/components/ui/CustomSelect';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

interface Employee {
  _id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  employeeId: string;
  firstName?: string;
  lastName?: string;
  designation?: string;
  department?: string;
  workLocation?: string;
  employmentType?: string;
}

interface EmployeeTableProps {
  employees: Employee[];
  onUpdate: () => void;
  onRowClick: (id: string) => void;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ADMIN:        { label: 'Admin',    color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20' },
  MANAGER:      { label: 'Manager',  color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
  TEAM_LEADER:  { label: 'Lead',     color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
  EMPLOYEE:     { label: 'Employee', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
};

const AVATAR_COLORS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-indigo-500 to-blue-600',
];

function getAvatarColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function EmployeeTable({ employees, onUpdate, onRowClick }: EmployeeTableProps) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'name' | 'role' | 'department' | 'joined'>('joined');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterRole, setFilterRole] = useState('ALL');

  const handleRoleChange = async (id: string, newRole: string) => {
    setIsUpdating(id);
    try {
      await api.patch(`/users/${id}`, { role: newRole });
      toast.success('Role updated successfully');
      onUpdate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Remove ${name} from the organization? This action cannot be undone.`)) return;
    setIsUpdating(id);
    try {
      await api.delete(`/users/${id}`);
      toast.success('Employee removed successfully');
      onUpdate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove employee');
    } finally {
      setIsUpdating(null);
    }
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let list = [...employees];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.designation?.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q) ||
        e.employeeId?.toLowerCase().includes(q)
      );
    }
    if (filterRole !== 'ALL') list = list.filter(e => e.role === filterRole);
    list.sort((a, b) => {
      let va = '', vb = '';
      if (sortField === 'name') { va = `${a.firstName}${a.lastName}`; vb = `${b.firstName}${b.lastName}`; }
      else if (sortField === 'role') { va = a.role; vb = b.role; }
      else if (sortField === 'department') { va = a.department || ''; vb = b.department || ''; }
      else { va = a.createdAt; vb = b.createdAt; }
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return list;
  }, [employees, search, filterRole, sortField, sortDir]);

  const SortIcon = ({ field }: { field: typeof sortField }) => (
    <span className="inline-flex flex-col ml-1 opacity-40">
      <ChevronUp size={10} className={cn(sortField === field && sortDir === 'asc' && 'opacity-100 text-primary')} />
      <ChevronDown size={10} className={cn(sortField === field && sortDir === 'desc' && 'opacity-100 text-primary')} />
    </span>
  );

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.isActive).length,
    admins: employees.filter(e => e.role === 'ADMIN').length,
    departments: new Set(employees.map(e => e.department).filter(Boolean)).size,
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Employees', value: stats.total, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Active', value: stats.active, icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Administrators', value: stats.admins, icon: Shield, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Departments', value: stats.departments, icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-divider rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
            <div className={cn('p-1.5 rounded-xl', stat.bg)}>
              <stat.icon size={16} className={stat.color} />
            </div>
            <div>
              <div className="text-xl font-black text-foreground tabular-nums leading-none">{stat.value}</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1 opacity-80">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
          <input
            type="text" 
            placeholder="Search by name, email, role, department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-muted/50 border border-divider rounded-xl h-9 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground/30 outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium"
          />
        </div>
        <CustomSelect
          value={filterRole}
          onChange={setFilterRole}
          options={[
            { value: 'ALL', label: 'All Roles' },
            { value: 'ADMIN', label: 'Admin', color: 'text-emerald-400' },
            { value: 'MANAGER', label: 'Manager', color: 'text-blue-400' },
            { value: 'TEAM_LEADER', label: 'Team Lead', color: 'text-purple-400' },
            { value: 'EMPLOYEE', label: 'Employee', color: 'text-slate-400' }
          ]}
          className="bg-card border border-divider rounded-xl h-9 px-4 text-[10px] font-black text-foreground/70 uppercase tracking-widest min-w-[140px] hover:bg-muted shadow-sm transition-all"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-card border border-divider rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-divider bg-muted/30">
                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">
                  ID
                </th>
                <th
                  className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => toggleSort('name')}
                >
                  Employee <SortIcon field="name" />
                </th>
                <th
                  className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => toggleSort('department')}
                >
                  Department <SortIcon field="department" />
                </th>
                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">
                  Status
                </th>
                <th
                  className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => toggleSort('role')}
                >
                  Role <SortIcon field="role" />
                </th>
                <th
                  className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 cursor-pointer hover:text-primary transition-colors text-right w-32"
                  onClick={() => toggleSort('joined')}
                >
                  Joined <SortIcon field="joined" />
                </th>
                {isAdmin && <th className="px-5 py-3 w-10" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-40">
                      <Users size={36} className="text-muted-foreground" />
                      <p className="text-sm font-bold text-muted-foreground">No employees found</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((emp) => {
                const role = ROLE_CONFIG[emp.role] || ROLE_CONFIG.EMPLOYEE;
                const name = emp.firstName ? `${emp.firstName} ${emp.lastName || ''}`.trim() : emp.email.split('@')[0];
                const initial = (emp.firstName || emp.email)[0].toUpperCase();
                const avatarGrad = getAvatarColor(emp._id);
                return (
                    <tr
                      key={emp._id}
                      className={cn(
                        'group transition-all duration-200 hover:bg-muted/30 cursor-pointer',
                        isUpdating === emp._id && 'opacity-40 pointer-events-none'
                      )}
                      onClick={() => onRowClick(emp._id)}
                    >
                      <td className="px-5 py-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <span className="text-[10px] font-mono font-bold text-primary/60 bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/10">
                          {emp.employeeId || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-xs font-black text-white shadow-lg flex-shrink-0', avatarGrad)}>
                            {initial}
                          </div>
                        <div>
                          <div className="font-bold text-[13px] text-foreground leading-tight flex items-center gap-1.5">
                            {name}
                            {emp._id === user?.id && (
                              <span className="text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-black uppercase tracking-wider">You</span>
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground/40 flex items-center gap-1 mt-0.5">
                            {emp.designation ? (
                              <><Briefcase size={9} />{emp.designation}</>
                            ) : (
                              <><Mail size={9} />{emp.email}</>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      {emp.department ? (
                        <div className="flex items-center gap-2">
                           <Building2 size={12} className="text-muted-foreground/40" />
                           <span className="text-[11px] font-bold text-foreground/60">{emp.department}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/30">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      {emp.isActive ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/10">
                          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/10">
                          <span className="w-1 h-1 rounded-full bg-red-500" />
                          <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Inactive</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      {isAdmin ? (
                        <CustomSelect
                          value={emp.role}
                          onChange={(v) => handleRoleChange(emp._id, v)}
                          options={[
                            { value: 'EMPLOYEE', label: 'EMPLOYEE' },
                            { value: 'TEAM_LEADER', label: 'TEAM LEAD' },
                            { value: 'MANAGER', label: 'MANAGER' },
                            { value: 'ADMIN', label: 'ADMIN' }
                          ]}
                          className={cn('text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border outline-none cursor-pointer transition-all min-w-[100px]', role.bg, role.color)}
                          dropdownClassName="text-[9px] w-32 tracking-widest font-black uppercase"
                        />
                      ) : (
                        <span className={cn('inline-flex items-center text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border', role.bg, role.color)}>
                          {role.label}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-right w-32" onClick={e => e.stopPropagation()}>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[11px] font-bold text-foreground/40 tabular-nums">
                          {new Date(emp.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                        </span>
                        {isAdmin && emp._id !== user?.id && (
                          <button
                            onClick={() => handleDelete(emp._id, name)}
                            className="p-1 text-muted-foreground/30 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Remove employee"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-divider flex items-center justify-between bg-muted/5">
          <span className="text-[11px] text-muted-foreground/50 font-black uppercase tracking-widest">
            Showing {filtered.length} of {employees.length} employees
          </span>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 opacity-40">
            <Users size={36} className="text-muted-foreground" />
            <p className="text-sm font-bold text-muted-foreground">No employees found</p>
          </div>
        ) : filtered.map((emp) => {
          const role = ROLE_CONFIG[emp.role] || ROLE_CONFIG.EMPLOYEE;
          const name = emp.firstName ? `${emp.firstName} ${emp.lastName || ''}`.trim() : emp.email.split('@')[0];
          const initial = (emp.firstName || emp.email)[0].toUpperCase();
          const avatarGrad = getAvatarColor(emp._id);
          return (
              <div
              key={emp._id}
              className={cn(
                'bg-card border border-divider rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-muted transition-all active:scale-[0.99] shadow-sm',
                isUpdating === emp._id && 'opacity-40 pointer-events-none'
              )}
            >
              {/* Clickable area */}
              <div className="flex items-center gap-4 flex-1 min-w-0" onClick={() => onRowClick(emp._id)}>
                <div className={cn('w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-sm font-black text-white shadow-lg flex-shrink-0', avatarGrad)}>
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-foreground truncate">{name}</span>
                    {emp._id === user?.id && (
                      <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-black uppercase tracking-wider">You</span>
                    )}
                    <span className={cn('text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border shadow-sm', role.bg, role.color)}>
                      {role.label}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground/60 mt-0.5 truncate">
                    {emp.designation || emp.email}
                  </div>
                  {emp.department && (
                    <div className="text-[10px] text-muted-foreground/40 mt-0.5 flex items-center gap-1">
                      <Building2 size={9} />{emp.department}
                    </div>
                  )}
                </div>
              </div>

              {/* Right side actions */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                {emp.isActive ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                )}
                {isAdmin && emp._id !== user?.id && (
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(emp._id, name); }}
                    className="p-1.5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Remove employee"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div className="text-center py-2">
          <span className="text-[11px] text-muted-foreground/40 font-medium">
            {filtered.length} of {employees.length} employees
          </span>
        </div>
      </div>
    </div>
  );
}
