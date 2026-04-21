'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ShieldAlert, 
  User as UserIcon, 
  Calendar, 
  MoreVertical,
  Quote,
  MessageSquare,
  Send,
  Loader2,
  ChevronRight,
  LifeBuoy,
  Cpu,
  ShieldCheck,
  Package,
  ArrowRight,
  BadgeAlert,
  BadgeCheck,
  History,
  Zap,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

type TicketType = 'IT_SUPPORT' | 'GENERAL_COMPLAINT';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type TicketCategory = 'HARDWARE' | 'SOFTWARE' | 'NETWORK' | 'ACCESS' | 'HARASSMENT' | 'FACILITY' | 'SALARY' | 'OTHER';

interface Ticket {
  _id: string;
  subject: string;
  description: string;
  type: TicketType;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  isAnonymous: boolean;
  requesterId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  assignedTo?: {
    firstName: string;
    lastName: string;
  };
  resolutionNote?: string;
  createdAt: string;
}

export default function SupportCenterPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  // New Ticket State
  const [newType, setNewType] = useState<TicketType | null>(null);
  const [newSubject, setNewSubject] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<TicketCategory>('OTHER');
  const [newPriority, setNewPriority] = useState<TicketPriority>('MEDIUM');
  const [isAnon, setIsAnon] = useState(false);

  // Administrative State
  const [resolutionNote, setResolutionNote] = useState('');
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0 });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const [ticketsRes, statsRes] = await Promise.all([
        api.get('/support/tickets'),
        api.get('/support/tickets/stats')
      ]);
      setTickets(ticketsRes.data);
      setStats(statsRes.data);
    } catch (error) {
       toast.error('Failed to sync support records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newType) return;
    
    try {
      await api.post('/support/tickets', {
        type: newType,
        subject: newSubject,
        description: newDescription,
        category: newCategory,
        priority: newPriority,
        isAnonymous: isAnon
      });
      toast.success('Ticket submitted to the Helpdesk');
      setShowNewTicket(false);
      resetNewForm();
      fetchTickets();
    } catch (error) {
      toast.error('Submission failed');
    }
  };

  const resetNewForm = () => {
    setNewType(null);
    setNewSubject('');
    setNewDescription('');
    setNewCategory('OTHER');
    setNewPriority('MEDIUM');
    setIsAnon(false);
  };

  const handleUpdateStatus = async (id: string, status: TicketStatus) => {
    if (status === 'CLOSED' && !resolutionNote) {
      toast.error('A resolution note is required to close a ticket');
      return;
    }

    try {
      await api.patch(`/support/tickets/${id}`, { status, resolutionNote });
      toast.success(`Ticket marked as ${status}`);
      setResolutionNote('');
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
       toast.error('Update failed');
    }
  };

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'HIGH': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'MEDIUM': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-muted/50 text-muted-foreground border-divider';
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'OPEN': return 'bg-emerald-500/10 text-emerald-500';
      case 'IN_PROGRESS': return 'bg-amber-500/10 text-amber-500';
      case 'RESOLVED': return 'bg-primary/10 text-primary';
      case 'CLOSED': return 'bg-muted text-muted-foreground';
    }
  };

  const itCategories: SelectOption[] = [
    { value: 'HARDWARE', label: 'Hardware Issue' },
    { value: 'SOFTWARE', label: 'Software / App' },
    { value: 'NETWORK', label: 'Network / VPN' },
    { value: 'ACCESS', label: 'Account Access' },
  ];

  const grievanceCategories: SelectOption[] = [
    { value: 'HARASSMENT', label: 'Workplace Conduct' },
    { value: 'FACILITY', label: 'Facility / Maintenance' },
    { value: 'SALARY', label: 'Salary / HR' },
    { value: 'OTHER', label: 'General Feedback' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
             <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-md border border-primary/20">Resolution Hub</span>
          </div>
          <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">Helpdesk & <span className="text-primary">Grievances</span></h1>
          <p className="text-xs text-muted-foreground font-medium opacity-60">Central resolution point for IT support and workplace grievances.</p>
        </div>

        <div className="flex gap-2">
           <Button onClick={() => setShowNewTicket(true)} className="gap-2 rounded-2xl px-6 h-12 shadow-lg shadow-primary/20 text-[11px] font-black uppercase tracking-widest">
              <Plus size={16} /> New Request
           </Button>
        </div>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
           {[
             { label: 'Open Tickets', val: stats.open, icon: AlertCircle, color: 'text-emerald-500' },
             { label: 'In Progress', val: stats.inProgress, icon: History, color: 'text-amber-500' },
             { label: 'Resolved (Today)', val: stats.resolved, icon: CheckCircle2, color: 'text-primary' },
           ].map((stat, i) => (
             <div key={i} className="bg-card border border-divider rounded-3xl p-6 flex items-center justify-between shadow-sm group hover:border-primary/20 transition-all">
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">{stat.label}</p>
                   <p className="text-2xl font-black">{stat.val}</p>
                </div>
                <div className={cn("p-4 rounded-2xl bg-muted/30 group-hover:scale-110 transition-transform", stat.color)}>
                   <stat.icon size={24} />
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Main Support Feed */}
      <div className="bg-card border border-divider rounded-[40px] overflow-hidden shadow-sm">
         <div className="border-b border-divider p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-1 bg-muted/30 p-1.5 rounded-2xl">
               <button className="px-5 py-2 bg-background rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">Active Feed</button>
               <button className="px-5 py-2 text-muted-foreground opacity-40 text-[10px] font-black uppercase tracking-widest hover:opacity-100 transition-all">Resolved</button>
               {isAdmin && <button className="px-5 py-2 text-muted-foreground opacity-40 text-[10px] font-black uppercase tracking-widest hover:opacity-100 transition-all">Archived</button>}
            </div>

            <div className="flex items-center gap-2">
               <div className="relative">
                  <input placeholder="Search records..." className="h-10 pl-10 pr-4 bg-muted/20 border border-divider rounded-xl outline-none focus:border-primary/40 text-[11px] font-bold w-full sm:w-64" />
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40" />
               </div>
               <Button variant="outline" size="icon" className="rounded-xl border-divider h-10 w-10">
                  <Filter size={16} />
               </Button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-muted/10">
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 border-b border-divider">Triage Reference</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 border-b border-divider">Type & Detail</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 border-b border-divider">Requester</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 border-b border-divider">Status</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 border-b border-divider">SLA Timer</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-divider/40">
                  {loading ? (
                    <tr><td colSpan={5} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-primary opacity-20" /></td></tr>
                  ) : tickets.length === 0 ? (
                    <tr><td colSpan={5} className="py-24 text-center opacity-30 text-[11px] font-black uppercase">No records found. Everything is running smoothly.</td></tr>
                  ) : (
                    tickets.map((ticket) => (
                      <tr 
                        key={ticket._id} 
                        onClick={() => setSelectedTicket(ticket)}
                        className="group hover:bg-muted/20 cursor-pointer transition-all"
                      >
                         <td className="px-6 py-5">
                            <div className="flex flex-col gap-1">
                               <span className="text-[10px] font-black text-primary opacity-40">#{ticket._id.slice(-6).toUpperCase()}</span>
                               <span className={cn(
                                 "px-2 py-0.5 rounded-md border text-[8px] font-black w-fit uppercase tracking-[0.1em]",
                                 getPriorityColor(ticket.priority)
                               )}>
                                  {ticket.priority}
                               </span>
                            </div>
                         </td>
                         <td className="px-6 py-5">
                            <div className="flex flex-col max-w-xs">
                               <div className="flex items-center gap-2 mb-1">
                                  {ticket.type === 'IT_SUPPORT' ? <Cpu size={12} className="text-primary" /> : <ShieldAlert size={12} className="text-amber-500" />}
                                  <span className="text-[13px] font-black truncate">{ticket.subject}</span>
                               </div>
                               <span className="text-[10px] font-bold text-muted-foreground opacity-40 uppercase tracking-widest">{ticket.category}</span>
                            </div>
                         </td>
                         <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-xl bg-muted border border-divider flex items-center justify-center text-[10px] font-black text-muted-foreground/40 overflow-hidden">
                                  {ticket.isAnonymous ? '?' : ticket.requesterId.avatar ? <img src={ticket.requesterId.avatar} /> : ticket.requesterId.firstName?.[0]}
                               </div>
                               <div className="flex flex-col">
                                  <span className="text-[11px] font-black">{ticket.isAnonymous ? 'Anonymous' : `${ticket.requesterId.firstName} ${ticket.requesterId.lastName}`}</span>
                                  <span className="text-[9px] font-medium text-muted-foreground opacity-40">{ticket.isAnonymous ? 'Identity Masked' : 'Requester'}</span>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-5">
                             <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border border-transparent", getStatusColor(ticket.status))}>
                                {ticket.status.replace('_', ' ')}
                             </div>
                         </td>
                         <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-muted-foreground opacity-60">
                               <Clock size={14} className="opacity-40" />
                               <span className="text-[11px] font-black">{formatDistanceToNow(parseISO(ticket.createdAt))}</span>
                            </div>
                         </td>
                      </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Modals & Overlays */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
           <div className="bg-card border border-divider rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-divider flex justify-between items-center bg-muted/10">
                 <div className="space-y-1">
                    <h2 className="text-xl font-black uppercase tracking-tight">New Support Request</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Please provide all relevant details.</p>
                 </div>
                 <Button variant="ghost" size="icon" onClick={() => setShowNewTicket(false)} className="rounded-2xl h-10 w-10">
                    <X size={20} />
                 </Button>
              </div>

              <div className="p-8 space-y-8">
                 {!newType ? (
                    <div className="grid grid-cols-2 gap-4">
                       <button 
                         onClick={() => setNewType('IT_SUPPORT')}
                         className="flex flex-col items-center gap-4 p-8 bg-muted/20 border border-divider rounded-[32px] hover:border-primary/40 hover:bg-primary/5 transition-all group"
                       >
                          <div className="p-5 bg-background rounded-[24px] shadow-sm text-primary group-hover:scale-110 transition-transform">
                             <Cpu size={32} />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-widest">IT Support</span>
                       </button>
                       <button 
                         onClick={() => setNewType('GENERAL_COMPLAINT')}
                         className="flex flex-col items-center gap-4 p-8 bg-muted/20 border border-divider rounded-[32px] hover:border-amber-500/40 hover:bg-amber-500/5 transition-all group"
                       >
                          <div className="p-5 bg-background rounded-[24px] shadow-sm text-amber-500 group-hover:scale-110 transition-transform">
                             <ShieldAlert size={32} />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-widest">Grievance</span>
                       </button>
                    </div>
                 ) : (
                    <form onSubmit={handleCreateTicket} className="space-y-6">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Type Reference</label>
                             <div className="flex items-center gap-2 p-3 bg-muted/30 border border-divider rounded-2xl">
                                {newType === 'IT_SUPPORT' ? <Cpu size={14} className="text-primary" /> : <ShieldAlert size={14} className="text-amber-500" />}
                                <span className="text-[11px] font-black uppercase">{newType.replace('_', ' ')}</span>
                                <button type="button" onClick={() => setNewType(null)} className="ml-auto text-primary text-[9px] font-black uppercase">Change</button>
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</label>
                             <CustomSelect 
                               value={newCategory} 
                               onChange={(val) => setNewCategory(val as any)}
                               options={newType === 'IT_SUPPORT' ? itCategories : grievanceCategories}
                               placeholder="Select category..."
                             />
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Short Subject</label>
                          <input 
                            placeholder="Briefly describe the request..."
                            value={newSubject}
                            onChange={(e) => setNewSubject(e.target.value)}
                            required
                            className="w-full bg-muted/30 border border-divider rounded-2xl p-4 text-[13px] font-bold outline-none focus:border-primary/40"
                          />
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Context / Description</label>
                          <textarea 
                            rows={4}
                            placeholder="Provide as much detail as possible to help us resolve this faster..."
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            required
                            className="w-full bg-muted/30 border border-divider rounded-2xl p-4 text-[13px] font-medium outline-none focus:border-primary/40 resize-none"
                          />
                       </div>

                       <div className="flex items-center justify-between p-4 bg-muted/20 border border-divider rounded-[24px]">
                          <div className="flex items-center gap-3">
                             <button
                               type="button" 
                               onClick={() => setIsAnon(!isAnon)}
                               className={cn(
                                 "w-10 h-6 rounded-full transition-all relative",
                                 isAnon ? "bg-primary" : "bg-muted"
                               )}
                             >
                                <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", isAnon ? "left-5" : "left-1")} />
                             </button>
                             <div className="flex flex-col">
                                <span className="text-[11px] font-black uppercase tracking-tight">Submit Anonymously</span>
                                <span className="text-[9px] font-bold opacity-30">Your identity will be masked from staff</span>
                             </div>
                          </div>

                          <div className="flex gap-2">
                             <Button type="button" variant="ghost" onClick={() => setShowNewTicket(false)} className="text-[10px] font-black uppercase rounded-xl">Cancel</Button>
                             <Button type="submit" className="text-[10px] font-black uppercase rounded-xl px-10 shadow-lg shadow-primary/20">Submit Request</Button>
                          </div>
                       </div>
                    </form>
                 )}
              </div>
           </div>
        </div>
      )}

      {selectedTicket && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-end z-[60] animate-in slide-in-from-right duration-500">
           <div className="bg-card border-l border-divider w-full max-w-2xl h-screen flex flex-col shadow-2xl">
              <div className="p-8 border-b border-divider flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedTicket(null)} className="rounded-xl h-10 w-10">
                       <ChevronRight className="rotate-180" />
                    </Button>
                    <div className="space-y-1">
                       <h2 className="text-xl font-black uppercase tracking-tight truncate max-w-[400px]">{selectedTicket.subject}</h2>
                       <span className="text-[10px] font-black text-primary opacity-40 uppercase tracking-widest">#{selectedTicket._id}</span>
                    </div>
                 </div>
                 <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", getStatusColor(selectedTicket.status))}>
                    {selectedTicket.status}
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12">
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Submission Context</h5>
                       <span className="px-3 py-1 bg-muted rounded-lg text-[9px] font-black uppercase">{selectedTicket.type}</span>
                    </div>
                    <div className="bg-muted/10 border border-divider p-8 rounded-[32px] relative">
                       <Quote className="absolute top-4 right-4 text-primary/10 w-10 h-10" />
                       <p className="text-[14px] leading-relaxed font-medium text-foreground/80">{selectedTicket.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-5 border border-divider rounded-2xl flex items-center gap-4 bg-muted/5">
                          <UserIcon size={24} className="text-primary opacity-40" />
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black uppercase opacity-30 tracking-widest">Requester</span>
                             <span className="text-[12px] font-black">{selectedTicket.isAnonymous ? 'Anonymous User' : `${selectedTicket.requesterId.firstName} ${selectedTicket.requesterId.lastName}`}</span>
                          </div>
                       </div>
                       <div className="p-5 border border-divider rounded-2xl flex items-center gap-4 bg-muted/5">
                          <Zap size={24} className="text-emerald-500 opacity-40" />
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black uppercase opacity-30 tracking-widest">Assigned Specialist</span>
                             <span className="text-[12px] font-black text-emerald-500">{selectedTicket.assignedTo ? `${selectedTicket.assignedTo.firstName} ${selectedTicket.assignedTo.lastName}` : 'Unassigned'}</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 {selectedTicket.resolutionNote && (
                   <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                         <BadgeCheck size={16} /> Resolution Manifest
                      </h5>
                      <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl">
                         <p className="text-[13px] font-bold text-primary italic">&quot;{selectedTicket.resolutionNote}&quot;</p>
                      </div>
                   </div>
                 )}

                 {isAdmin && (
                   <div className="space-y-6 pt-6 border-t border-divider">
                      <h5 className="text-[10px] font-black uppercase tracking-widest opacity-40">Resolution Controls</h5>
                      <div className="space-y-4 p-6 bg-muted/20 border border-divider rounded-3xl">
                         <div className="flex gap-2">
                            <Button 
                              onClick={() => handleUpdateStatus(selectedTicket._id, 'IN_PROGRESS')}
                              variant="outline"
                              className="text-[9px] font-black uppercase rounded-lg px-4 h-10 border-divider flex-1"
                            >
                               Initialize Work
                            </Button>
                            <Button 
                              onClick={() => handleUpdateStatus(selectedTicket._id, 'RESOLVED')}
                              variant="outline"
                              className="text-[9px] font-black uppercase rounded-lg px-4 h-10 border-divider flex-1"
                            >
                               Mark Resolved
                            </Button>
                         </div>
                         
                         <div className="space-y-3 pt-2">
                            <label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-2">Final Resolution Note (Required to Close)</label>
                            <textarea 
                               placeholder="Describe the fix..."
                               value={resolutionNote}
                               onChange={(e) => setResolutionNote(e.target.value)}
                               className="w-full bg-background border border-divider rounded-xl p-3 text-[11px] font-bold outline-none focus:border-primary/40 min-h-[80px]"
                            />
                            <Button 
                               onClick={() => handleUpdateStatus(selectedTicket._id, 'CLOSED')}
                               className="w-full rounded-xl text-[10px] font-black uppercase h-12 shadow-inner"
                            >
                               Permanently Close Ticket
                            </Button>
                         </div>
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
