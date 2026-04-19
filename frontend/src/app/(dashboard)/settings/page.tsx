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
    <div className="h-full flex flex-col space-y-12 animate-in fade-in duration-500 max-w-6xl">
      <div>
        <div className="flex items-center gap-3 mb-2">
           <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg shadow-primary/10">
              <Settings className="text-primary" size={24} strokeWidth={2.5} />
           </div>
           <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">System Control Panel</p>
        </div>
        <h1 className="text-5xl font-black text-foreground tracking-tighter leading-none">
          Global Settings
        </h1>
        <p className="text-muted-foreground/60 font-bold text-sm mt-4 max-w-2xl italic">
          Configure personal protocols, organizational nodes, and the visual frequency of the EPMS environment.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start h-full">
        {/* Navigation Sidebar inside Settings */}
        <div className="w-full lg:w-72 flex flex-col gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={cn(
              "flex items-center justify-between px-6 py-4 rounded-3xl font-black text-[11px] uppercase tracking-widest transition-all border",
              activeTab === 'profile' 
                ? 'bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20 scale-[1.02]' 
                : 'bg-background/40 text-muted-foreground/60 border-white/5 hover:border-white/10 astra-glass hover:text-foreground'
            )}
          >
            <div className="flex items-center gap-4">
              <User size={16} strokeWidth={2.5} /> Identity & Security
            </div>
            {activeTab === 'profile' && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
          </button>
          
          <button
            onClick={() => setActiveTab('organization')}
            className={cn(
              "flex items-center justify-between px-6 py-4 rounded-3xl font-black text-[11px] uppercase tracking-widest transition-all border",
              activeTab === 'organization' 
                ? 'bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20 scale-[1.02]' 
                : 'bg-background/40 text-muted-foreground/60 border-white/5 hover:border-white/10 astra-glass hover:text-foreground'
            )}
          >
            <div className="flex items-center gap-4">
              <Building size={16} strokeWidth={2.5} /> Workspace Logic
            </div>
            {activeTab === 'organization' && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
          </button>
          
          <button
            onClick={() => setActiveTab('appearance')}
            className={cn(
              "flex items-center justify-between px-6 py-4 rounded-3xl font-black text-[11px] uppercase tracking-widest transition-all border lg:flex",
              activeTab === 'appearance' 
                ? 'bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20 scale-[1.02]' 
                : 'bg-background/40 text-muted-foreground/60 border-white/5 hover:border-white/10 astra-glass hover:text-foreground'
            )}
          >
            <div className="flex items-center gap-4">
              <Palette size={16} strokeWidth={2.5} /> UI Frequency
            </div>
            {activeTab === 'appearance' && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 astra-glass bg-background/20 border border-white/10 rounded-[40px] p-10 lg:p-14 shadow-2xl relative overflow-hidden min-h-[600px]">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
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
