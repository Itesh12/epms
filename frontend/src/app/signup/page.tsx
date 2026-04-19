'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/services/api';
import { Zap, Globe, Rocket, ShieldCheck, Mail, Lock, Building, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    organizationName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post('/auth/signup', formData);
      toast.success('Account Created Successfully');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] p-6 relative overflow-hidden selection:bg-primary/30">
      {/* Background Aura blurs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/10 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/5 blur-[140px] rounded-full animate-pulse delay-1000" />
      </div>

      {/* Decorative Brand Header */}
      <div className="absolute top-10 left-10 flex items-center gap-3">
        <div className="bg-[var(--aura-primary)] p-2 rounded-xl text-white shadow-xl shadow-primary/20">
          <Zap size={22} fill="currentColor" strokeWidth={3} />
        </div>
        <span className="text-2xl font-black tracking-tighter text-white uppercase italic">EPMS</span>
      </div>

      <div className="w-full max-w-xl relative z-10 animate-in fade-in zoom-in-95 duration-1000">
        <div className="astra-glass rounded-[40px] border border-white/10 shadow-3xl overflow-hidden shadow-black/50">
          <div className="p-12 pb-8 text-center space-y-4 bg-white/5 border-b border-white/5">
            <div className="w-20 h-20 rounded-3xl bg-primary/20 flex items-center justify-center mx-auto mb-6 border-2 border-primary/30 shadow-3xl shadow-primary/20">
               <Building size={40} className="text-primary" strokeWidth={2.5} />
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter leading-none">Get Started</h1>
            <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.4em]">Register Your Organization</p>
          </div>

          <form onSubmit={handleSubmit} className="p-12 space-y-8 bg-black/20">
            <div className="grid md:grid-cols-1 gap-8">
              <Input
                label="Organization Name"
                placeholder="e.g. Acme Corporation"
                value={formData.organizationName}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                required
                className="bg-white/5"
              />
              
              <div className="h-px bg-white/5 w-full" />

              <Input
                label="Admin Email Address"
                type="email"
                placeholder="admin@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-white/5"
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="bg-white/5"
              />
            </div>

            <Button type="submit" className="w-full h-16 rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-primary/30 group py-4" isLoading={isLoading} size="lg">
              Create Account <ArrowRight size={20} className="ml-3 group-hover:translate-x-1.5 transition-transform" />
            </Button>
          </form>

          <div className="p-10 pt-6 text-center border-t border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <ShieldCheck size={14} className="text-emerald-500" />
               <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">Enterprise Ready</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
               <span className="text-white/20">Have an account?</span>
               <Link href="/login" className="text-primary hover:text-white transition-colors border-b-2 border-primary/20 hover:border-white">
                 Sign In
               </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-10 text-center opacity-20 hover:opacity-100 transition-opacity duration-500">
           <p className="text-[10px] font-black text-white uppercase tracking-[0.5em] leading-relaxed">
             By signing up, you agree to our Terms of Service <br />
             and Privacy Policy.
           </p>
        </div>
      </div>
    </div>
  );
}
