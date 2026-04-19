'use client';

import { X, Clock, Coffee, Briefcase, Calendar, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { format, differenceInMinutes, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface AttendanceRecordDrawerProps {
  record: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (record: any) => void;
  onDelete: (id: string, name: string) => void;
}

export function AttendanceRecordDrawer({ record, isOpen, onClose, onEdit, onDelete }: AttendanceRecordDrawerProps) {
  if (!record) return null;

  const empName = `${record.userId?.firstName ?? ''} ${record.userId?.lastName ?? ''}`.trim() || 'Employee';
  const totalMs = record.checkIn && record.checkOut 
    ? new Date(record.checkOut).getTime() - new Date(record.checkIn).getTime()
    : 0;
  const totalMinutes = Math.floor(totalMs / (1000 * 60));
  const workMinutes = record.totalWorkMinutes || 0;
  const breakMinutes = Math.max(0, totalMinutes - workMinutes);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-lg bg-card border-l border-divider z-[101] shadow-2xl transition-transform duration-500 ease-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-8 border-b border-divider flex items-center justify-between bg-muted/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Calendar size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Record Analysis</h2>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">
                Detailed timeline for {format(new Date(record.date + 'T00:00:00'), 'MMMM dd, yyyy')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-2xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* Employee Brief */}
          <section className="space-y-4">
            <div className="flex items-center gap-4 p-5 bg-muted/20 border border-divider rounded-[24px]">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-black border border-primary/30">
                {record.userId?.firstName?.[0]}
              </div>
              <div>
                <h3 className="text-base font-black text-foreground leading-tight">{empName}</h3>
                <p className="text-xs text-muted-foreground font-medium opacity-60">{record.userId?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                   <span className={cn(
                     "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                     record.status === 'PRESENT' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                     record.status === 'LATE' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                     "bg-red-500/10 text-red-500 border-red-500/20"
                   )}>
                     {record.status}
                   </span>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Summary */}
          <section className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-card border border-divider rounded-[24px] shadow-sm">
                <div className="flex items-center gap-2 mb-2 opacity-40">
                  <Briefcase size={12} className="text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Work Duration</span>
                </div>
                <p className="text-2xl font-black text-foreground tabular-nums">
                  {Math.floor(workMinutes / 60)}h {workMinutes % 60}m
                </p>
            </div>
            <div className="p-6 bg-card border border-divider rounded-[24px] shadow-sm">
                <div className="flex items-center gap-2 mb-2 opacity-40">
                  <Coffee size={12} className="text-amber-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Break Time</span>
                </div>
                <p className="text-2xl font-black text-foreground tabular-nums">
                  {Math.floor(breakMinutes / 60)}h {breakMinutes % 60}m
                </p>
            </div>
          </section>

          {/* Detailed Timeline */}
          <section className="space-y-6">
             <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Activity Log</h4>
                <div className="h-px flex-1 mx-4 bg-divider opacity-40" />
             </div>

             <div className="space-y-8 pl-4 relative">
                <div className="absolute left-[-1px] top-2 bottom-2 w-0.5 bg-divider opacity-40 rounded-full" />
                
                {/* Check In */}
                <div className="relative">
                  <div className="absolute left-[-21px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-4 border-card outline outline-1 outline-divider" />
                  <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">Shift Start</p>
                    <p className="text-sm font-black text-foreground tabular-nums">
                      {record.checkIn ? format(new Date(record.checkIn), 'HH:mm:ss') : 'MISSING'}
                    </p>
                  </div>
                </div>

                {/* Breaks */}
                {(record.breaks || []).map((b: any, i: number) => {
                  const duration = b.endTime && b.startTime ? differenceInMinutes(new Date(b.endTime), new Date(b.startTime)) : 0;
                  return (
                    <div key={i} className="relative">
                      <div className="absolute left-[-21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 border-4 border-card outline outline-1 outline-divider" />
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">
                            Break: {b.reason || 'General'}
                          </p>
                          <p className="text-sm font-bold text-foreground tabular-nums">
                            {b.startTime ? format(new Date(b.startTime), 'HH:mm:ss') : '??'} → {b.endTime ? format(new Date(b.endTime), 'HH:mm:ss') : 'Ongoing'}
                          </p>
                        </div>
                        {duration > 0 && <span className="text-[9px] font-black text-muted-foreground bg-muted p-1 px-2 rounded-lg">{duration} min</span>}
                      </div>
                    </div>
                  );
                })}

                {/* Check Out */}
                <div className="relative">
                  <div className="absolute left-[-21px] top-1 w-2.5 h-2.5 rounded-full bg-foreground border-4 border-card outline outline-1 outline-divider" />
                  <div>
                    <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none mb-1">Shift End</p>
                    <p className="text-sm font-black text-foreground tabular-nums">
                      {record.checkOut ? format(new Date(record.checkOut), 'HH:mm:ss') : 'ACTIVE'}
                    </p>
                  </div>
                </div>
             </div>
          </section>

          {/* Notes */}
          {record.notes && (
            <section className="space-y-3">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Admin Notes</h4>
               <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-3">
                  <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-amber-900/60 leading-relaxed italic">
                    "{record.notes}"
                  </p>
               </div>
            </section>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-divider bg-muted/10 grid grid-cols-2 gap-4">
           <Button 
             variant="outline" 
             onClick={() => onEdit(record)}
             className="h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest gap-2 bg-card border-divider"
           >
             <Edit2 size={14} />
             Edit Record
           </Button>
           <Button 
             variant="outline" 
             onClick={() => onDelete(record._id, empName)}
             className="h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest gap-2 bg-card border-red-500/20 text-red-500 hover:bg-red-500/10"
           >
             <Trash2 size={14} />
             Delete
           </Button>
        </div>
      </div>
    </>
  );
}
