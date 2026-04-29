'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/services/api';
import { Zap, Globe, Rocket, ShieldCheck, Mail, Lock, Building, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/Logo';
import { OrgThemeProvider } from '@/components/providers/OrgThemeProvider';

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
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OrgThemeProvider>
      <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden selection:bg-primary/30">
        {/* Background Aura blurs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/10 blur-[160px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/5 blur-[140px] rounded-full animate-pulse delay-1000" />
        </div>

        {/* Decorative Brand Header */}
        <Logo className="absolute top-8 left-8" textClassName="opacity-40" />

        <div className="w-full max-w-xl relative z-10 animate-in fade-in zoom-in-95 duration-1000">
          <div className="astra-glass rounded-2xl border border-divider shadow-3xl overflow-hidden bg-card/10">
            <div className="p-8 pb-5 text-center space-y-2 border-b border-divider bg-muted/5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-xl shadow-primary/10">
                <Building size={20} className="text-primary" strokeWidth={2.5} />
              </div>
              <h1 className="text-xl font-black text-foreground uppercase tracking-widest">Register</h1>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Join Workspace</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-white/[0.01]">
              <div className="grid md:grid-cols-1 gap-4">
                <Input
                  label="Organization Name"
                  placeholder="e.g. Acme Corporation"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  required
                  className="h-10 text-xs font-bold bg-white/5 border-white/5 rounded-xl"
                />

                <div className="h-px bg-white/5 w-full my-1" />

                <Input
                  label="Corporate Email"
                  type="email"
                  placeholder="admin@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-10 text-xs font-bold bg-white/5 border-white/5 rounded-xl"
                />
                <Input
                  label="Create Password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="h-10 text-xs font-bold bg-white/5 border-white/5 rounded-xl"
                />
              </div>

              <Button type="submit" className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest group" isLoading={isLoading}>
                Create Account <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/40 hover:text-primary transition-colors group">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Login
              </Link>
            </form>

            <div className="p-8 pt-5 text-center border-t border-divider bg-muted/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={12} className="text-primary/40" />
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Enterprise Encrypted</span>
              </div>
              <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest">
                <span className="text-muted-foreground opacity-40">Already in?</span>
                <Link href="/" className="text-primary hover:text-foreground transition-colors">
                  Sign In
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center opacity-20 hover:opacity-100 transition-opacity duration-500">
            <p className="text-[10px] font-black text-foreground uppercase tracking-[0.5em] leading-relaxed">
              By signing up, you agree to our Terms of Service <br />
              and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </OrgThemeProvider>
  );
}
