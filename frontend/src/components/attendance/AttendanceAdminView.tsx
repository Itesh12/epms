'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Edit2,
  Trash2,
  Calendar,
  Plus,
  Loader2,
  XCircle,
  UserMinus,
  UserX,
} from 'lucide-react';
import { format } from 'date-fns';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { EditAttendanceModal } from './EditAttendanceModal';

export function AttendanceAdminView() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [editRecord, setEditRecord] = useState<any | null | undefined>(undefined); // undefined=closed, null=create
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [markingAbsent, setMarkingAbsent] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/attendance/history');
      setHistory(res.data);
    } catch {
      toast.error('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleDelete = async (id: string, empName: string) => {
    if (!confirm(`Remove attendance record for ${empName}? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/attendance/admin/${id}`);
      toast.success('Record deleted');
      // Instant optimistic update + re-fetch
      setHistory(prev => prev.filter(r => r._id !== id));
      fetchHistory();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkAbsent = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (!confirm(`Mark all employees without a check-in record for today (${today}) as ABSENT?`)) return;
    setMarkingAbsent(true);
    try {
      const res = await api.post('/attendance/admin/mark-absent', { date: today });
      const marked = res.data?.marked ?? 0;
      if (marked === 0) toast.success('All employees already have a record for today');
      else toast.success(`${marked} employee(s) marked as Absent`);
      fetchHistory(); // instant refresh
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark absent');
    } finally {
      setMarkingAbsent(false);
    }
  };

  const filteredHistory = history.filter(r => {
    const matchSearch =
      r.userId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.date?.includes(searchTerm);
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusConfig: Record<string, { label: string; Icon: any; colors: string }> = {
    PRESENT:  { label: 'Present',  Icon: CheckCircle2, colors: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    LATE:     { label: 'Late',     Icon: Clock,        colors: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    HALF_DAY: { label: 'Half Day', Icon: AlertTriangle, colors: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    ABSENT:   { label: 'Absent',   Icon: UserX,        colors: 'bg-red-500/10 text-red-500 border-red-500/20' },
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />
          <input
            type="text"
            placeholder="Search name, email or date (YYYY-MM-DD)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-muted/20 border border-divider rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground/30"
          />
        </div>

        <div className="flex gap-3 items-center">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-10 bg-muted/20 border border-divider rounded-xl px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground outline-none focus:ring-1 focus:ring-primary transition-all"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="ABSENT">Absent</option>
          </select>

          <Button
            variant="outline"
            onClick={handleMarkAbsent}
            isLoading={markingAbsent}
            className="h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest gap-2 border-divider text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/30"
          >
            <UserMinus size={14} />
            Mark Absent
          </Button>

          <Button
            onClick={() => setEditRecord(null)}
            className="h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest gap-2 shadow-lg shadow-primary/10"
          >
            <Plus size={14} />
            Manual Entry
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-divider rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/30 border-b border-divider">
              <tr className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Check-in</th>
                <th className="px-6 py-4">Check-out</th>
                <th className="px-6 py-4">Work Hours</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary/40 mx-auto" />
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <XCircle className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">No logs found</p>
                  </td>
                </tr>
              ) : (
                filteredHistory.map(record => {
                  const empName = `${record.userId?.firstName ?? ''} ${record.userId?.lastName ?? ''}`.trim() || 'Unknown';
                  const s = statusConfig[record.status] ?? statusConfig.PRESENT;
                  const { Icon: StatusIcon } = s;

                  return (
                    <tr key={record._id} className="group hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black border border-primary/20 uppercase">
                            {record.userId?.firstName?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">{empName}</p>
                            <p className="text-[9px] text-muted-foreground opacity-60 lowercase">{record.userId?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-foreground/80">
                        {format(new Date(record.date + 'T00:00:00'), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-foreground/70 tabular-nums">
                        {record.checkIn ? format(new Date(record.checkIn), 'HH:mm:ss') : '--:--'}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-foreground/70 tabular-nums">
                        {record.checkOut ? format(new Date(record.checkOut), 'HH:mm:ss') : '--:--'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-black text-foreground tabular-nums">
                          {Math.floor((record.totalWorkMinutes || 0) / 60)}h {(record.totalWorkMinutes || 0) % 60}m
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                          s.colors
                        )}>
                          <StatusIcon size={10} />
                          {s.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditRecord(record)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            title="Edit record"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(record._id, empName)}
                            disabled={deletingId === record._id}
                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-40"
                            title="Delete record"
                          >
                            {deletingId === record._id
                              ? <Loader2 size={14} className="animate-spin" />
                              : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Modal — renders when editRecord !== undefined */}
      {editRecord !== undefined && (
        <EditAttendanceModal
          record={editRecord}
          onClose={() => setEditRecord(undefined)}
          onSaved={fetchHistory}  // instant refresh after save
        />
      )}
    </div>
  );
}
