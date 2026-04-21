'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Plus, 
  FileText, 
  ChevronRight,
  Filter,
  CalendarDays,
  Plane,
  HeartPulse,
  UserPlus,
  ArrowRight,
  Info,
  Loader2,
  CalendarCheck2,
  Backpack,
  Check,
  X,
  Settings2,
  Save,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { format, formatDistanceToNow, parseISO, isWithinInterval, isWeekend } from 'date-fns';
import { cn } from '@/lib/utils';

type LeaveView = 'MY_LEAVES' | 'APPROVALS' | 'POLICY';

export default function LeavesPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<LeaveView>('MY_LEAVES');
  const [balance, setBalance] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyType, setApplyType] = useState('ANNUAL');
  
  // Policy State
  const [policy, setPolicy] = useState<any>(null);
  const [policyLoading, setPolicyLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const balanceRes = await api.get('/leaves/balance');
      setBalance(balanceRes.data);

      const endpoint = activeTab === 'APPROVALS' ? '/leaves/all' : '/leaves/my';
      if (activeTab !== 'POLICY') {
        const requestsRes = await api.get(endpoint);
        setRequests(requestsRes.data);
      } else {
        fetchPolicy();
      }
    } catch (error) {
      toast.error('Failed to sync leave records');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const fetchPolicy = async () => {
    setPolicyLoading(true);
    try {
      const res = await api.get('/leaves/policy');
      setPolicy(res.data);
    } catch (error) {
      toast.error('Failed to fetch global policy');
    } finally {
      setPolicyLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      type: applyType,
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      reason: formData.get('reason'),
      isHalfDay: formData.get('isHalfDay') === 'on',
      halfDaySession: formData.get('halfDaySession'),
    };

    try {
      await api.post('/leaves/request', data);
      toast.success('Leave application manifested. Waiting for approval.');
      setIsApplyModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Application failed');
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.patch(`/leaves/${id}/status`, { status });
      toast.success(`Leave request ${status.toLowerCase()}`);
      fetchData();
    } catch (error) {
      toast.error('Status update failed');
    }
  };

  const handleSavePolicy = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const entitlements = leaveTypes.map(lt => ({
      type: lt.id,
      days: Number(formData.get(lt.id))
    }));

    setPolicyLoading(true);
    try {
      await api.patch('/leaves/policy', { entitlements });
      toast.success('Global policy updated & synchronized');
      fetchPolicy();
    } catch (error) {
      toast.error('Policy update failed');
    } finally {
      setPolicyLoading(false);
    }
  };

  const leaveTypes = [
    { id: 'ANNUAL', label: 'Annual Leave', icon: Plane, color: 'bg-emerald-500', balanceKey: 'ANNUAL' },
    { id: 'SICK', label: 'Sick Leave', icon: HeartPulse, color: 'bg-red-500', balanceKey: 'SICK' },
    { id: 'CASUAL', label: 'Casual Leave', icon: Backpack, color: 'bg-amber-500', balanceKey: 'CASUAL' },
    { id: 'MATERNITY', label: 'Maternity Leave', icon: UserPlus, color: 'bg-pink-500', balanceKey: 'MATERNITY' },
    { id: 'PATERNITY', label: 'Paternity Leave', icon: UserPlus, color: 'bg-blue-500', balanceKey: 'PATERNITY' },
    { id: 'BEREAVEMENT', label: 'Bereavement', icon: HeartPulse, color: 'bg-slate-700', balanceKey: 'BEREAVEMENT' },
    { id: 'COMPENSATORY', label: 'Compensatory Off', icon: RotateCcw, color: 'bg-purple-500', balanceKey: 'COMPENSATORY' },
    { id: 'UNPAID', label: 'Unpaid Leave', icon: Clock, color: 'bg-slate-500', balanceKey: 'UNPAID' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
             <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-md border border-primary/20">Time-Off Engine</span>
          </div>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">
            Leave <span className="text-primary">Management</span>
          </h1>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">Manage entitlements, track balances, and plan your downtime.</p>
        </div>

        <Button 
          onClick={() => setIsApplyModalOpen(true)}
          className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 shadow-lg shadow-primary/20"
        >
          <Plus size={16} strokeWidth={3} />
          New Application
        </Button>
      </div>

      {/* Balance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {leaveTypes.filter(t => !['UNPAID', 'MATERNITY', 'PATERNITY', 'BEREAVEMENT', 'COMPENSATORY'].includes(t.id) || (balance?.entitled?.[t.id] > 0)).map((type) => {
          const entitled = balance?.entitled?.[type.id] || 0;
          const used = balance?.used?.[type.id] || 0;
          const pending = balance?.pending?.[type.id] || 0;
          const available = entitled - used - pending;

          return (
            <div key={type.id} className="bg-card border border-divider rounded-2xl p-5 shadow-sm group hover:border-primary/30 transition-all">
               <div className="flex items-start justify-between mb-4">
                  <div className={cn("p-2 rounded-lg text-white shadow-lg", type.color)}>
                     <type.icon size={18} />
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Available</span>
                     <span className="text-xl font-black">{available} Days</span>
                  </div>
               </div>
               <div className="space-y-2">
                  <p className="text-[11px] font-black uppercase tracking-tight text-foreground/80">{type.label}</p>
                  <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
                     <div 
                       className={cn("h-full transition-all duration-1000", type.color)} 
                       style={{ width: entitled > 0 ? `${(used / entitled) * 100}%` : '0%' }} 
                     />
                  </div>
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                     <span>Used: {used}</span>
                     <span>Total: {entitled}</span>
                  </div>
               </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-divider p-1.5 gap-1 bg-card rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
         <button 
           onClick={() => setActiveTab('MY_LEAVES')}
           className={cn(
             "px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0",
             activeTab === 'MY_LEAVES' ? "bg-primary text-white shadow-md shadow-primary/10" : "text-muted-foreground hover:bg-muted/10 hover:text-foreground"
           )}
         >
           My Applications
         </button>
         {isAdmin && (
           <>
            <button 
              onClick={() => setActiveTab('APPROVALS')}
              className={cn(
                "px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0",
                activeTab === 'APPROVALS' ? "bg-primary text-white shadow-md shadow-primary/10" : "text-muted-foreground hover:bg-muted/10 hover:text-foreground"
              )}
            >
              Approvals Inbox
            </button>
            <button 
              onClick={() => setActiveTab('POLICY')}
              className={cn(
                "px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border border-transparent",
                activeTab === 'POLICY' ? "bg-primary text-white shadow-md shadow-primary/10" : "text-muted-foreground hover:bg-muted/10 hover:text-foreground"
              )}
            >
              Global Policy
            </button>
           </>
         )}
      </div>

      <div className="min-h-[400px]">
        {loading || (activeTab === 'POLICY' && policyLoading) ? (
          <div className="py-24 flex flex-col items-center justify-center opacity-30 gap-4">
             <Loader2 className="w-10 h-10 animate-spin text-primary" />
             <span className="text-[10px] font-black uppercase tracking-widest">
               {activeTab === 'POLICY' ? 'Syncing Policy Engine...' : 'Compiling Records...'}
             </span>
          </div>
        ) : (
          <>
            {activeTab === 'POLICY' && isAdmin ? (
               <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-card border border-divider rounded-[32px] p-10 shadow-sm relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Settings2 size={120} strokeWidth={1} />
                     </div>
                     <div className="relative z-10 space-y-8">
                        <div>
                           <h2 className="text-3xl font-black uppercase tracking-tight">Global Leave <span className="text-primary">Policy</span></h2>
                           <p className="text-xs text-muted-foreground mt-2 font-medium">Define the standard yearly entitlements for your entire organization.</p>
                        </div>

                        <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-4 items-start">
                           <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-600"><AlertCircle size={16}/></div>
                           <div>
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Retroactive Sync Warning</h5>
                              <p className="text-[10px] leading-relaxed font-bold opacity-60 uppercase tracking-tight">Saving these changes will immediately update the entitlements of ALL existing employees for the current calendar year.</p>
                           </div>
                        </div>

                        <form onSubmit={handleSavePolicy} className="space-y-8">
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {leaveTypes.map((type) => (
                                 <div key={type.id} className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                                       <type.icon size={10} />
                                       {type.label}
                                    </label>
                                    <div className="relative">
                                       <input 
                                         name={type.id}
                                         type="number"
                                         defaultValue={policy?.entitlements?.[type.id] || 0}
                                         min={0}
                                         className="w-full h-11 px-4 pr-12 bg-muted/20 border border-divider rounded-xl text-xs font-bold focus:border-primary/50 outline-none transition-all"
                                       />
                                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase text-muted-foreground">Days</span>
                                    </div>
                                 </div>
                              ))}
                           </div>

                           <div className="pt-4 flex justify-end gap-3 rotate-0">
                               <Button type="button" variant="ghost" onClick={fetchPolicy} className="rounded-xl px-6 text-[10px] font-black uppercase">Cancel</Button>
                               <Button type="submit" className="rounded-xl px-10 text-[10px] font-black uppercase gap-2 shadow-xl shadow-primary/20">
                                  <Save size={14} />
                                  Save & Synchronize
                               </Button>
                           </div>
                        </form>
                     </div>
                  </div>
               </div>
            ) : (
              <div className="bg-card border border-divider rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="border-b border-divider/40">
                            <th className="p-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Reference</th>
                            {activeTab === 'APPROVALS' && <th className="p-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Employee</th>}
                            <th className="p-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Type</th>
                            <th className="p-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Duration</th>
                            <th className="p-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center">Days</th>
                            <th className="p-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                            <th className="p-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-divider/30">
                         {requests.map((req) => (
                           <tr key={req._id} className="group hover:bg-muted/5 transition-colors">
                              <td className="p-5">
                                 <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-muted border border-divider text-muted-foreground">
                                       <FileText size={14} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-tighter opacity-40">#{req._id.slice(-6)}</span>
                                 </div>
                              </td>
                              {activeTab === 'APPROVALS' && (
                                 <td className="p-5">
                                    <div className="flex items-center gap-3">
                                       <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20">
                                          {req.userId?.firstName?.[0]}{req.userId?.lastName?.[0]}
                                       </div>
                                       <span className="text-[11px] font-bold">{req.userId?.firstName} {req.userId?.lastName}</span>
                                    </div>
                                 </td>
                              )}
                              <td className="p-5">
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-tight">{req.type}</span>
                                    <span className="text-[8px] text-muted-foreground uppercase tracking-widest opacity-40 truncate max-w-[150px]">"{req.reason}"</span>
                                 </div>
                              </td>
                              <td className="p-5">
                                 <div className="flex items-center gap-2">
                                    <div className="flex flex-col">
                                       <span className="text-[10px] font-bold">{format(parseISO(req.startDate), 'MMM dd, yyyy')}</span>
                                       <span className="text-[8px] text-muted-foreground uppercase font-black uppercase tracking-tighter">Start Date</span>
                                    </div>
                                    <ArrowRight size={10} className="text-muted-foreground opacity-30" />
                                    <div className="flex flex-col">
                                       <span className="text-[10px] font-bold">{format(parseISO(req.endDate), 'MMM dd, yyyy')}</span>
                                       <span className="text-[8px] text-muted-foreground uppercase font-black uppercase tracking-tighter">End Date</span>
                                    </div>
                                 </div>
                              </td>
                              <td className="p-5 text-center">
                                 <span className="text-xs font-black">{req.daysCount}</span>
                              </td>
                              <td className="p-5">
                                 {req.status === 'PENDING' && (
                                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md text-[8px] font-black uppercase tracking-widest">Pending</span>
                                 )}
                                 {req.status === 'APPROVED' && (
                                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-md text-[8px] font-black uppercase tracking-widest">Approved</span>
                                 )}
                                 {req.status === 'REJECTED' && (
                                    <span className="px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md text-[8px] font-black uppercase tracking-widest">Rejected</span>
                                 )}
                              </td>
                              <td className="p-5 text-right">
                                 {activeTab === 'APPROVALS' && req.status === 'PENDING' ? (
                                    <div className="flex gap-2 justify-end">
                                       <button 
                                         onClick={() => handleStatusUpdate(req._id, 'APPROVED')}
                                         className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
                                       >
                                          <Check size={14} strokeWidth={3} />
                                       </button>
                                       <button 
                                         onClick={() => handleStatusUpdate(req._id, 'REJECTED')}
                                         className="w-7 h-7 rounded-lg bg-red-500 text-white flex items-center justify-center hover:shadow-lg hover:shadow-red-500/20 transition-all"
                                       >
                                          <X size={14} strokeWidth={3} />
                                       </button>
                                    </div>
                                 ) : (
                                    <span className="text-[8px] text-muted-foreground uppercase font-black tracking-widest opacity-30">
                                       {formatDistanceToNow(parseISO(req.createdAt))} ago
                                    </span>
                                 )}
                              </td>
                           </tr>
                         ))}
                         {requests.length === 0 && (
                           <tr>
                              <td colSpan={7} className="py-24 text-center opacity-20">
                                 <div className="flex flex-col items-center gap-4">
                                    <CalendarDays size={48} strokeWidth={1} />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No leave requests found</p>
                                 </div>
                              </td>
                           </tr>
                         )}
                      </tbody>
                   </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {isApplyModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={() => setIsApplyModalOpen(false)} />
           <div className="relative w-full max-w-xl bg-card border border-divider rounded-[32px] shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-black uppercase tracking-tight"><span className="text-primary">Apply</span> For Leave</h2>
                 <button onClick={() => setIsApplyModalOpen(false)} className="p-2 hover:bg-muted font-black border border-transparent hover:border-divider rounded-xl transition-all"><X size={20}/></button>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex gap-4 items-start translate-y-0 shadow-sm">
                 <div className="p-1.5 bg-primary/10 rounded-lg text-primary"><Info size={16}/></div>
                 <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Notice Period Information</h5>
                    <p className="text-[10px] leading-relaxed font-bold opacity-60 uppercase tracking-tight">Standard annual leaves should ideally be requested at least 3 business days in advance for team coordination.</p>
                 </div>
              </div>

              <form onSubmit={handleApply} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 flex flex-col">
                       <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Leave Type</label>
                       <CustomSelect 
                         value={applyType}
                         onChange={setApplyType}
                         options={leaveTypes.map(t => ({
                           value: t.id,
                           label: t.label,
                           icon: <t.icon size={14} />,
                           color: t.color.replace('bg-', 'text-')
                         }))}
                       />
                    </div>
                    <div className="flex items-end">
                       <label className="flex items-center gap-3 p-3 bg-muted/20 border border-divider rounded-xl cursor-pointer hover:bg-muted/30 transition-all select-none w-full">
                          <input type="checkbox" name="isHalfDay" className="w-4 h-4 rounded border-divider text-primary focus:ring-primary/20 accent-primary" />
                          <div className="flex flex-col">
                             <p className="text-[10px] font-black uppercase tracking-widest leading-none">Half-Day Session</p>
                             <p className="text-[7px] text-muted-foreground uppercase font-black mt-1 opacity-60">0.5 day deduction</p>
                          </div>
                       </label>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Start Date</label>
                       <input name="startDate" type="date" required className="w-full px-4 py-3 bg-muted/20 border border-divider rounded-xl outline-none font-bold text-xs" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">End Date</label>
                       <input name="endDate" type="date" required className="w-full px-4 py-3 bg-muted/20 border border-divider rounded-xl outline-none font-bold text-xs" />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Reason for Leave</label>
                    <textarea 
                      name="reason"
                      placeholder="Briefly explain the reason for your absence..."
                      required
                      rows={3}
                      className="w-full p-4 bg-muted/20 border border-divider rounded-2xl text-xs font-medium focus:border-primary/50 outline-none transition-all resize-none"
                    />
                 </div>

                 <Button type="submit" className="w-full h-12 rounded-[20px] text-xs font-black uppercase tracking-widest gap-2 shadow-xl shadow-primary/20">
                    <Plane size={18} />
                    Confirm Application
                 </Button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
