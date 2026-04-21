'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Zap, ShieldCheck, ArrowRight, Lock, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/Logo';
import { OrgThemeProvider } from '@/components/providers/OrgThemeProvider';

export default function RootPage() {
  const router = useRouter();
  const { user, setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Automatically redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user) {
      // Ensure cookie is synced for middleware before redirecting
      const token = localStorage.getItem('accessToken');
      if (token) {
        document.cookie = `accessToken=${token}; path=/; max-age=2592000; SameSite=Lax`;
      }
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response: any = await api.post('/auth/login', formData);
      const { user: userData, accessToken, refreshToken } = response.data;

      setAuth(userData, accessToken, refreshToken);
      toast.success('Login Successful');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // If user is logged in, show a simple loading state while redirecting
  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
            <Zap className="text-primary" size={24} fill="currentColor" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Redirecting to Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <OrgThemeProvider>
      <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden selection:bg-primary/30">
        {/* Background Aura blurs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[140px] rounded-full animate-pulse" />
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-indigo-500/5 blur-[100px] rounded-full animate-pulse delay-700" />
        </div>

        {/* Decorative Brand Header */}
        <Logo className="absolute top-8 left-8" textClassName="opacity-40" />

        <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
          <div className="astra-glass rounded-3xl border border-divider shadow-3xl overflow-hidden bg-card/10">
            <div className="p-8 pb-5 text-center space-y-2 border-b border-divider bg-muted/5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-xl shadow-primary/10">
                <Lock size={20} className="text-primary" strokeWidth={2.5} />
              </div>
              <h1 className="text-xl font-black text-foreground uppercase tracking-widest">Login</h1>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Secure User Access</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-4">
                <Input
                  label="Corporate Email"
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-10 text-xs font-bold bg-muted/5 border-divider rounded-xl"
                />
                <div className="space-y-1.5">
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="h-10 text-xs font-bold bg-muted/5 border-divider rounded-xl"
                  />
                  <div className="flex justify-end px-1">
                    <Link href="/forgot-password" className="text-[9px] font-black uppercase tracking-widest text-primary/40 hover:text-primary transition-colors">
                      Forgot Password?
                    </Link>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest group" isLoading={isLoading}>
                Sign In <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            <div className="p-8 pt-5 text-center border-t border-divider bg-muted/5">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-3 opacity-20">New to the system?</p>
              <Link href="/signup">
                <Button variant="ghost" className="w-full h-9 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 border border-primary/10 hover:border-primary shadow-none">
                  Create Workspace Account
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center opacity-20 hover:opacity-100 transition-opacity duration-500">
            <p className="text-[9px] font-black text-foreground uppercase tracking-[0.5em] leading-relaxed">
              EPMS Enterprise Management System &copy; {new Date().getFullYear()}. <br />
              System Status: Online.
            </p>
          </div>
        </div>
      </div>
    </OrgThemeProvider>
  );
}
