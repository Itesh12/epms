'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Zap, ShieldCheck, ArrowRight, Lock, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response: any = await api.post('/auth/login', formData);
      const { user, accessToken, refreshToken } = response.data;
      
      setAuth(user, accessToken, refreshToken);
      toast.success('Login Successful');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] p-6 relative overflow-hidden selection:bg-primary/30">
      {/* Background Aura blurs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-indigo-500/5 blur-[100px] rounded-full animate-pulse delay-700" />
      </div>

      {/* Decorative Brand Header */}
      <div className="absolute top-10 left-10 flex items-center gap-3">
        <div className="bg-[var(--aura-primary)] p-2 rounded-xl text-white shadow-xl shadow-primary/20">
          <Zap size={22} fill="currentColor" strokeWidth={3} />
        </div>
        <span className="text-2xl font-black tracking-tighter text-white uppercase italic">EPMS</span>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="astra-glass rounded-[40px] border border-white/10 shadow-3xl overflow-hidden shadow-black/50">
          <div className="p-10 pb-6 text-center space-y-3 bg-white/5 border-b border-white/5">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6 border border-primary/30 shadow-2xl shadow-primary/20 animate-pulse">
               <Lock size={32} className="text-primary" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter leading-none">Account Access</h1>
            <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.3em]">Corporate Portal Login</p>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-black/20">
            <div className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-white/5"
              />
              <div className="space-y-2">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="bg-white/5"
                />
                <div className="flex justify-end px-1">
                  <Link href="/forgot-password" className="text-[10px] font-black uppercase tracking-[0.1em] text-primary/60 hover:text-primary transition-colors">
                    Forgot Password?
                  </Link>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-14 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/20 group" isLoading={isLoading} size="lg">
              Sign In <ArrowRight size={18} className="ml-3 group-hover:translate-x-1.5 transition-transform" />
            </Button>
          </form>

          <div className="p-10 pt-6 text-center border-t border-white/5 bg-white/5">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">New to EPMS?</p>
            <Link href="/signup">
               <Button variant="ghost" className="w-full h-12 rounded-xl text-[11px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 border border-primary/20 hover:border-primary shadow-none">
                 Create Organization Account
               </Button>
            </Link>
          </div>
        </div>
        
        <div className="mt-8 text-center opacity-20 hover:opacity-100 transition-opacity duration-500">
           <p className="text-[9px] font-black text-white uppercase tracking-[0.5em] leading-relaxed">
             EPMS Enterprise Management System &copy; {new Date().getFullYear()}. <br />
             All Systems Operational.
           </p>
        </div>
      </div>
    </div>
  );
}
