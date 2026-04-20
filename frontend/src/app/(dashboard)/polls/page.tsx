'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  MessageSquare, 
  Vote as VoteIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Send,
  User,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  History,
  Archive,
  Loader2,
  MoreVertical,
  X,
  Megaphone
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Button } from '@/components/ui/Button';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

type EngView = 'POLLS' | 'FEEDBACK' | 'ADMIN';

export default function PollsPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<EngView>('POLLS');
  const [polls, setPolls] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const pollRes = await api.get('/polls');
      setPolls(pollRes.data);
      
      if (isAdmin) {
        const feedbackRes = await api.get('/polls/feedback/all');
        setFeedback(feedbackRes.data);
      }
    } catch (error) {
      toast.error('Failed to sync engagement data');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleVote = async (pollId: string, optionIndex: number) => {
    try {
      await api.post(`/polls/${pollId}/vote`, { optionIndex });
      toast.success('Vote recorded anonymously');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Voting failed');
    }
  };

  const submitFeedback = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      content: formData.get('content'),
      category: formData.get('category'),
      isAnonymous: formData.get('isAnonymous') === 'on',
    };

    try {
      await api.post('/polls/feedback', data);
      toast.success('Thank you for your feedback');
      (e.target as HTMLFormElement).reset();
      if (isAdmin) fetchData();
    } catch (error) {
      toast.error('Submission failed');
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
             <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-md border border-primary/20">Engagement Hub</span>
          </div>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">
            Voice & <span className="text-primary">Polls</span>
          </h1>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">Express your opinions anonymously and help shape the organization.</p>
        </div>

        {isAdmin && (
           <Button 
             onClick={() => setIsPollModalOpen(true)}
             className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 shadow-lg shadow-primary/20"
           >
             <Plus size={16} strokeWidth={3} />
             Create New Poll
           </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-divider p-1.5 gap-1 bg-card rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
         <button 
           onClick={() => setActiveTab('POLLS')}
           className={cn(
             "px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0",
             activeTab === 'POLLS' ? "bg-primary text-white shadow-md shadow-primary/10" : "text-muted-foreground hover:bg-muted/10 hover:text-foreground"
           )}
         >
           Live Polls
         </button>
         <button 
           onClick={() => setActiveTab('FEEDBACK')}
           className={cn(
             "px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0",
             activeTab === 'FEEDBACK' ? "bg-primary text-white shadow-md shadow-primary/10" : "text-muted-foreground hover:bg-muted/10 hover:text-foreground"
           )}
         >
           Suggestion Box
         </button>
         {isAdmin && (
           <button 
             onClick={() => setActiveTab('ADMIN')}
             className={cn(
               "px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border border-transparent",
               activeTab === 'ADMIN' ? "bg-primary text-white shadow-md shadow-primary/10" : "text-muted-foreground hover:bg-muted/10 hover:text-foreground"
             )}
           >
             Admin Panel
           </button>
         )}
      </div>

      <div className="min-h-[500px]">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center opacity-30 gap-4">
             <Loader2 className="w-10 h-10 animate-spin text-primary" />
             <span className="text-[10px] font-black uppercase tracking-widest">Synchronizing Sentiment...</span>
          </div>
        ) : (
          <>
            {activeTab === 'POLLS' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {polls.map((poll) => (
                   <PollCard key={poll._id} poll={poll} onVote={handleVote} currentUserId={user?.id || ''} />
                 ))}
                 {polls.length === 0 && (
                   <div className="col-span-full py-32 text-center opacity-20 flex flex-col items-center gap-4">
                      <VoteIcon size={64} strokeWidth={1} />
                      <p className="text-[11px] font-black uppercase tracking-widest">No active polls at this moment</p>
                   </div>
                 )}
              </div>
            )}

            {activeTab === 'FEEDBACK' && (
              <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                 <div className="bg-card border border-divider rounded-[32px] p-10 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                       <MessageSquare size={120} strokeWidth={1} />
                    </div>
                    <div className="relative z-10 space-y-6">
                       <div>
                          <h2 className="text-3xl font-black uppercase tracking-tight">Speak your <span className="text-primary">Mind</span></h2>
                          <p className="text-xs text-muted-foreground mt-2 font-medium">Your feedback is sent directly to management. Choose anonymity for complete privacy.</p>
                       </div>
                       
                       <form onSubmit={submitFeedback} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</label>
                                <select 
                                  name="category"
                                  className="w-full h-11 px-4 bg-muted/20 border border-divider rounded-xl text-xs font-bold focus:border-primary/50 outline-none transition-all"
                                >
                                   <option>Infrastructure</option>
                                   <option>Organization Culture</option>
                                   <option>Management & Leadership</option>
                                   <option>Project Ideas</option>
                                   <option>Employee Wellbeing</option>
                                   <option>Other</option>
                                </select>
                             </div>
                             <div className="flex flex-col justify-end">
                                <label className="flex items-center gap-3 p-3 bg-muted/20 border border-divider rounded-xl cursor-pointer hover:bg-muted/30 transition-all select-none">
                                   <input type="checkbox" name="isAnonymous" defaultChecked className="w-4 h-4 rounded border-divider text-primary focus:ring-primary/20 accent-primary" />
                                   <div>
                                      <p className="text-[10px] font-black uppercase tracking-widest leading-none">Remain Anonymous</p>
                                      <p className="text-[8px] text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Identity will be hidden</p>
                                   </div>
                                </label>
                             </div>
                          </div>

                          <div className="space-y-1.5">
                             <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Comments / Suggestion</label>
                             <textarea 
                               name="content"
                               required
                               rows={6}
                               placeholder="Type your message here..."
                               className="w-full p-5 bg-muted/20 border border-divider rounded-2xl text-sm font-medium focus:border-primary/50 outline-none transition-all resize-none"
                             />
                          </div>

                          <Button type="submit" className="w-full h-12 rounded-2xl text-xs font-black uppercase tracking-widest gap-3 shadow-xl shadow-primary/20">
                             <Send size={18} />
                             Transmit Feedback
                          </Button>
                       </form>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'ADMIN' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                 <div className="bg-card border border-divider rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-divider flex items-center justify-between bg-muted/5">
                       <h3 className="text-sm font-black uppercase tracking-widest">Incoming Feedback Manifest</h3>
                       <div className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black rounded-lg border border-primary/20">
                          {feedback.length} Entries
                       </div>
                    </div>
                    <div className="overflow-x-auto">
                       <table className="w-full text-left border-collapse">
                          <thead>
                             <tr className="border-b border-divider/40">
                                <th className="p-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Sender</th>
                                <th className="p-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Category</th>
                                <th className="p-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Content</th>
                                <th className="p-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                                <th className="p-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-divider/30">
                             {feedback.map((fb) => (
                               <tr key={fb._id} className="group hover:bg-muted/5 transition-colors">
                                  <td className="p-5">
                                     <div className="flex items-center gap-3">
                                        {fb.isAnonymous ? (
                                           <>
                                              <div className="w-8 h-8 rounded-lg bg-muted border border-divider flex items-center justify-center text-muted-foreground">
                                                 <ShieldCheck size={16} />
                                              </div>
                                              <span className="text-[11px] font-black uppercase opacity-40">Anonymous</span>
                                           </>
                                        ) : (
                                           <>
                                              <div className="avatar w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black border border-primary/20 uppercase">
                                                 {fb.userId?.firstName?.[0]}{fb.userId?.lastName?.[0]}
                                              </div>
                                              <div>
                                                 <p className="text-[11px] font-black text-foreground">{fb.userId?.firstName} {fb.userId?.lastName}</p>
                                                 <p className="text-[8px] text-muted-foreground uppercase tracking-widest opacity-40">{format(new Date(fb.createdAt), 'MMM dd, HH:mm')}</p>
                                              </div>
                                           </>
                                        )}
                                     </div>
                                  </td>
                                  <td className="p-5">
                                     <span className="px-2 py-0.5 bg-muted rounded-md text-[8px] font-black uppercase tracking-widest border border-divider opacity-60">
                                        {fb.category}
                                     </span>
                                  </td>
                                  <td className="p-5">
                                     <p className="text-[10px] font-medium text-muted-foreground max-w-[300px] line-clamp-2 leading-relaxed opacity-80">
                                        "{fb.content}"
                                     </p>
                                  </td>
                                  <td className="p-5 text-[9px] font-black uppercase tracking-widest">
                                     {fb.status === 'OPEN' && <span className="text-amber-500">New Entry</span>}
                                     {fb.status === 'REVIEWED' && <span className="text-primary">Under Review</span>}
                                     {fb.status === 'RESOLVED' && <span className="text-emerald-500">Resolved</span>}
                                  </td>
                                  <td className="p-5 text-right">
                                     <div className="flex gap-2 justify-end">
                                        {fb.status !== 'RESOLVED' && (
                                           <button 
                                             onClick={() => updateFBStatus(fb._id, 'RESOLVED')}
                                             className="text-[9px] font-black uppercase tracking-widest text-emerald-500 hover:underline"
                                           >
                                              Resolve
                                           </button>
                                        )}
                                        {fb.status === 'OPEN' && (
                                           <button 
                                             onClick={() => updateFBStatus(fb._id, 'REVIEWED')}
                                             className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline"
                                           >
                                              Investigate
                                           </button>
                                        )}
                                     </div>
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
              </div>
            )}
          </>
        )}
      </div>

      {isPollModalOpen && (
        <PollModal 
          onClose={() => setIsPollModalOpen(false)}
          onSuccess={() => { setIsPollModalOpen(false); fetchData(); }}
        />
      )}
    </div>
  );

  async function updateFBStatus(id: string, status: string) {
    try {
      await api.patch(`/polls/feedback/${id}`, { status });
      toast.success(`Marked as ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Update failed');
    }
  }
}

function PollCard({ poll, onVote, currentUserId }: { poll: any, onVote: (id: string, idx: number) => void, currentUserId: string }) {
  const hasVoted = poll.votedUserIds.includes(currentUserId);
  const isExpired = poll.status === 'EXPIRED';
  const showResults = hasVoted || isExpired;
  
  const totalVotes = poll.options.reduce((acc: number, curr: any) => acc + curr.count, 0);

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className={cn(
      "bg-card border border-divider rounded-[28px] p-8 shadow-sm flex flex-col gap-6 group transition-all relative overflow-hidden",
      poll.isUrgent && "border-amber-500/30 bg-amber-500/[0.02]"
    )}>
       {poll.isUrgent && (
          <div className="absolute top-0 right-0 px-4 py-1.5 bg-amber-500 text-black text-[8px] font-black uppercase tracking-[0.2em] rounded-bl-2xl flex items-center gap-1.5 animate-pulse">
             <AlertCircle size={10} /> Urgent Broadcast
          </div>
       )}

       <div className="flex items-start justify-between">
          <div className="px-3 py-1 bg-muted/50 rounded-lg border border-divider flex items-center gap-2">
             <Clock size={12} className={cn(isExpired ? "text-red-500" : "text-emerald-500")} />
             <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                {isExpired ? 'Manifest Finalized' : `Ends ${formatDistanceToNow(new Date(poll.expiresAt))} from now`}
             </span>
          </div>
          {showResults && (
             <div className="text-[9px] font-black uppercase tracking-widest opacity-40">
                {totalVotes} total responses
             </div>
          )}
       </div>

       <h3 className="text-xl font-black uppercase tracking-tight leading-snug group-hover:text-primary transition-colors pr-10">{poll.question}</h3>

       {showResults ? (
          <div className="space-y-4 animate-in fade-in duration-700">
             <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart layout="vertical" data={poll.options} margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--divider)" opacity={0.3} />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="text" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 9, fontWeight: 900 }}
                        width={60}
                      />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--divider)', borderRadius: '12px' }}
                        itemStyle={{ fontSize: '10px', fontWeight: 900 }}
                      />
                      <Bar 
                        dataKey="count" 
                        radius={[0, 4, 4, 0]}
                        animationDuration={1500}
                     >
                        {poll.options.map((entry: any, index: number) => (
                           <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                     </Bar>
                   </BarChart>
                </ResponsiveContainer>
             </div>
             
             {hasVoted && (
                <div className="flex items-center justify-center gap-2 p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest">
                   <ShieldCheck size={14} /> Your secure vote has been manifested
                </div>
             )}
          </div>
       ) : (
          <div className="space-y-3 pt-2">
             {poll.options.map((opt: any, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => onVote(poll._id, idx)}
                  className="w-full p-4 bg-muted/20 border border-divider rounded-2xl text-left hover:bg-primary/10 hover:border-primary/30 group/btn transition-all flex items-center justify-between"
                >
                   <span className="text-[11px] font-bold uppercase tracking-tight group-hover/btn:text-primary transition-colors">{opt.text}</span>
                   <ChevronRight size={14} className="opacity-0 group-hover/btn:opacity-100 transition-all -translate-x-2 group-hover/btn:translate-x-0" />
                </button>
             ))}
          </div>
       )}
    </div>
  );
}

function PollModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);

  const addOption = () => setOptions([...options, '']);
  const removeOption = (idx: number) => setOptions(options.filter((_, i) => i !== idx));
  const updateOption = (idx: number, val: string) => {
    const next = [...options];
    next[idx] = val;
    setOptions(next);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      question: formData.get('question'),
      expiresAt: formData.get('expiresAt'),
      isUrgent: formData.get('isUrgent') === 'on',
      options: options.filter(Boolean),
    };

    if (data.options.length < 2) return toast.error('Minimum 2 options required');
    
    setLoading(true);
    try {
      await api.post('/polls', data);
      toast.success('Poll Broadcasted');
      onSuccess();
    } catch (error) {
      toast.error('Manifest failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={onClose} />
       <div className="relative w-full max-w-xl bg-card border border-divider rounded-[32px] shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-200 h-[600px] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between">
             <h2 className="text-2xl font-black uppercase tracking-tight"><span className="text-primary">New</span> Poll Broadcast</h2>
             <button onClick={onClose} className="p-2 hover:bg-muted/50 rounded-xl transition-all opacity-40 hover:opacity-100"><X size={20}/></button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6 overflow-hidden">
             <div className="space-y-6 overflow-y-auto pr-4 custom-scrollbar flex-1">
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Polling Objective (Question)</label>
                   <input name="question" required className="w-full px-5 py-3.5 bg-muted/20 border border-divider rounded-2xl outline-none font-bold placeholder:opacity-20 text-sm focus:border-primary/50 transition-all" placeholder="What would you like to ask the organization?" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Manifest Duration (Expiry)</label>
                      <input name="expiresAt" type="datetime-local" required className="w-full px-5 py-3 bg-muted/20 border border-divider rounded-xl outline-none font-bold text-xs" />
                   </div>
                   <div className="flex items-end">
                      <label className="flex items-center gap-3 p-3 bg-muted/20 border border-divider rounded-xl cursor-pointer hover:bg-muted/30 transition-all select-none w-full">
                         <input type="checkbox" name="isUrgent" className="w-4 h-4 rounded border-divider text-amber-500 focus:ring-amber-500/20 accent-amber-500" />
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest leading-none text-amber-500">Urgent Broadcast</p>
                            <p className="text-[8px] text-muted-foreground uppercase tracking-widest mt-1 opacity-60">High-priority tagging</p>
                         </div>
                      </label>
                   </div>
                </div>

                <div className="space-y-3">
                   <div className="flex items-center justify-between mb-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Response Options</label>
                      <button type="button" onClick={addOption} className="text-[9px] font-black text-primary uppercase hover:underline">Add Option</button>
                   </div>
                   <div className="space-y-2">
                      {options.map((opt, idx) => (
                        <div key={idx} className="flex gap-2">
                           <input 
                             value={opt} 
                             onChange={(e) => updateOption(idx, e.target.value)} 
                             required 
                             placeholder={`Option ${idx + 1}`}
                             className="flex-1 px-4 py-2 bg-muted/20 border border-divider rounded-xl outline-none text-xs font-bold" 
                           />
                           {options.length > 2 && (
                             <button type="button" onClick={() => removeOption(idx)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><X size={16}/></button>
                           )}
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             <Button type="submit" disabled={loading} className="w-full h-12 rounded-[20px] text-xs font-black uppercase tracking-widest gap-2 shadow-xl shadow-primary/20">
                {loading ? <Loader2 className="animate-spin" /> : <Megaphone size={18} />}
                Broadcast Manifest
             </Button>
          </form>
       </div>
    </div>
  );
}
