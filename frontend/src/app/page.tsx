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
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
        <div className="astra-glass border border-white/5 rounded-2xl px-6 py-2.5 flex items-center justify-between shadow-2xl bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary p-1.5 rounded-lg text-white shadow-lg shadow-primary/20">
              <Zap size={16} fill="currentColor" strokeWidth={3} />
            </div>
            <span className="text-xl font-black tracking-widest text-white uppercase opacity-40">EPMS</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">Solutions</a>
            <a href="#security" className="text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">Security</a>
            <a href="#analytics" className="text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">Analytics</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="h-8 px-4 rounded-lg shadow-lg shadow-primary/10 text-[9px] uppercase font-black tracking-widest">Register</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 flex flex-col items-center">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6 relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/5 text-[9px] font-black uppercase tracking-widest text-primary shadow-2xl">
            <ShieldCheck size={12} />
            Enterprise Management Protocol
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-widest leading-[1.1]">
            MANAGE PROJECTS <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-white animate-gradient-x">WITH PRECISION</span>
          </h1>
          
          <p className="text-sm text-white/20 max-w-2xl mx-auto font-black uppercase tracking-widest leading-relaxed">
            A premium management platform built for modern organizations. 
            Track performance, manage portfolios, and scale your operations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/signup">
              <Button className="h-12 px-10 text-[10px] font-black uppercase tracking-widest rounded-xl group border border-primary/20 bg-primary shadow-xl shadow-primary/20">
                Get Started <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="h-12 px-10 text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/5 text-white/40 hover:text-white hover:bg-white/5">
                Enterprise Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="mt-16 w-[90%] max-w-6xl aspect-[21/9] rounded-2xl border border-white/5 bg-white/[0.01] shadow-2xl relative group overflow-hidden animate-in fade-in zoom-in-95 duration-1000 delay-300">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent opacity-30" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="p-20 opacity-5">
                <BarChart3 size={200} strokeWidth={1} className="text-primary" />
             </div>
          </div>
          <div className="absolute bottom-6 left-6 flex flex-col gap-2">
             <div className="flex gap-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-0.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/40 animate-progress origin-left" style={{ animationDelay: `${i*300}ms` }} />
                  </div>
                ))}
             </div>
             <p className="text-[8px] font-black text-white/10 uppercase tracking-widest">Protocol Active...</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-12">
            <div className="space-y-2">
              <p className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">Core Capabilities</p>
              <h2 className="text-3xl font-black text-white uppercase tracking-widest">Enterprise Solutions.</h2>
            </div>
            <p className="max-w-md text-white/20 font-black uppercase tracking-widest text-[10px] leading-relaxed">
              structural tools required for reliable organizational growth and coordination.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <LandingFeatureCard 
              icon={<Users className="text-primary" size={20} />}
              title="Workforce Management"
              description="Unified active profiles and detailed organizational charts."
            />
            <LandingFeatureCard 
              icon={<Briefcase className="text-primary" size={20} />}
              title="Active Portfolios"
              description="Comprehensive project tracking and delivery milestones."
            />
            <LandingFeatureCard 
              icon={<BarChart3 className="text-primary" size={20} />}
              title="System Insights"
              description="Automated performance reporting and data-driven audits."
            />
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/[0.01]" />
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-20 items-center">
           <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/20">
                <Lock size={12} className="text-primary/60" />
                Enterprise Security Matrix
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-widest leading-none">Global <br /> Protection.</h2>
              <p className="text-[10px] text-white/20 font-black uppercase tracking-widest leading-relaxed max-w-xl">
                Industry-standard encryption for all data transmissions. Your intelligence is protected by sophisticated security layers.
              </p>
              <div className="grid grid-cols-2 gap-10 pt-4">
                 <div className="space-y-1">
                    <p className="text-2xl font-black text-white uppercase tracking-widest leading-none">99.99%</p>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/40">Uptime Reliability</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-2xl font-black text-white uppercase tracking-widest leading-none">AES-256</p>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/40">Encryption Level</p>
                 </div>
              </div>
           </div>
           <div className="flex-1 w-full flex justify-center lg:justify-end">
              <div className="w-full max-w-sm aspect-square rounded-[40px] border border-white/5 flex items-center justify-center relative shadow-3xl bg-white/[0.01]">
                 <div className="absolute inset-0 p-10 opacity-5">
                    <Globe size="100%" strokeWidth={0.5} className="text-primary" />
                 </div>
                 <ShieldCheck size={60} className="text-white opacity-20" />
              </div>
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-8">
           <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-widest leading-none">READY TO <br /> OPERATE?</h2>
           <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Connect your organization today.</p>
           <Link href="/signup">
             <Button className="h-12 px-12 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-2xl shadow-primary/40 group">
               Register Now <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
             </Button>
           </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2.5 opacity-40">
            <div className="bg-white/5 p-1.5 rounded-lg text-white border border-white/5">
              <Zap size={14} fill="currentColor" strokeWidth={3} />
            </div>
            <span className="text-xl font-black tracking-widest text-white uppercase">EPMS</span>
          </div>
          <div className="flex gap-8 text-[8px] font-black uppercase tracking-widest text-white/20">
             <a href="#" className="hover:text-primary transition-colors">Privacy</a>
             <a href="#" className="hover:text-primary transition-colors">Terms</a>
             <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
          <div className="text-[8px] font-black text-white/10 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} EPMS. PROPRIETARY.
          </div>
        </div>
      </footer>
    </div>
  );
}

function LandingFeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] transition-all group duration-500 hover:border-primary/20">
      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-all duration-700">
        <div className="text-primary transform scale-90 group-hover:scale-100">
          {icon}
        </div>
      </div>
      <h3 className="text-sm font-black text-white mb-2 uppercase tracking-widest">{title}</h3>
      <p className="text-white/20 font-black uppercase tracking-widest leading-relaxed text-[9px] group-hover:text-white/40 transition-colors">{description}</p>
    </div>
  );
}
