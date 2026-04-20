'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  AlertCircle,
  CheckCircle2,
  Info,
  Clock,
  Power,
  PowerOff,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function AnnouncementsPage() {
  const isAdmin = useAuthStore((state) => state.user?.role === 'ADMIN');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedType, setSelectedType] = useState('INFO');

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data);
    } catch (error) {
      toast.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleToggleStatus = async (item: any) => {
    try {
      await api.patch(`/announcements/${item._id}`, { isActive: !item.isActive });
      toast.success(`Broadcasting ${item.isActive ? 'stopped' : 'started'}`);
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const typeConfig: any = {
    INFO: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    SUCCESS: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    WARNING: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    CRITICAL: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  };

  const typeOptions: SelectOption[] = [
    { value: 'INFO', label: 'Info (Blue)', icon: <Info size={14}/>, color: 'text-blue-500' },
    { value: 'SUCCESS', label: 'Success (Green)', icon: <CheckCircle2 size={14}/>, color: 'text-emerald-500' },
    { value: 'WARNING', label: 'Warning (Amber)', icon: <AlertCircle size={14}/>, color: 'text-amber-500' },
    { value: 'CRITICAL', label: 'Critical (Red)', icon: <AlertCircle size={14}/>, color: 'text-red-500' },
  ];

  if (!isAdmin) return <div className="p-20 text-center font-black uppercase tracking-widest opacity-20">Access Denied</div>;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
             <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary/20">Admin Control</span>
          </div>
          <h1 className="text-4xl font-black text-foreground uppercase tracking-tight leading-none">
            Broadcasting <span className="text-primary">Center</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium opacity-60">Manage system-wide announcements and critical organization updates.</p>
        </div>

        <Button 
          onClick={() => {
            setEditingItem(null);
            setSelectedType('INFO');
            setIsModalOpen(true);
          }}
          className="h-12 px-8 rounded-2xl text-[11px] font-black uppercase tracking-widest gap-2.5 shadow-xl shadow-primary/20"
        >
          <Plus size={18} strokeWidth={3} />
          Create Broadcast
        </Button>
      </div>

      <div className="bg-card border border-divider rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-divider flex flex-col md:flex-row gap-4 justify-between bg-muted/5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              placeholder="Search announcements..."
              className="w-full pl-11 pr-4 py-3 bg-card border border-divider rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="h-11 rounded-xl border-divider gap-2 text-xs">
               <Filter size={16} /> Filters
             </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-40">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <span className="text-xs font-black uppercase tracking-widest">Loading Pipeline...</span>
            </div>
          ) : announcements.length === 0 ? (
            <div className="py-24 text-center space-y-4 opacity-30">
              <Megaphone size={60} className="mx-auto text-muted-foreground" strokeWidth={1} />
              <p className="text-sm font-black uppercase tracking-widest">No active broadcasts found</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/10 border-b border-divider">
                  <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Announcement</th>
                  <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Type</th>
                  <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Expires</th>
                  <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider/50">
                {announcements.map((item) => {
                  const cfg = typeConfig[item.type] || typeConfig.INFO;
                  const isExpired = item.expiresAt && new Date(item.expiresAt) < new Date();

                  return (
                    <tr key={item._id} className="group hover:bg-muted/5 transition-colors">
                      <td className="px-8 py-6">
                        <button 
                          onClick={() => handleToggleStatus(item)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                            item.isActive && !isExpired 
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                              : "bg-muted text-muted-foreground opacity-50"
                          )}
                        >
                          {item.isActive && !isExpired ? (
                            <>
                              <Power size={12} strokeWidth={3} /> Broadcasting
                            </>
                          ) : (
                            <>
                              <PowerOff size={12} strokeWidth={3} /> Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-8 py-6">
                         <div className="space-y-1 max-w-sm">
                           <h4 className="text-sm font-black text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">{item.title}</h4>
                           <p className="text-xs text-muted-foreground line-clamp-1 opacity-60">{item.content}</p>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border", cfg.bg, cfg.color.replace('text-', 'border-').concat('/20'))}>
                           <cfg.icon size={14} className={cfg.color} />
                           <span className={cn("text-[10px] font-black uppercase tracking-widest", cfg.color)}>{item.type}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-2 text-muted-foreground">
                           <Clock size={14} className="opacity-40" />
                           <span className={cn("text-xs font-medium", isExpired && "text-red-500 font-bold")}>
                             {item.expiresAt ? format(new Date(item.expiresAt), 'MMM dd, yyyy') : 'Never'}
                           </span>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary"
                             onClick={() => {
                               setEditingItem(item);
                               setSelectedType(item.type);
                               setIsModalOpen(true);
                             }}
                           >
                             <Edit2 size={16} />
                           </Button>
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             className="h-9 w-9 rounded-xl hover:bg-red-500/10 hover:text-red-500"
                             onClick={() => handleDelete(item._id)}
                           >
                             <Trash2 size={16} />
                           </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-card border border-divider rounded-[32px] shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-300">
             <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  {editingItem ? 'Edit' : 'Create'} <span className="text-primary">Broadcast</span>
                </h2>
             </div>

             <form className="space-y-5" onSubmit={async (e) => {
               e.preventDefault();
               const form = e.currentTarget;
               const formData = new FormData(form);
               const data = {
                 title: formData.get('title'),
                 content: formData.get('content'),
                 type: selectedType,
                 expiresAt: formData.get('expiresAt') || null,
                 isActive: formData.get('isActive') === 'true'
               };

               try {
                 if (editingItem) {
                   await api.patch(`/announcements/${editingItem._id}`, data);
                   toast.success('Broadcast updated');
                 } else {
                   await api.post('/announcements', data);
                   toast.success('News broadcasted successfully');
                 }
                 setIsModalOpen(false);
                 fetchAnnouncements();
               } catch {
                 toast.error('Failed to process broadcast');
               }
             }}>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Headline</label>
                   <input 
                     name="title" 
                     required 
                     defaultValue={editingItem?.title}
                     placeholder="Urgent maintenance or company news..."
                     className="w-full px-5 py-3.5 rounded-2xl border border-divider bg-muted/20 focus:ring-2 focus:ring-primary/20 outline-none font-bold placeholder:opacity-30" 
                   />
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Content</label>
                   <textarea 
                     name="content" 
                     required 
                     rows={3}
                     defaultValue={editingItem?.content}
                     placeholder="Provide details for the employees..."
                     className="w-full px-5 py-3.5 rounded-2xl border border-divider bg-muted/20 focus:ring-2 focus:ring-primary/20 outline-none font-medium placeholder:opacity-30 resize-none" 
                   />
                </div>

                <div className="grid grid-cols-2 gap-5">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Type</label>
                      <CustomSelect 
                        value={selectedType}
                        onChange={setSelectedType}
                        options={typeOptions}
                        className="py-3.5 rounded-2xl bg-muted/20"
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Expiry Date</label>
                      <input 
                        name="expiresAt" 
                        type="date" 
                        defaultValue={editingItem?.expiresAt ? new Date(editingItem.expiresAt).toISOString().split('T')[0] : ''}
                        className="w-full px-5 py-3.5 rounded-2xl border border-divider bg-muted/20 focus:ring-2 focus:ring-primary/20 outline-none font-bold placeholder:opacity-30" 
                      />
                   </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-2xl border border-divider">
                   <input 
                     type="checkbox" 
                     name="isActive" 
                     id="isActive"
                     value="true"
                     defaultChecked={editingItem ? editingItem.isActive : true}
                     className="w-5 h-5 rounded-lg accent-primary" 
                   />
                   <label htmlFor="isActive" className="text-xs font-bold text-foreground">Make this broadcast active immediately</label>
                </div>

                <div className="flex gap-4 pt-4">
                   <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 rounded-2xl uppercase tracking-widest text-[10px] font-black">Cancel</Button>
                   <Button type="submit" className="flex-1 h-12 rounded-2xl uppercase tracking-widest text-[10px] font-black shadow-lg shadow-primary/20">
                     {editingItem ? 'Save Changes' : 'Go Live'}
                   </Button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
