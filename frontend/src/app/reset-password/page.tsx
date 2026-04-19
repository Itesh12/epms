'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/services/api';
import { Zap, Key, ShieldCheck, ArrowRight, Lock } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) setToken(t);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: password
      });
      toast.success('Password updated successfully');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
      <div className="astra-glass rounded-[40px] border border-white/10 shadow-3xl overflow-hidden">
        <div className="p-10 pb-6 text-center space-y-3 bg-white/5 border-b border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 shadow-2xl shadow-emerald-500/20">
             <Key size={32} className="text-emerald-500" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter leading-none">Update Password</h1>
          <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.3em]">Account Synchronization</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-black/20">
          <div className="space-y-6">
            <Input
              label="Recovery Token"
              placeholder="Paste your token here..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              className="bg-white/5 font-mono text-[10px]"
            />
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/5"
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-white/5"
            />
          </div>

          <Button type="submit" className="w-full h-14 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/20 group" isLoading={isLoading} size="lg">
            Save New Password <ShieldCheck size={18} className="ml-3 group-hover:scale-110 transition-transform" />
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] p-6 relative overflow-hidden selection:bg-primary/30">
      {/* Background Aura blurs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="absolute top-10 left-10 flex items-center gap-3">
        <div className="bg-[var(--aura-primary)] p-2 rounded-xl text-white shadow-xl shadow-primary/20">
          <Zap size={22} fill="currentColor" strokeWidth={3} />
        </div>
        <span className="text-2xl font-black tracking-tighter text-white uppercase italic">EPMS</span>
      </div>

      <Suspense fallback={<div className="text-white font-black animate-pulse uppercase tracking-widest">Verifying Node...</div>}>
         <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
