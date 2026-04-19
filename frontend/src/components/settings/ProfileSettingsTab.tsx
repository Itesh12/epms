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
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await api.patch('/users/me/password', { oldPassword, newPassword });
      toast.success('Password updated successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 h-full flex flex-col">
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
           <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Lock className="text-primary" size={16} strokeWidth={2.5} />
           </div>
           <h2 className="text-sm font-black text-white uppercase tracking-widest">
             Security & Password
           </h2>
        </div>
        <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-widest max-w-md">
          Update your login credentials. Use strong passwords for enhanced account security.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <Input 
          label="Current Password" 
          type="password" 
          placeholder="Existing password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="h-10 text-xs font-bold bg-white/5 border-white/5 rounded-xl"
          required
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="New Password" 
            type="password" 
            placeholder="Min 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="h-10 text-xs font-bold bg-white/5 border-white/5 rounded-xl"
            required
          />
          <Input 
            label="Confirm Password" 
            type="password" 
            placeholder="Repeat new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-10 text-xs font-bold bg-white/5 border-white/5 rounded-xl"
            required
          />
        </div>

        <div className="pt-4">
          <Button type="submit" disabled={isLoading} className="rounded-xl min-w-[160px] h-10 text-[10px] font-black uppercase tracking-widest">
             {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
             Update Password
          </Button>
        </div>
      </form>

      <div className="mt-auto pt-8 border-t border-white/5 opacity-50">
         <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-white/40 leading-none">Compliance Notice</p>
         <p className="text-[9px] font-black uppercase tracking-widest text-primary leading-tight max-w-sm">
           Passwords are encrypted before server transmission.
         </p>
      </div>
    </div>
  );
}
