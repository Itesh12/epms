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
      toast.success('Organization updated successfully');
      setInitialName(orgName);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update organization');
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
        <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 h-full flex flex-col">
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
           <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Building2 className="text-primary" size={16} strokeWidth={2.5} />
           </div>
           <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
             Organization Settings
           </h2>
        </div>
        <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-widest max-w-md">
          Adjust the fundamental identity and branding of your workspace. Administrator access is required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <Input 
          label="Organization Name" 
          placeholder="e.g. Nexus Global"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          className="h-10 text-xs font-bold bg-muted/20 border-divider rounded-xl"
          required
        />

        <div className="pt-4 flex gap-3">
          <Button type="submit" disabled={isSaving || orgName === initialName} className="rounded-xl min-w-[160px] h-10 text-[10px] font-black uppercase tracking-widest">
             {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
             Save Changes
          </Button>
          {orgName !== initialName && (
            <Button type="button" variant="ghost" className="h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-foreground" onClick={() => setOrgName(initialName)}>
              Reset
            </Button>
          )}
        </div>
      </form>

      <div className="mt-auto pt-8 border-t border-divider opacity-50">
         <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
               <Building2 size={14} className="text-primary" />
            </div>
            <div>
               <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 leading-none mb-1">Organization ID</p>
               <p className="text-[9px] font-black text-primary tracking-widest leading-none">EPMS-ORG-001</p>
            </div>
         </div>
      </div>
    </div>
  );
}
