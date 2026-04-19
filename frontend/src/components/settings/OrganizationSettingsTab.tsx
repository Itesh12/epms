import { useState, useEffect } from 'react';
import { Building2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';

export function OrganizationSettingsTab() {
  const [orgName, setOrgName] = useState('');
  const [initialName, setInitialName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchOrg() {
      try {
        const res = await api.get('/organizations/me');
        setOrgName(res.data.name);
        setInitialName(res.data.name);
      } catch (err) {
        console.error('Failed to load organization settings', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrg();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || orgName === initialName) return;

    setIsSaving(true);
    try {
      await api.patch('/organizations/me', { name: orgName });
      toast.success('Workspace logic synchronized');
      setInitialName(orgName);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update node configuration');
      if (err.response?.status === 403) {
        setOrgName(initialName);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex w-full h-full items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-primary/40" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 h-full flex flex-col">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
           <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Building2 className="text-primary" size={20} strokeWidth={2.5} />
           </div>
           <h2 className="text-2xl font-black text-foreground tracking-tighter">
             Workspace Parameters
           </h2>
        </div>
        <p className="text-muted-foreground/60 text-sm font-bold max-w-md italic">
          Adjust the fundamental identity of your organizational node. Only System Administrators hold the authority to finalize these changes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-lg">
        <Input 
          label="Organization Designation" 
          placeholder="e.g. Nexus Global"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          required
        />

        <div className="pt-8 flex gap-4">
          <Button type="submit" disabled={isSaving || orgName === initialName} className="rounded-2xl min-w-[200px] h-14 text-xs font-black uppercase tracking-[0.2em]">
             {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
             Synchronize Workspace
          </Button>
          {orgName !== initialName && (
            <Button type="button" variant="ghost" className="h-14 rounded-2xl" onClick={() => setOrgName(initialName)}>
              Abort
            </Button>
          )}
        </div>
      </form>

      <div className="mt-auto pt-12 border-t border-white/5 opacity-30">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
               <Building2 size={16} className="text-primary" />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em]">Legacy Node ID</p>
               <p className="text-[9px] font-bold text-muted-foreground/60">EPMS-ORG-PROTOCOL-001</p>
            </div>
         </div>
      </div>
    </div>
  );
}
