'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, UserMinus, Loader2, Check, AlertCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface MarkAbsentModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export function MarkAbsentModal({ onClose, onSaved }: MarkAbsentModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMissing = async (targetDate: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance/admin/missing?date=${targetDate}`);
      setEmployees(res.data);
      // Automatically select all by default when list loads
      setSelectedIds(new Set(res.data.map((e: any) => e._id)));
    } catch {
      toast.error('Failed to load missing employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissing(date);
  }, [date]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredEmployees.length) {
       // If all currently filtered are selected, unselect them
       const next = new Set(selectedIds);
       filteredEmployees.forEach(e => next.delete(e._id));
       setSelectedIds(next);
    } else {
       // Select all currently filtered
       const next = new Set(selectedIds);
       filteredEmployees.forEach(e => next.add(e._id));
       setSelectedIds(next);
    }
  };

  const filteredEmployees = employees.filter(e => 
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async () => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one employee');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/attendance/admin/mark-absent', {
        date,
        userIds: Array.from(selectedIds)
      });
      toast.success(`${res.data.marked} employee(s) marked as absent`);
      onSaved();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark absences');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-card border border-divider rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-8 border-b border-divider">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <UserMinus size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Mark Absent</h2>
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-40 mt-0.5">
                Bulk mark employees as absent for a specific date
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Calendar size={10} /> Target Date
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
                className="w-full bg-muted/20 border border-divider rounded-xl py-2.5 px-4 text-xs font-medium focus:ring-1 focus:ring-primary outline-none transition-all text-foreground"
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Search size={10} /> Search Employee
              </label>
              <input
                type="text"
                placeholder="Name or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-muted/20 border border-divider rounded-xl py-2.5 px-4 text-xs font-medium focus:ring-1 focus:ring-primary outline-none transition-all text-foreground"
              />
            </div>
          </div>

          <div className="border border-divider rounded-2xl overflow-hidden bg-muted/5">
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-card border-b border-divider z-10">
                  <tr className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    <th className="px-5 py-3 w-10">
                      <button 
                        onClick={toggleAll}
                        className={cn(
                          "w-5 h-5 rounded border flex items-center justify-center transition-all",
                          selectedIds.size === filteredEmployees.length && filteredEmployees.length > 0
                            ? "bg-primary border-primary text-white" 
                            : "border-divider bg-white/5"
                        )}
                      >
                        {selectedIds.size === filteredEmployees.length && filteredEmployees.length > 0 && <Check size={12} />}
                      </button>
                    </th>
                    <th className="px-5 py-3">Employee</th>
                    <th className="px-5 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider/50">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="py-20 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary/40 mx-auto" />
                      </td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-20 text-center">
                        <AlertCircle className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">No missing employees found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map(emp => (
                      <tr 
                        key={emp._id} 
                        className={cn("group cursor-pointer hover:bg-primary/5 transition-colors", selectedIds.has(emp._id) && "bg-primary/5")}
                        onClick={() => toggleSelect(emp._id)}
                      >
                        <td className="px-5 py-3">
                          <div className={cn(
                            "w-5 h-5 rounded border flex items-center justify-center transition-all",
                            selectedIds.has(emp._id) ? "bg-primary border-primary text-white" : "border-divider bg-white/5 group-hover:border-primary/50"
                          )}>
                            {selectedIds.has(emp._id) && <Check size={12} />}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-muted border border-divider flex items-center justify-center text-[10px] font-black uppercase">
                              {emp.firstName?.[0]}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground line-clamp-1">{emp.firstName} {emp.lastName}</p>
                              <p className="text-[9px] text-muted-foreground lowercase line-clamp-1">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Missing Record</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-divider">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Selected: <span className="text-primary">{selectedIds.size}</span> employees
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest border-divider">
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                isLoading={submitting}
                className="h-10 rounded-xl px-6 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/10"
              >
                Confirm Mark Absent
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
