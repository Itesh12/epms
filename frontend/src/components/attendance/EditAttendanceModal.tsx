'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Clock, User, CheckCircle2, AlertTriangle, Save, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';

interface EditAttendanceModalProps {
  record?: any;       // null = create/backfill mode
  onClose: () => void;
  onSaved: () => void;
}

const STATUS_SELECT_OPTIONS: SelectOption[] = [
  { value: 'PRESENT', label: 'Present', icon: <CheckCircle2 size={14} />, color: 'text-emerald-500' },
  { value: 'LATE', label: 'Late', icon: <Clock size={14} />, color: 'text-amber-500' },
  { value: 'HALF_DAY', label: 'Half Day', icon: <AlertTriangle size={14} />, color: 'text-blue-500' },
  { value: 'ABSENT', label: 'Absent', icon: <X size={14} />, color: 'text-red-500' },
];

export function EditAttendanceModal({ record, onClose, onSaved }: EditAttendanceModalProps) {
  const isCreateMode = !record;
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [form, setForm] = useState({
    userId: record?.userId?._id || record?.userId || '',
    date: record?.date || format(new Date(), 'yyyy-MM-dd'),
    checkIn: record?.checkIn ? format(new Date(record.checkIn), "yyyy-MM-dd'T'HH:mm") : '',
    checkOut: record?.checkOut ? format(new Date(record.checkOut), "yyyy-MM-dd'T'HH:mm") : '',
    status: record?.status || 'PRESENT',
    notes: record?.notes || '',
  });

  useEffect(() => {
    if (isCreateMode) {
      setLoadingEmployees(true);
      api.get('/users').then(res => {
        setEmployees(res.data);
      }).catch(() => {
        toast.error('Failed to load employees');
      }).finally(() => setLoadingEmployees(false));
    }
  }, [isCreateMode]);

  const employeeOptions = useMemo<SelectOption[]>(() => {
    return employees.map(emp => ({
      value: emp._id,
      label: `${emp.firstName} ${emp.lastName} (${emp.email})`,
      icon: <User size={14} />,
    }));
  }, [employees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.checkIn && form.checkOut && new Date(form.checkOut) <= new Date(form.checkIn)) {
      toast.error('Check-out time must be after check-in time');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        status: form.status,
        notes: form.notes,
      };
      if (form.checkIn) payload.checkIn = new Date(form.checkIn).toISOString();
      if (form.checkOut) payload.checkOut = new Date(form.checkOut).toISOString();

      if (isCreateMode) {
        if (!form.userId) { toast.error('Please select an employee'); return; }
        await api.post('/attendance/admin/create', {
          ...payload,
          userId: form.userId,
          date: form.date,
        });
        toast.success('Attendance record created');
      } else {
        await api.patch(`/attendance/admin/${record._id}`, payload);
        toast.success('Record updated successfully');
      }

      onSaved();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card border border-divider rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-divider">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              {isCreateMode ? <Plus size={18} /> : <Clock size={18} />}
            </div>
            <div>
              <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
                {isCreateMode ? 'Manual Entry' : 'Edit Record'}
              </h2>
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-40 mt-0.5">
                {isCreateMode ? 'Backfill missing attendance' : `Editing: ${record?.date || ''}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Employee selector (Create mode only) */}
          {isCreateMode && (
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <User size={10} /> Employee
              </label>
              <CustomSelect
                value={form.userId}
                onChange={val => setForm(f => ({ ...f, userId: val }))}
                options={employeeOptions}
                placeholder="Select employee..."
                disabled={loadingEmployees}
              />
            </div>
          )}

          {/* Date (Create mode only, readonly on edit) */}
          {isCreateMode && (
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Calendar size={10} /> Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                max={format(new Date(), 'yyyy-MM-dd')}
                required
                className="w-full bg-muted/20 border border-divider rounded-xl py-3 px-4 text-xs font-medium focus:ring-1 focus:ring-primary outline-none transition-all text-foreground"
              />
            </div>
          )}

          {/* Check-in / Check-out */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Check-in Time</label>
              <input
                type="datetime-local"
                value={form.checkIn}
                onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))}
                className="w-full bg-muted/20 border border-divider rounded-xl py-3 px-4 text-xs font-medium focus:ring-1 focus:ring-primary outline-none transition-all text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Check-out Time</label>
              <input
                type="datetime-local"
                value={form.checkOut}
                onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))}
                className="w-full bg-muted/20 border border-divider rounded-xl py-3 px-4 text-xs font-medium focus:ring-1 focus:ring-primary outline-none transition-all text-foreground"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Attendance Status</label>
            <CustomSelect
              value={form.status}
              onChange={val => setForm(f => ({ ...f, status: val }))}
              options={STATUS_SELECT_OPTIONS}
              placeholder="Select status..."
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Admin Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              placeholder="Optional administrative note..."
              className="w-full bg-muted/20 border border-divider rounded-xl py-3 px-4 text-xs font-medium focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-foreground placeholder:text-muted-foreground/30"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest border-divider"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={saving}
              className="flex-1 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
            >
              <Save size={14} className="mr-2" />
              {isCreateMode ? 'Create Record' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
