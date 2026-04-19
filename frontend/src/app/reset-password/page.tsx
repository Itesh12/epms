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
      <div className="astra-glass rounded-2xl border border-white/5 shadow-3xl overflow-hidden bg-white/[0.02]">
        <div className="p-8 pb-5 text-center space-y-2 border-b border-white/5 bg-white/[0.01]">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
             <Key size={20} className="text-emerald-500" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-black text-white uppercase tracking-widest">Update Password</h1>
          <p className="text-[9px] font-black text-emerald-500/40 uppercase tracking-[0.2em]">Security Protocol</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-4">
            <Input
              label="Corporate Token"
              placeholder="Paste token here"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              className="h-10 text-[10px] font-mono bg-white/5 border-white/5 rounded-xl"
            />
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-10 text-xs font-bold bg-white/5 border-white/5 rounded-xl"
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-10 text-xs font-bold bg-white/5 border-white/5 rounded-xl"
            />
          </div>

          <Button type="submit" className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest group" isLoading={isLoading}>
            Reset Password <ShieldCheck size={14} className="ml-2 group-hover:scale-110 transition-transform" />
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

      <div className="absolute top-8 left-8 flex items-center gap-2">
        <div className="bg-primary p-1.5 rounded-lg text-white shadow-xl shadow-primary/20">
          <Zap size={16} fill="currentColor" strokeWidth={3} />
        </div>
        <span className="text-xl font-black tracking-widest text-white uppercase opacity-40">EPMS</span>
      </div>

      <Suspense fallback={<div className="text-[10px] text-white font-black animate-pulse uppercase tracking-widest">Checking Access...</div>}>
         <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
