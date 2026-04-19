'use client';

import { useState } from 'react';
import { Settings, User, Building, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfileSettingsTab } from '@/components/settings/ProfileSettingsTab';
import { OrganizationSettingsTab } from '@/components/settings/OrganizationSettingsTab';
import { AppearanceTab } from '@/components/settings/AppearanceTab';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'organization' | 'appearance'>('profile');

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 max-w-5xl">
      <div>
        <div className="flex items-center gap-2.5 mb-1.5">
           <div className="p-1.5 rounded-xl bg-primary/10 border border-primary/20">
              <Settings className="text-primary" size={18} strokeWidth={2.5} />
           </div>
           <p className="text-[9px] font-black text-primary/60 uppercase tracking-[0.2em]">System Controls</p>
        </div>
        <h1 className="text-2xl font-black text-white uppercase tracking-widest leading-none">
          Settings
        </h1>
        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-2 max-w-2xl opacity-50">
          Configure personal profiles, organizational parameters, and interface appearance.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start h-full">
        {/* Navigation Sidebar inside Settings */}
        <div className="w-full lg:w-64 flex flex-col gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={cn(
              "flex items-center justify-between px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border",
              activeTab === 'profile' 
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/10 scale-[1.01]' 
                : 'bg-white/[0.02] text-white/40 border-white/5 hover:border-white/10 hover:text-white'
            )}
          >
            <div className="flex items-center gap-3">
              <User size={14} strokeWidth={2.5} /> Profile & Security
            </div>
            {activeTab === 'profile' && <div className="w-1 h-1 rounded-full bg-white" />}
          </button>
          
          <button
            onClick={() => setActiveTab('organization')}
            className={cn(
              "flex items-center justify-between px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border",
              activeTab === 'organization' 
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/10 scale-[1.01]' 
                : 'bg-white/[0.02] text-white/40 border-white/5 hover:border-white/10 hover:text-white'
            )}
          >
            <div className="flex items-center gap-3">
              <Building size={14} strokeWidth={2.5} /> Organization
            </div>
            {activeTab === 'organization' && <div className="w-1 h-1 rounded-full bg-white" />}
          </button>
          
          <button
            onClick={() => setActiveTab('appearance')}
            className={cn(
              "flex items-center justify-between px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border",
              activeTab === 'appearance' 
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/10 scale-[1.01]' 
                : 'bg-white/[0.02] text-white/40 border-white/5 hover:border-white/10 hover:text-white'
            )}
          >
            <div className="flex items-center gap-3">
              <Palette size={14} strokeWidth={2.5} /> Appearance
            </div>
            {activeTab === 'appearance' && <div className="w-1 h-1 rounded-full bg-white" />}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl p-8 shadow-sm relative overflow-hidden min-h-[500px]">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-20" />
          
          <div className="relative z-10 h-full">
            {activeTab === 'profile' && <ProfileSettingsTab />}
            {activeTab === 'organization' && <OrganizationSettingsTab />}
            {activeTab === 'appearance' && <AppearanceTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
