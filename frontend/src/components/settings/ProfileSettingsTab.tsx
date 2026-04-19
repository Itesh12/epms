import { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';

export function ProfileSettingsTab() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Identity keys do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Security key must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await api.patch('/users/me/password', { oldPassword, newPassword });
      toast.success('Access protocol updated');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update access node');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 h-full flex flex-col">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
           <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Lock className="text-primary" size={20} strokeWidth={2.5} />
           </div>
           <h2 className="text-2xl font-black text-foreground tracking-tighter">
             Security & Encryption
           </h2>
        </div>
        <p className="text-muted-foreground/60 text-sm font-bold max-w-md italic">
          Rotate your access protocols. High-entropy security keys are strictly recommended for all system nodes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-lg">
        <Input 
          label="Current Access Key" 
          type="password" 
          placeholder="System verification required"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input 
            label="New Access Key" 
            type="password" 
            placeholder="Min 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input 
            label="Confirm Access Key" 
            type="password" 
            placeholder="Repeat protocol"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <div className="pt-8">
          <Button type="submit" disabled={isLoading} className="rounded-2xl min-w-[200px] h-14 text-xs font-black uppercase tracking-[0.2em]">
             {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
             Rotate Access Key
          </Button>
        </div>
      </form>

      <div className="mt-auto pt-12 border-t border-white/5 opacity-30 group cursor-help">
         <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 group-hover:text-primary transition-colors">Compliance Notice</p>
         <p className="text-[9px] font-bold leading-relaxed max-w-sm italic">
           Passwords are hashed via production-grade cryptographic layers before planetary transmission.
         </p>
      </div>
    </div>
  );
}
