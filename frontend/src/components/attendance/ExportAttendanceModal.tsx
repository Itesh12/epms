'use client';

import { useState, useMemo, useEffect } from 'react';
import { X, Calendar, Download, User, Clock, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  startOfQuarter, 
  endOfQuarter 
} from 'date-fns';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';

interface ExportAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  currentUserId?: string;
  employees: any[];
}

const PRESET_OPTIONS: SelectOption[] = [
  { value: 'current_month', label: 'Current Month', icon: <Calendar size={14} /> },
  { value: 'past_month',    label: 'Past Month',    icon: <Clock size={14} /> },
  { value: 'this_quarter',  label: 'This Quarter',  icon: <Calendar size={14} /> },
  { value: 'custom',        label: 'Custom Range',  icon: <Calendar size={14} /> },
];

export function ExportAttendanceModal({ 
  isOpen, 
  onClose, 
  userRole, 
  currentUserId,
  employees 
}: ExportAttendanceModalProps) {
  const isAdmin = userRole?.toUpperCase() === 'ADMIN';
  
  const [exporting, setExporting] = useState(false);
  const [preset, setPreset] = useState('current_month');
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [selectedUserId, setSelectedUserId] = useState<string>(''); // Default to all for Admin, self for others

  // Initialize selectedUserId based on role
  useEffect(() => {
    if (!isAdmin && currentUserId) {
      setSelectedUserId(currentUserId);
    }
  }, [isAdmin, currentUserId]);

  // Sync dates with preset
  useEffect(() => {
    const now = new Date();
    if (preset === 'current_month') {
      setStartDate(format(startOfMonth(now), 'yyyy-MM-dd'));
      setEndDate(format(endOfMonth(now), 'yyyy-MM-dd'));
    } else if (preset === 'past_month') {
      const pm = subMonths(now, 1);
      setStartDate(format(startOfMonth(pm), 'yyyy-MM-dd'));
      setEndDate(format(endOfMonth(pm), 'yyyy-MM-dd'));
    } else if (preset === 'this_quarter') {
      setStartDate(format(startOfQuarter(now), 'yyyy-MM-dd'));
      setEndDate(format(endOfQuarter(now), 'yyyy-MM-dd'));
    }
  }, [preset]);

  const employeeOptions = useMemo<SelectOption[]>(() => {
    const options: SelectOption[] = [
      { value: '', label: 'All Employees', icon: <User size={14} /> }
    ];
    
    employees.forEach(emp => {
      options.push({
        value: emp._id,
        label: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email,
        icon: <User size={14} />
      });
    });

    return options;
  }, [employees]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (selectedUserId) params.append('userId', selectedUserId);
      if (startDate) params.append('start', startDate);
      if (endDate) params.append('end', endDate);

      const res: any = await api.get(`/attendance/export?${params.toString()}`);
      
      // The interceptor returns response.data
      // If backend returns { success, data: { csv, filename } }
      const finalCsv = res.data?.csv || res.csv || (typeof res === 'string' ? res : '');
      const finalFilename = res.data?.filename || res.filename || `attendance_report_${startDate}_to_${endDate}.csv`;

      if (!finalCsv) {
          toast.error('No data found for the selected range/employee');
          setExporting(false);
          return;
      }

      const blob = new Blob([finalCsv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = finalFilename;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully');
      onClose();
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-card border border-divider rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-divider">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Download size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Export Attendance</h2>
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-40">Generate CSV Report</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Preset Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Select Range Preset</label>
            <CustomSelect
              value={preset}
              onChange={setPreset}
              options={PRESET_OPTIONS}
            />
          </div>

          {/* Custom Date Inputs (only if custom or showing always for clarity) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPreset('custom');
                }}
                className="w-full bg-muted/30 border border-divider rounded-xl px-4 py-2 text-xs font-bold text-foreground outline-none focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPreset('custom');
                }}
                className="w-full bg-muted/30 border border-divider rounded-xl px-4 py-2 text-xs font-bold text-foreground outline-none focus:border-primary/50"
              />
            </div>
          </div>

          {/* Employee Selector (Admins Only) */}
          {isAdmin && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Employee Filter</label>
              <CustomSelect
                value={selectedUserId}
                onChange={setSelectedUserId}
                options={employeeOptions}
                placeholder="All Employees"
              />
            </div>
          )}

          {!isAdmin && (
             <div className="p-4 bg-muted/20 border border-divider rounded-2xl flex items-center gap-3">
               <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                 <CheckCircle2 size={12} />
               </div>
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Your records only</p>
             </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest border-divider"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={exporting}
              className="flex-1 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
            >
              {exporting ? <Loader2 size={14} className="animate-spin mr-2" /> : <Download size={14} className="mr-2" />}
              {exporting ? 'Generating...' : 'Download'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
