'use client';

import { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  X,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Bell
} from 'lucide-react';
import api from '@/services/api';
import { cn } from '@/lib/utils';

export function BroadcastBanner() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    async function fetchActive() {
      try {
        const res = await api.get('/announcements/active');
        setAnnouncements(res.data);
      } catch (err) {
        console.error('Failed to fetch active broadcasts', err);
      }
    }
    fetchActive();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchActive, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (announcements.length === 0 || !isVisible) return null;

  const current = announcements[currentIndex];

  const typeConfig: any = {
    INFO: { 
      icon: Info, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10', 
      border: 'border-blue-500/20',
      glow: 'shadow-blue-500/10'
    },
    SUCCESS: { 
      icon: CheckCircle2, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10', 
      border: 'border-emerald-500/20',
      glow: 'shadow-emerald-500/10'
    },
    WARNING: { 
      icon: AlertCircle, 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10', 
      border: 'border-amber-500/20',
      glow: 'shadow-amber-500/10'
    },
    CRITICAL: { 
      icon: AlertCircle, 
      color: 'text-red-500', 
      bg: 'bg-red-500/10', 
      border: 'border-red-500/20',
      glow: 'shadow-red-500/10'
    },
  };

  const cfg = typeConfig[current.type] || typeConfig.INFO;
  const Icon = cfg.icon;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  return (
    <div className={cn(
      "relative group w-full overflow-hidden transition-all duration-700 animate-in slide-in-from-top-6",
      "rounded-[28px] border astra-glass shadow-2xl",
      cfg.bg,
      cfg.border,
      cfg.glow
    )}>
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <Icon size={120} className={cn("absolute -right-8 -top-8 rotate-12", cfg.color)} />
      </div>

      <div className="relative z-10 flex items-center justify-between p-5 md:p-6 gap-6">
        <div className="flex items-center gap-5 flex-1 min-w-0">
          <div className={cn(
            "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500",
            "bg-card/50",
            cfg.border
          )}>
            <Icon size={24} className={cfg.color} strokeWidth={2.5} />
          </div>

          <div className="space-y-1 overflow-hidden">
            <div className="flex items-center gap-2.5">
               <span className={cn("text-[9px] font-black uppercase tracking-[0.3em]", cfg.color)}>
                 Broadcasting // {current.type}
               </span>
               {announcements.length > 1 && (
                 <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
                   {currentIndex + 1} of {announcements.length}
                 </span>
               )}
            </div>
            <h3 className="text-base md:text-lg font-black text-foreground uppercase tracking-tight truncate">
              {current.title}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground font-medium opacity-80 line-clamp-1 italic">
              {current.content}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           {announcements.length > 1 && (
             <div className="flex items-center gap-1.5 mr-2">
                <button 
                  onClick={handlePrev}
                  className="w-8 h-8 rounded-lg bg-card/40 hover:bg-card border border-divider flex items-center justify-center transition-all opacity-40 hover:opacity-100"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={handleNext}
                  className="w-8 h-8 rounded-lg bg-card/40 hover:bg-card border border-divider flex items-center justify-center transition-all opacity-40 hover:opacity-100"
                >
                  <ChevronRight size={16} />
                </button>
             </div>
           )}
           {/* Per user request, announcement can't be removed/dismissed by user easily, but let's keep it tidy */}
        </div>
      </div>
    </div>
  );
}
