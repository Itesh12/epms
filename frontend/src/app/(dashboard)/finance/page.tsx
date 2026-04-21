'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  IndianRupee, 
  TrendingUp, 
  Receipt, 
  Wallet,
  Clock,
  Filter,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  ArrowUpRight,
  History,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type TabType = 'expenses' | 'payroll';

export default function FinancePage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';
  
  const [activeTab, setActiveTab] = useState<TabType>('expenses');
  const [summary, setSummary] = useState({ pendingExpenses: 0, totalPaidPayroll: 0 });
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);

  const fetchSummary = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await api.get('/finance/summary');
      setSummary(res.data);
    } catch (error) {
      console.error('Failed to fetch summary', error);
    }
  }, [isAdmin]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'expenses') {
        const endpoint = isAdmin ? '/finance/expenses/all' : '/finance/expenses/my';
        const res = await api.get(endpoint);
        setItems(res.data);
      } else {
        const res = await api.get('/finance/payroll');
        setItems(res.data);
      }
    } catch (error) {
      toast.error(`Failed to fetch ${activeTab}`);
    } finally {
      setLoading(false);
    }
  }, [activeTab, isAdmin]);

  useEffect(() => {
    fetchSummary();
    fetchData();
  }, [fetchSummary, fetchData]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'PAID':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'REJECTED':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'PENDING':
      default:
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    }
  };

  const statusIcons: any = {
    APPROVED: <CheckCircle2 size={12} />,
    PAID: <CheckCircle2 size={12} />,
    REJECTED: <XCircle size={12} />,
    PENDING: <Clock size={12} />,
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-700">
      {/* Header Section - Compact */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
             <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-md border border-primary/20">Financial Hub</span>
          </div>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight leading-none">
            Finance & <span className="text-primary">Payroll</span>
          </h1>
          <p className="text-[10px] text-muted-foreground/70 font-black uppercase tracking-widest">Monitor payouts, manage expenses, and track organization health.</p>
        </div>

        <div className="flex gap-3">
          {activeTab === 'expenses' ? (
             <Button 
               onClick={() => setIsExpenseModalOpen(true)}
               className="h-9 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 shadow-sm"
             >
               <Plus size={14} strokeWidth={3} />
               Submit Claim
             </Button>
          ) : isAdmin && (
             <Button 
               onClick={() => setIsPayrollModalOpen(true)}
               className="h-9 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 shadow-sm"
             >
               <Plus size={14} strokeWidth={3} />
               Generate Payroll
             </Button>
          )}
        </div>
      </div>

      {/* Admin Stats Grid - Tightened */}
      {isAdmin && (activeTab === 'payroll' || items.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-divider p-5 rounded-2xl relative overflow-hidden group shadow-sm transition-all duration-300 hover:border-primary/30">
             <div className="relative flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <AlertCircle size={20} />
                </div>
                <div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">Pending Expenses</p>
                   <h3 className="text-xl font-black tracking-tight">{summary.pendingExpenses}</h3>
                </div>
             </div>
          </div>

          <div className="bg-card border border-divider p-5 rounded-2xl relative overflow-hidden group shadow-sm transition-all duration-300 hover:border-primary/30">
             <div className="relative flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Wallet size={20} />
                </div>
                <div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">Total Paid (INR)</p>
                   <h3 className="text-xl font-black tracking-tight">₹{summary.totalPaidPayroll.toLocaleString()}</h3>
                </div>
             </div>
          </div>

          <div className="bg-card border border-divider p-5 rounded-2xl relative overflow-hidden group shadow-sm transition-all duration-300 hover:border-primary/30">
             <div className="relative flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <TrendingUp size={20} />
                </div>
                <div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">Organization Value</p>
                   <h3 className="text-xl font-black tracking-tight text-emerald-600 dark:text-emerald-500">Optimal</h3>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Main Content Area - Refined */}
      <div className="bg-card border border-divider rounded-2xl overflow-hidden shadow-sm">
        <div className="flex border-b border-divider p-1.5 gap-1 bg-muted/5">
           <button 
             onClick={() => setActiveTab('expenses')}
             className={cn(
               "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
               activeTab === 'expenses' ? "bg-card text-foreground shadow-sm border border-divider" : "text-muted-foreground hover:bg-muted/10 opacity-60 hover:opacity-100"
             )}
           >
             Claims & Expenses
           </button>
           <button 
             onClick={() => setActiveTab('payroll')}
             className={cn(
               "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
               activeTab === 'payroll' ? "bg-card text-foreground shadow-sm border border-divider" : "text-muted-foreground hover:bg-muted/10 opacity-60 hover:opacity-100"
             )}
           >
             Payroll & Payouts
           </button>
        </div>

        <div className="p-6">
           <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
              <div className="relative flex-1 max-w-sm">
                 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40" size={14} />
                 <input 
                   disabled
                   placeholder="Quick search records..."
                   className="w-full pl-10 pr-4 py-2 bg-muted/20 border border-divider rounded-xl text-[11px] font-bold opacity-50 cursor-not-allowed"
                 />
              </div>
              <div className="flex gap-2">
                 <Button variant="outline" className="h-9 rounded-xl border-divider gap-2 text-[9px] font-black uppercase tracking-widest opacity-50 px-4">
                   <Filter size={14} /> Filter
                 </Button>
                 <Button variant="outline" className="h-9 rounded-xl border-divider gap-2 text-[9px] font-black uppercase tracking-widest opacity-50 px-4">
                   <FileSpreadsheet size={14} /> Export
                 </Button>
              </div>
           </div>

           <div className="overflow-x-auto">
             {loading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 opacity-30">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Processing Data...</span>
                </div>
             ) : items.length === 0 ? (
                <div className="py-20 text-center space-y-3 opacity-20">
                  <History size={48} className="mx-auto text-muted-foreground" strokeWidth={1} />
                  <p className="text-[10px] font-black uppercase tracking-widest px-4">Empty Transaction History</p>
                </div>
             ) : (
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="border-b border-divider/40">
                         {activeTab === 'expenses' ? (
                           <>
                             <th className="pb-4 text-[9px] font-black text-muted-foreground/70 uppercase tracking-widest px-2">Employee</th>
                             <th className="pb-4 text-[9px] font-black text-muted-foreground/70 uppercase tracking-widest px-2 text-center">Category</th>
                             <th className="pb-4 text-[9px] font-black text-muted-foreground/70 uppercase tracking-widest px-2">Details</th>
                             <th className="pb-4 text-[9px] font-black text-muted-foreground/70 uppercase tracking-widest px-2">Amount</th>
                             <th className="pb-4 text-[9px] font-black text-muted-foreground/70 uppercase tracking-widest px-2 text-right">Status</th>
                           </>
                         ) : (
                           <>
                             <th className="pb-4 text-[9px] font-black text-muted-foreground/70 uppercase tracking-widest px-2">Employee</th>
                             <th className="pb-4 text-[9px] font-black text-muted-foreground/70 uppercase tracking-widest px-2">Period</th>
                             <th className="pb-4 text-[9px] font-black text-muted-foreground/70 uppercase tracking-widest px-2">Gross Payout</th>
                             <th className="pb-4 text-[9px] font-black text-muted-foreground/70 uppercase tracking-widest px-2">Adjustments</th>
                             <th className="pb-4 text-[9px] font-black text-muted-foreground/70 uppercase tracking-widest px-2">Net Salary</th>
                             <th className="pb-4 text-[9px] font-black text-muted-foreground/70 uppercase tracking-widest px-2 text-right">Status</th>
                           </>
                         )}
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-divider/30">
                      {items.map((item) => (
                        <tr key={item._id} className="group hover:bg-muted/5 transition-colors">
                           {activeTab === 'expenses' ? (
                             <>
                               <td className="py-4 px-2">
                                  <div className="flex items-center gap-2.5">
                                     <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black ring-1 ring-primary/20">
                                       {item.userId?.firstName?.[0]}{item.userId?.lastName?.[0] || '?'}
                                     </div>
                                     <div>
                                        <p className="text-[11px] font-black text-foreground">{item.userId?.firstName} {item.userId?.lastName}</p>
                                        <p className="text-[8px] text-muted-foreground/60 uppercase tracking-widest font-bold">{format(new Date(item.createdAt), 'MMM dd, yyyy')}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="py-4 px-2 text-center">
                                  <span className="px-2 py-0.5 bg-muted/50 rounded-md text-[8px] font-black uppercase tracking-widest border border-divider shadow-sm opacity-70">
                                    {item.category}
                                  </span>
                               </td>
                               <td className="py-4 px-2">
                                  <p className="text-[10px] font-bold text-muted-foreground/80 line-clamp-1 max-w-[200px]">{item.description}</p>
                               </td>
                               <td className="py-4 px-2">
                                  <p className="text-[11px] font-black text-foreground">₹{item.amount.toLocaleString()}</p>
                               </td>
                               <td className="py-4 px-2 text-right">
                                  <div className="flex flex-col items-end gap-1.5">
                                     <span className={cn(
                                       "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border transition-all shadow-sm",
                                       getStatusStyle(item.status)
                                     )}>
                                       {statusIcons[item.status]}
                                       {item.status}
                                     </span>
                                     {isAdmin && item.status === 'PENDING' && (
                                       <div className="flex gap-2">
                                          <button 
                                            onClick={() => updateExpenseStatus(item._id, 'APPROVED')}
                                            className="text-[8px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-600 transition-colors"
                                          >
                                            Confirm
                                          </button>
                                          <button 
                                            onClick={() => updateExpenseStatus(item._id, 'REJECTED')}
                                            className="text-[8px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                                          >
                                            Deny
                                          </button>
                                       </div>
                                     )}
                                  </div>
                               </td>
                             </>
                           ) : (
                             <>
                               <td className="py-4 px-2">
                                  <div>
                                     <p className="text-[11px] font-black text-foreground">{item.userId?.firstName} {item.userId?.lastName}</p>
                                     <p className="text-[8px] text-muted-foreground uppercase tracking-widest opacity-40 font-black">{item.userId?.employeeId || 'EPMS-USR'}</p>
                                  </div>
                               </td>
                               <td className="py-4 px-2">
                                  <p className="text-[9px] font-black uppercase tracking-widest opacity-70">{format(new Date(item.year, item.month), 'MMM yyyy')}</p>
                               </td>
                               <td className="py-4 px-2">
                                  <p className="text-[10px] font-bold text-muted-foreground">₹{item.baseSalary.toLocaleString()}</p>
                               </td>
                               <td className="py-4 px-2 text-[10px] font-black">
                                  <span className="text-emerald-600 dark:text-emerald-500">+₹{item.bonuses.toLocaleString()}</span>
                                  <span className="text-red-500/80 dark:text-red-400 opacity-60 ml-1">(-₹{item.deductions.toLocaleString()})</span>
                               </td>
                               <td className="py-4 px-2">
                                  <p className="text-[11px] font-black text-primary">₹{item.netAmount.toLocaleString()}</p>
                               </td>
                               <td className="py-4 px-2 text-right">
                                  <div className="flex flex-col items-end gap-1.5">
                                     <span className={cn(
                                       "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border shadow-sm",
                                       getStatusStyle(item.status)
                                     )}>
                                       {statusIcons[item.status]}
                                       {item.status}
                                     </span>
                                     {isAdmin && item.status === 'PENDING' && (
                                       <button 
                                         onClick={() => markPaid(item._id)}
                                         className="text-[8px] font-black uppercase tracking-widest text-primary hover:underline hover:opacity-80 transition-all font-black"
                                       >
                                         Disburse Funds
                                       </button>
                                     )}
                                  </div>
                               </td>
                             </>
                           )}
                        </tr>
                      ))}
                   </tbody>
                </table>
             )}
           </div>
        </div>
      </div>

      {isExpenseModalOpen && (
        <ExpenseModal 
          onClose={() => setIsExpenseModalOpen(false)} 
          onSuccess={() => {
            setIsExpenseModalOpen(false);
            fetchData();
          }}
        />
      )}

      {isPayrollModalOpen && (
        <PayrollModal 
          onClose={() => setIsPayrollModalOpen(false)}
          onSuccess={() => {
            setIsPayrollModalOpen(false);
            fetchData();
            fetchSummary();
          }}
        />
      )}
    </div>
  );

  async function updateExpenseStatus(id: string, status: string) {
    try {
      await api.patch(`/finance/expenses/${id}/status`, { status });
      toast.success(`Success: ${status}`);
      fetchData();
      fetchSummary();
    } catch (error) {
      toast.error('Operation failed');
    }
  }

  async function markPaid(id: string) {
    try {
      await api.patch(`/finance/payroll/${id}/pay`);
      toast.success('Funds Disbursed');
      fetchData();
      fetchSummary();
    } catch (error) {
      toast.error('Disbursement failed');
    }
  }
}

function ExpenseModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('OTHERS');

  const categories: SelectOption[] = [
    { value: 'TRAVEL', label: 'Travel', icon: <History size={12}/> },
    { value: 'MEALS', label: 'Meals' },
    { value: 'SOFTWARE', label: 'Software' },
    { value: 'HARDWARE', label: 'Hardware' },
    { value: 'OFFICE_SUPPLIES', label: 'Office Supplies' },
    { value: 'HEALTH', label: 'Health' },
    { value: 'OTHERS', label: 'Others' },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      amount: Number(formData.get('amount')),
      category: selectedCategory,
      description: formData.get('description'),
      receiptUrl: formData.get('receiptUrl') || undefined,
    };

    try {
      await api.post('/finance/expenses', data);
      toast.success('Submission Complete');
      onSuccess();
    } catch (error) {
      toast.error('Error submitting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card border border-divider rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
         <h2 className="text-xl font-black uppercase tracking-tight">Financial <span className="text-primary">Adjustment</span></h2>
         <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
               <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Amount (₹)</label>
                  <input name="amount" type="number" required className="w-full px-4 py-2 border border-divider bg-muted/20 rounded-xl outline-none text-xs font-bold" placeholder="0.00" />
               </div>
               <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category Type</label>
                  <CustomSelect value={selectedCategory} onChange={setSelectedCategory} options={categories} className="py-2 rounded-xl bg-muted/20 text-xs" />
               </div>
            </div>
            <div className="space-y-1">
               <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Adjustment Details</label>
               <textarea name="description" required rows={2} className="w-full px-4 py-2 border border-divider bg-muted/20 rounded-xl outline-none text-xs font-bold resize-none" placeholder="Provide context..."/>
            </div>
            <div className="space-y-1">
               <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Evidence URL (Optional)</label>
               <input name="receiptUrl" type="url" className="w-full px-4 py-2 border border-divider bg-muted/20 rounded-xl outline-none text-xs font-bold" placeholder="Reference link" />
            </div>
            <div className="flex gap-3 pt-2">
               <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-10 rounded-xl uppercase tracking-widest text-[9px] font-black">Abort</Button>
               <Button type="submit" disabled={loading} className="flex-1 h-10 rounded-xl uppercase tracking-widest text-[9px] font-black shadow-md shadow-primary/10">
                 {loading ? 'Processing...' : 'Confirm Submission'}
               </Button>
            </div>
         </form>
      </div>
    </div>
  );
}

function PayrollModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    api.get('/users').then((res: any) => setEmployees(res.data)).catch(() => {});
  }, []);

  const employeeOptions: SelectOption[] = employees.map(emp => ({
    value: emp._id,
    label: `${emp.firstName} ${emp.lastName}`
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return toast.error('Error: Select Identity');
    
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      userId: selectedUser,
      month: Number(formData.get('month')),
      year: Number(formData.get('year')),
      baseSalary: Number(formData.get('baseSalary')),
      bonuses: Number(formData.get('bonuses')) || 0,
      deductions: Number(formData.get('deductions')) || 0,
      notes: formData.get('notes'),
    };

    try {
      await api.post('/finance/payroll/generate', data);
      toast.success('Manifest Generated');
      onSuccess();
    } catch (error) {
      toast.error('Processing error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card border border-divider rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
         <h2 className="text-xl font-black uppercase tracking-tight">Generate <span className="text-primary">Manifest</span></h2>
         <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-1">
               <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Identity Selection</label>
               <CustomSelect value={selectedUser} onChange={setSelectedUser} options={employeeOptions} className="py-2.5 rounded-xl bg-muted/20 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
               <div>
                  <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Reporting Month</label>
                  <input name="month" type="number" defaultValue={new Date().getMonth()} className="w-full px-4 py-2 border border-divider bg-muted/20 rounded-xl outline-none text-xs font-bold" />
               </div>
               <div>
                  <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Calculation Year</label>
                  <input name="year" type="number" defaultValue={new Date().getFullYear()} className="w-full px-4 py-2 border border-divider bg-muted/20 rounded-xl outline-none text-xs font-bold" />
               </div>
            </div>
            <div className="space-y-1">
               <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Base Calculation (₹)</label>
               <input name="baseSalary" type="number" required className="w-full px-4 py-2 border border-divider bg-muted/20 rounded-xl outline-none text-xs font-bold" placeholder="0" />
            </div>
            <div className="grid grid-cols-2 gap-3">
               <div>
                  <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Applied Bonuses</label>
                  <input name="bonuses" type="number" defaultValue={0} className="w-full px-4 py-2 border border-divider bg-muted/20 rounded-xl outline-none text-xs font-bold" />
               </div>
               <div>
                   <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Total Deductions</label>
                   <input name="deductions" type="number" defaultValue={0} className="w-full px-4 py-2 border border-divider bg-muted/20 rounded-xl outline-none text-xs font-bold" />
               </div>
            </div>
            <div className="flex gap-3 pt-4">
               <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-11 rounded-xl uppercase tracking-widest text-[9px] font-black">Abort</Button>
               <Button type="submit" disabled={loading} className="flex-1 h-11 rounded-xl uppercase tracking-widest text-[9px] font-black shadow-md shadow-primary/10">
                 {loading ? 'Processing...' : 'Generate manifested Record'}
               </Button>
            </div>
         </form>
      </div>
    </div>
  );
}
