'use client';

import Link from 'next/link';
import { 
  Users, 
  Briefcase, 
  BarChart3, 
  ShieldCheck, 
  ArrowRight,
  Zap,
  Globe,
  Lock,
  Cpu,
  Target,
  Trophy,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-foreground selection:bg-primary/30 overflow-x-hidden">
      {/* Background Aura */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
        <div className="astra-glass border border-white/10 rounded-3xl px-8 py-4 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--aura-primary)] p-2 rounded-xl text-white shadow-lg shadow-primary/20">
              <Zap size={20} fill="currentColor" strokeWidth={3} />
            </div>
            <span className="text-xl font-black tracking-tighter text-white uppercase italic">EPMS</span>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">Features</a>
            <a href="#security" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">Security</a>
            <a href="#analytics" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">Analytics</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-[0.1em] text-white shadow-none hover:bg-white/5">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="rounded-xl shadow-lg shadow-primary/20 text-[10px] uppercase font-black tracking-[0.1em]">Create Account</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 flex flex-col items-center">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-12 relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full astra-glass border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-2xl">
            <ShieldCheck size={14} />
            Secure Enterprise Environment
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] drop-shadow-2xl">
            MANAGE PROJECTS <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-white animate-gradient-x">& EMPOWER TEAMS</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/40 max-w-3xl mx-auto font-bold tracking-tight italic">
            A premium management platform built for modern organizations. 
            Track performance, manage portfolios, and scale your operations with precision.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <Link href="/signup">
              <Button size="lg" className="h-16 px-12 text-sm font-black uppercase tracking-widest rounded-2xl group border border-primary/20">
                Setup Organization <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={20} />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="ghost" className="h-16 px-12 text-sm font-black uppercase tracking-widest rounded-2xl astra-glass border border-white/5 text-white shadow-none hover:bg-white/5">
                Dashboard Access
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="mt-20 w-[90%] max-w-6xl aspect-[16/9] rounded-[40px] border border-white/10 astra-glass shadow-2xl relative group overflow-hidden animate-in fade-in zoom-in-95 duration-1000 delay-300">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="p-20 opacity-10">
                <BarChart3 size={300} strokeWidth={1} className="text-primary animate-pulse" />
             </div>
          </div>
          <div className="absolute bottom-10 left-10 p-10 space-y-4">
             <div className="flex gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="w-12 h-1 bg-primary/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-progress origin-left" style={{ animationDelay: `${i*300}ms` }} />
                  </div>
                ))}
             </div>
             <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Optimizing Workspace...</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Core Capabilities</p>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Everything to Scale.</h2>
            </div>
            <p className="max-w-md text-white/40 font-bold italic text-sm">
              Our platform provides the structural tools required for reliable organizational growth and team coordination.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <LandingFeatureCard 
              icon={<Users className="text-primary" size={24} />}
              title="Team Management"
              description="Unified employee profiles, role-based access, and detailed organizational charts."
            />
            <LandingFeatureCard 
              icon={<Briefcase className="text-primary" size={24} />}
              title="Project Portfolios"
              description="Comprehensive project tracking, task management, and delivery milestones."
            />
            <LandingFeatureCard 
              icon={<BarChart3 className="text-primary" size={24} />}
              title="Real-time Analytics"
              description="Automated performance reporting and data-driven insights for leaders."
            />
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/[0.02]" />
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-20 items-center">
           <div className="flex-1 space-y-10">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full astra-glass border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/60 shadow-2xl">
                <Lock size={14} className="text-emerald-500" />
                Enterprise Security Shield
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">Your Data. <br /> Private. Secure.</h2>
              <p className="text-lg text-white/40 font-bold italic leading-relaxed">
                EPMS utilizes industry-standard encryption for all data transmissions. Your organizational intelligence is protected by sophisticated security layers.
              </p>
              <div className="grid grid-cols-2 gap-10 pt-6">
                 <div className="space-y-2">
                    <p className="text-3xl font-black text-white tracking-tight">99.99%</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">High Availability</p>
                 </div>
                 <div className="space-y-2">
                    <p className="text-3xl font-black text-white tracking-tight">AES-256</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Data Encryption</p>
                 </div>
              </div>
           </div>
           <div className="flex-1 w-full flex justify-center lg:justify-end">
              <div className="w-full max-w-md aspect-square rounded-[60px] astra-glass border border-white/10 flex items-center justify-center relative shadow-3xl">
                 <div className="absolute inset-0 animate-spin-slow p-10 opacity-10">
                    <Globe size="100%" strokeWidth={0.5} className="text-primary" />
                 </div>
                 <ShieldCheck size={100} className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] animate-bounce" />
              </div>
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-44 relative">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
           <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none">READY TO <br /> TRANSFORM?</h2>
           <p className="text-lg text-white/40 font-bold italic">Start managing your organization effectively with EPMS today.</p>
           <Link href="/signup">
             <Button size="lg" className="h-20 px-16 text-lg font-black uppercase tracking-[0.3em] rounded-3xl shadow-3xl shadow-primary/40 animate-pulse hover:animate-none group">
               Get Started Now <ArrowRight className="ml-4 group-hover:translate-x-3 transition-transform" size={24} />
             </Button>
           </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-20 bg-black/40 relative z-10 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3 opacity-50">
            <div className="bg-white/10 p-2 rounded-xl text-white">
              <Zap size={18} fill="currentColor" strokeWidth={3} />
            </div>
            <span className="text-lg font-black tracking-tighter text-white uppercase italic">EPMS</span>
          </div>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
             <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
             <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
             <a href="#" className="hover:text-primary transition-colors">Contact Support</a>
          </div>
          <div className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} EPMS Enterprise. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function LandingFeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-10 rounded-[40px] border border-white/5 astra-glass shadow-xl hover:shadow-2xl hover:border-primary/20 transition-all group duration-500 hover:-translate-y-2">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:bg-primary/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
        <div className="transform transition-transform group-hover:scale-110">
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-black text-white mb-4 tracking-tight drop-shadow-md">{title}</h3>
      <p className="text-white/40 font-bold italic leading-relaxed text-sm group-hover:text-white/60 transition-colors">{description}</p>
    </div>
  );
}
