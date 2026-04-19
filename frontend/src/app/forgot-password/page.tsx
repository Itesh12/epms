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

      <div className="absolute top-10 left-10 flex items-center gap-3">
        <div className="bg-[var(--aura-primary)] p-2 rounded-xl text-white shadow-xl shadow-primary/20">
          <Zap size={22} fill="currentColor" strokeWidth={3} />
        </div>
        <span className="text-2xl font-black tracking-tighter text-white uppercase italic">EPMS</span>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="astra-glass rounded-[40px] border border-white/10 shadow-3xl overflow-hidden">
          <div className="p-10 pb-6 text-center space-y-3 bg-white/5 border-b border-white/5">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6 border border-red-500/30 shadow-2xl shadow-red-500/20">
               <ShieldAlert size={32} className="text-red-500" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter leading-none">Password Recovery</h1>
            <p className="text-[10px] font-black text-red-500/60 uppercase tracking-[0.3em]">Identity Verification Portal</p>
          </div>

          <div className="p-10 space-y-8 bg-black/20">
            {!tokenReceived ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                <p className="text-xs text-white/40 font-bold italic text-center px-4 leading-relaxed">
                  Enter your registered email address. If the account exists, we will provide a secure recovery link.
                </p>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/5"
                />
                <Button type="submit" className="w-full h-14 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/20 group" isLoading={isLoading} size="lg">
                  Send Recovery Link <RefreshCcw size={18} className="ml-3 group-hover:rotate-180 transition-transform duration-700" />
                </Button>
              </form>
            ) : (
              <div className="space-y-8 text-center animate-in fade-in slide-in-from-bottom-4">
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-4">
                   <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Recovery Token Generated</p>
                   <p className="text-[9px] font-mono text-white/60 break-all select-all p-3 bg-black/40 rounded-xl border border-white/5">
                     {tokenReceived}
                   </p>
                   <p className="text-[9px] font-bold text-white/40 italic">
                     Normally this would be sent via email. <br /> Use the token below to reset your password.
                   </p>
                </div>
                <Link href={`/reset-password?token=${tokenReceived}`}>
                   <Button className="w-full h-14 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/20 group">
                     Update Password <Key size={18} className="ml-3" />
                   </Button>
                </Link>
              </div>
            )}
            
            <Link href="/login" className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
