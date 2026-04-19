'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/services/api';
import { Zap, ShieldAlert, ArrowLeft, Mail, RefreshCcw, Key } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [tokenReceived, setTokenReceived] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      toast.success('Recovery request initialized.');
      if (res.data.resetToken) {
        setTokenReceived(res.data.resetToken);
      }
    } catch (error: any) {
      toast.error(error.message || 'Verification failure');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] p-6 relative overflow-hidden selection:bg-primary/30">
      {/* Background Aura blurs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="absolute top-8 left-8 flex items-center gap-2">
        <div className="bg-primary p-1.5 rounded-lg text-white shadow-xl shadow-primary/20">
          <Zap size={16} fill="currentColor" strokeWidth={3} />
        </div>
        <span className="text-xl font-black tracking-widest text-white uppercase opacity-40">EPMS</span>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="astra-glass rounded-2xl border border-white/5 shadow-3xl overflow-hidden bg-white/[0.02]">
          <div className="p-8 pb-5 text-center space-y-2 border-b border-white/5 bg-white/[0.01]">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20 shadow-xl shadow-red-500/10">
               <ShieldAlert size={20} className="text-red-500" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-black text-white uppercase tracking-widest">Reset Password</h1>
            <p className="text-[9px] font-black text-red-500/40 uppercase tracking-[0.2em]">Account Recovery</p>
          </div>

          <div className="p-8 space-y-5">
            {!tokenReceived ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest text-center px-4 leading-relaxed">
                  Enter your corporate email to receive a secure recovery link.
                </p>
                <Input
                  label="Corporate Email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 text-xs font-bold bg-white/5 border-white/5 rounded-xl"
                />
                <Button type="submit" className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest group" isLoading={isLoading}>
                  Send Recovery Link <RefreshCcw size={14} className="ml-2 group-hover:rotate-180 transition-transform duration-700" />
                </Button>
              </form>
            ) : (
              <div className="space-y-5 text-center animate-in fade-in slide-in-from-bottom-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
                   <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Recovery Token Generated</p>
                   <p className="text-[9px] font-mono text-white/40 break-all select-all p-2.5 bg-black/40 rounded-lg border border-white/5">
                     {tokenReceived}
                   </p>
                   <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                     Use the token below to reset your password.
                   </p>
                </div>
                <Link href={`/reset-password?token=${tokenReceived}`}>
                   <Button className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest">
                     Update Password <Key size={14} className="ml-2" />
                   </Button>
                </Link>
              </div>
            )}
            
            <Link href="/login" className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">
              <ArrowLeft size={12} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
