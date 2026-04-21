'use client';

import { Zap, BarChart3 } from 'lucide-react';
import { useOrgTheme } from '@/components/providers/OrgThemeProvider';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  showText?: boolean;
  textClassName?: string;
  showSubtitle?: boolean;
  subtitleClassName?: string;
  variant?: 'sidebar' | 'header' | 'landing';
}

export function Logo({ 
  className, 
  iconClassName, 
  showText = true, 
  textClassName,
  showSubtitle = false,
  subtitleClassName,
  variant = 'header'
}: LogoProps) {
  const { branding } = useOrgTheme();

  const isLanding = variant === 'landing';

  return (
    <div className={cn("flex items-center gap-2.5 group", className)}>
      {branding?.logoUrl ? (
        <div className={cn(
          "rounded-xl border border-divider p-1 flex items-center justify-center overflow-hidden shadow-sm transition-all duration-300 group-hover:scale-105",
          variant === 'sidebar' ? "w-10 h-10 bg-muted/20" : "w-11 h-11 bg-card/50 backdrop-blur-md"
        )}>
          <img src={branding.logoUrl} alt="Organization Logo" className="w-full h-full object-contain" />
        </div>
      ) : (
        <div className={cn(
          "flex items-center justify-center rounded-xl shadow-lg transition-all duration-500 group-hover:rotate-6 group-hover:scale-110",
          // Fix for light mode visibility: 
          // Always use a strong background (primary) and clear foreground icons
          "bg-primary text-white p-1.5 shadow-primary/20",
          variant === 'sidebar' ? "w-10 h-10" : "w-11 h-11",
          iconClassName
        )}>
          {isLanding ? <Zap size={22} fill="currentColor" strokeWidth={3} /> : <BarChart3 size={20} strokeWidth={2.5} />}
        </div>
      )}

      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            "font-black tracking-tight leading-none uppercase",
            isLanding ? "text-lg text-foreground" : "text-sm text-foreground",
            textClassName
          )}>
            {branding?.name || 'EPMS'}
          </span>
          {showSubtitle && (
            <span className={cn(
              "text-[9px] font-bold text-primary uppercase tracking-widest mt-1 opacity-60",
              subtitleClassName
            )}>
              {branding?.subtitle || 'Enterprise v1.0'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
