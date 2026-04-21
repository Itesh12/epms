'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Plus,
  Search,
  Filter,
  HardDrive,
  Laptop,
  Monitor,
  Key,
  ShieldCheck,
  AlertTriangle,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  MoreVertical,
  Loader2,
  Box,
  CornerDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type TabType = 'inventory' | 'requests';

export default function AssetsPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<TabType>('inventory');
  const [summary, setSummary] = useState({ inStock: 0, assigned: 0, maintenance: 0, pendingRequests: 0 });
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const fetchSummary = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await api.get('/assets/summary');
      setSummary(res.data);
    } catch (error) {
      console.error('Failed to fetch summary', error);
    }
  }, [isAdmin]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'inventory') {
        const endpoint = isAdmin ? '/assets/all' : '/assets/my';
        const res = await api.get(endpoint);
        setItems(res.data);
      } else {
        const res = await api.get('/assets/requests');
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
      case 'ASSIGNED':
      case 'APPROVED':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'MAINTENANCE':
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'RETIRED':
      case 'REJECTED':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'STOCK':
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes('laptop')) return <Laptop size={14} />;
    if (c.includes('monitor')) return <Monitor size={14} />;
    if (c.includes('license') || c.includes('software')) return <Key size={14} />;
    return <HardDrive size={14} />;
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
             <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-md border border-primary/20">Resource Tracking</span>
          </div>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight leading-none">
            Asset & <span className="text-primary">Inventory</span>
          </h1>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none">Manage IT infrastructure, hardware allocations, and software manifest.</p>
        </div>

        <div className="flex gap-3">
          {isAdmin ? (
             <Button 
               onClick={() => setIsAssetModalOpen(true)}
               className="h-9 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 shadow-sm"
             >
               <Plus size={14} strokeWidth={3} />
               Register Asset
             </Button>
          ) : (
             <Button 
               onClick={() => setIsRequestModalOpen(true)}
               className="h-9 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 shadow-sm"
             >
               <Plus size={14} strokeWidth={3} />
               Request Asset
             </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-divider p-5 rounded-2xl relative overflow-hidden group shadow-sm">
             <div className="relative flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Box size={20} />
                </div>
                <div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">In Stock</p>
                   <h3 className="text-xl font-black tracking-tight">{summary.inStock}</h3>
                </div>
             </div>
          </div>

          <div className="bg-card border border-divider p-5 rounded-2xl relative overflow-hidden group shadow-sm">
             <div className="relative flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <ShieldCheck size={20} />
                </div>
                <div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Assigned</p>
                   <h3 className="text-xl font-black tracking-tight">{summary.assigned}</h3>
                </div>
             </div>
          </div>

          <div className="bg-card border border-divider p-5 rounded-2xl relative overflow-hidden group shadow-sm">
             <div className="relative flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <AlertTriangle size={20} />
                </div>
                <div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Maintenance</p>
                   <h3 className="text-xl font-black tracking-tight">{summary.maintenance}</h3>
                </div>
             </div>
          </div>

          <div className="bg-card border border-divider p-5 rounded-2xl relative overflow-hidden group shadow-sm">
             <div className="relative flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Clock size={20} />
                </div>
                <div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Requests</p>
                   <h3 className="text-xl font-black tracking-tight text-blue-500">{summary.pendingRequests}</h3>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-card border border-divider rounded-2xl overflow-hidden shadow-sm">
        <div className="flex border-b border-divider p-1.5 gap-1 bg-muted/5">
           <button 
             onClick={() => setActiveTab('inventory')}
             className={cn(
               "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
               activeTab === 'inventory' ? "bg-card text-foreground shadow-sm border border-divider" : "text-muted-foreground hover:bg-muted/10 opacity-60 hover:opacity-100"
             )}
           >
             {isAdmin ? 'Active Inventory' : 'My Assigned Assets'}
           </button>
           {isAdmin && (
             <button 
               onClick={() => setActiveTab('requests')}
               className={cn(
                 "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative",
                 activeTab === 'requests' ? "bg-card text-foreground shadow-sm border border-divider" : "text-muted-foreground hover:bg-muted/10 opacity-60 hover:opacity-100"
               )}
             >
               Allocation Requests
               {summary.pendingRequests > 0 && (
                 <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[8px] flex items-center justify-center rounded-full border-2 border-card ring-2 ring-primary/20 animate-pulse">
                   {summary.pendingRequests}
                 </span>
               )}
             </button>
           )}
        </div>

        <div className="p-6">
           <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
              <div className="relative flex-1 max-w-sm">
                 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40" size={14} />
                 <input 
                   disabled
                   placeholder="Quick search assets..."
                   className="w-full pl-10 pr-4 py-2 bg-muted/20 border border-divider rounded-xl text-[11px] font-bold opacity-50 cursor-not-allowed"
                 />
              </div>
              <div className="flex gap-2">
                 <Button variant="outline" className="h-9 rounded-xl border-divider gap-2 text-[9px] font-black uppercase tracking-widest opacity-50 px-4">
                   <Filter size={14} /> Filter
                 </Button>
              </div>
           </div>

           <div className="overflow-x-auto">
             {loading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 opacity-30">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Scanning Network...</span>
                </div>
             ) : items.length === 0 ? (
                <div className="py-20 text-center space-y-3 opacity-20">
                  <HardDrive size={48} className="mx-auto text-muted-foreground" strokeWidth={1} />
                  <p className="text-[10px] font-black uppercase tracking-widest px-4">Database Empty</p>
                </div>
             ) : (
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="border-b border-divider/40">
                         {activeTab === 'inventory' ? (
                           <>
                             <th className="pb-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest px-2">Asset Details</th>
                             <th className="pb-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest px-2">Identifier</th>
                             <th className="pb-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest px-2">Assignment</th>
                             <th className="pb-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest px-2">Warranty</th>
                             <th className="pb-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest px-2 text-right">Status</th>
                           </>
                         ) : (
                           <>
                             <th className="pb-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest px-2">Requester</th>
                             <th className="pb-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest px-2 text-center">Category</th>
                             <th className="pb-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest px-2">Justification</th>
                             <th className="pb-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest px-2 text-right">Action</th>
                           </>
                         )}
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-divider/30">
                      {items.map((item) => (
                        <tr key={item._id} className="group hover:bg-muted/5 transition-colors">
                           {activeTab === 'inventory' ? (
                             <>
                               <td className="py-4 px-2">
                                  <div className="flex items-center gap-3">
                                     <div className="w-9 h-9 rounded-xl bg-muted border border-divider flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                       {getCategoryIcon(item.category)}
                                     </div>
                                     <div>
                                        <p className="text-[11px] font-black text-foreground">{item.name}</p>
                                        <p className="text-[8px] text-muted-foreground uppercase tracking-widest opacity-40">{item.category}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="py-4 px-2">
                                  <p className="text-[10px] font-bold text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-lg border border-divider inline-block uppercase">{item.identifier}</p>
                               </td>
                               <td className="py-4 px-2">
                                  {item.assignedTo ? (
                                    <div className="flex items-center gap-2">
                                       <div className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                         <User size={10} />
                                       </div>
                                       <p className="text-[10px] font-black text-foreground">{item.assignedTo.firstName} {item.assignedTo.lastName}</p>
                                    </div>
                                  ) : (
                                    <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Available</span>
                                  )}
                               </td>
                               <td className="py-4 px-2">
                                  <p className="text-[10px] font-bold text-muted-foreground opacity-60">
                                    {item.warrantyExpiry ? format(new Date(item.warrantyExpiry), 'MMM yyyy') : '--'}
                                  </p>
                               </td>
                               <td className="py-4 px-2 text-right">
                                  <div className="flex flex-col items-end gap-1.5 focus-within:opacity-100">
                                     <span className={cn(
                                       "flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border transition-all shadow-sm",
                                       getStatusStyle(item.status)
                                     )}>
                                       {item.status}
                                     </span>
                                     {isAdmin && (
                                       <div className="flex gap-2">
                                          <button 
                                            onClick={() => {/* Update Logic */}}
                                            className="text-[8px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors hover:underline"
                                          >
                                            Maintenance
                                          </button>
                                       </div>
                                     )}
                                  </div>
                               </td>
                             </>
                           ) : (
                             <>
                               <td className="py-4 px-2">
                                  <div className="flex items-center gap-2.5">
                                     <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black uppercase">
                                       {item.userId?.firstName?.[0]}{item.userId?.lastName?.[0]}
                                     </div>
                                     <div>
                                        <p className="text-[11px] font-black uppercase tracking-tighter">{item.userId?.firstName} {item.userId?.lastName}</p>
                                        <p className="text-[8px] text-muted-foreground uppercase tracking-widest opacity-40">{format(new Date(item.createdAt), 'MMM dd, HH:mm')}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="py-4 px-2 text-center">
                                  <span className="px-2 py-0.5 bg-muted/50 rounded-md text-[8px] font-black uppercase tracking-widest border border-divider">
                                    {item.assetCategory}
                                  </span>
                               </td>
                               <td className="py-4 px-2">
                                  <p className="text-[10px] font-bold text-muted-foreground italic leading-tight max-w-[200px]">"{item.justification}"</p>
                               </td>
                               <td className="py-4 px-2 text-right">
                                  <div className="flex gap-2 justify-end">
                                     <button 
                                       onClick={() => updateRequestStatus(item._id, 'APPROVED')}
                                       className="h-7 px-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
                                     >
                                       Approve
                                     </button>
                                     <button 
                                       onClick={() => updateRequestStatus(item._id, 'REJECTED')}
                                       className="h-7 px-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all"
                                     >
                                       Decline
                                     </button>
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

      {isAssetModalOpen && (
        <AssetModal 
          onClose={() => setIsAssetModalOpen(false)}
          onSuccess={() => {
            setIsAssetModalOpen(false);
            fetchData();
            fetchSummary();
          }}
        />
      )}

      {isRequestModalOpen && (
        <RequestModal 
          onClose={() => setIsRequestModalOpen(false)}
          onSuccess={() => {
            setIsRequestModalOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );

  async function updateRequestStatus(id: string, status: string) {
    try {
      await api.patch(`/assets/requests/${id}`, { status });
      toast.success(`Request ${status}`);
      fetchData();
      fetchSummary();
    } catch (error) {
      toast.error('Processing failed');
    }
  }
}

function AssetModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [assetType, setAssetType] = useState('HARDWARE');
  
  const typeOptions: SelectOption[] = [
    { value: 'HARDWARE', label: 'Hardware (Device)' },
    { value: 'SOFTWARE', label: 'Software (License)' },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      type: assetType,
      category: formData.get('category'),
      identifier: formData.get('identifier'),
      purchaseDate: formData.get('purchaseDate') || undefined,
      warrantyExpiry: formData.get('warrantyExpiry') || undefined,
      totalSeats: assetType === 'SOFTWARE' ? Number(formData.get('totalSeats')) : 0,
    };

    try {
      await api.post('/assets', data);
      toast.success('Asset manifested');
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
      <div className="relative w-full max-w-lg bg-card border border-divider rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
         <h2 className="text-xl font-black uppercase tracking-tight">Register <span className="text-primary">New Resource</span></h2>
         <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
               <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Asset Name</label>
                  <input name="name" required className="w-full px-4 py-2 border border-divider bg-muted/20 rounded-xl outline-none text-xs font-bold" placeholder="e.g., MacBook Pro M3" />
               </div>
               <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Resource Type</label>
                  <CustomSelect value={assetType} onChange={setAssetType} options={typeOptions} className="py-2 rounded-xl bg-muted/20 text-xs" />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
               <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Industry Category</label>
                  <input name="category" required className="w-full px-4 py-2 border border-divider bg-muted/20 rounded-xl outline-none text-xs font-bold" placeholder="Laptop, License, Router..." />
               </div>
               <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Identifier (Serial/Key)</label>
                  <input name="identifier" required className="w-full px-4 py-2 border border-divider bg-muted/20 rounded-xl outline-none text-xs font-bold uppercase" placeholder="SN-XXXX-XXXX" />
               </div>
            </div>

            {assetType === 'SOFTWARE' && (
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Available Seats (Subscription)</label>
                <input name="totalSeats" type="number" required className="w-full px-4 py-2 border border-divider bg-muted/20 rounded-xl outline-none text-xs font-bold" placeholder="0" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
               <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Purchase Date</label>
                  <input name="purchaseDate" type="date" className="w-full px-4 py-2 border border-divider bg-muted/20 rounded-xl outline-none text-xs font-bold" />
               </div>
               <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Warranty Expiry</label>
                  <input name="warrantyExpiry" type="date" className="w-full px-4 py-2 border border-divider bg-muted/20 rounded-xl outline-none text-xs font-bold" />
               </div>
            </div>

            <div className="flex gap-3 pt-2">
               <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-10 rounded-xl uppercase tracking-widest text-[9px] font-black">Cancel</Button>
               <Button type="submit" disabled={loading} className="flex-1 h-10 rounded-xl uppercase tracking-widest text-[9px] font-black shadow-md shadow-primary/10">
                 {loading ? 'Creating...' : 'Finalize Registry'}
               </Button>
            </div>
         </form>
      </div>
    </div>
  );
}

function RequestModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      assetCategory: formData.get('assetCategory'),
      justification: formData.get('justification'),
    };

    try {
      await api.post('/assets/request', data);
      toast.success('Request sent to HQ');
      onSuccess();
    } catch (error) {
      toast.error('Transmission error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border border-divider rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
         <h2 className="text-xl font-black uppercase tracking-tight">Resource <span className="text-primary">Requisition</span></h2>
         <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
               <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Required Category</label>
               <input name="assetCategory" required className="w-full px-4 py-2 border border-divider bg-muted/20 rounded-xl outline-none text-xs font-bold" placeholder="e.g., Performance Monitor, IDE Key..." />
            </div>
            <div className="space-y-1">
               <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Business Justification</label>
               <textarea name="justification" required rows={3} className="w-full px-4 py-2 border border-divider bg-muted/20 rounded-xl outline-none text-xs font-bold resize-none" placeholder="State why this is required for your active pipeline..."/>
            </div>
            <div className="flex gap-3 pt-2">
               <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-10 rounded-xl uppercase tracking-widest text-[9px] font-black">Abort</Button>
               <Button type="submit" disabled={loading} className="flex-1 h-10 rounded-xl uppercase tracking-widest text-[9px] font-black shadow-md shadow-primary/10">
                 {loading ? 'Sending...' : 'Transmit Requisition'}
               </Button>
            </div>
         </form>
      </div>
    </div>
  );
}
