import { useTheme } from 'next-themes';
import { Palette, Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
           <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Palette className="text-primary" size={16} strokeWidth={2.5} />
           </div>
           <h2 className="text-sm font-black text-white uppercase tracking-widest">
             Appearance
           </h2>
        </div>
        <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-widest max-w-md">
           Customize the visual frequency of your environment.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg">
        <button
          onClick={() => setTheme('light')}
          className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
            theme === 'light' ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10' : 'border-white/5 bg-white/[0.02] text-white/20 hover:border-white/10 hover:text-white'
          }`}
        >
          <Sun size={20} className="mb-2" />
          <span className="font-black text-[10px] uppercase tracking-widest">Light</span>
        </button>

        <button
          onClick={() => setTheme('dark')}
          className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
            theme === 'dark' ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10' : 'border-white/5 bg-white/[0.02] text-white/20 hover:border-white/10 hover:text-white'
          }`}
        >
          <Moon size={20} className="mb-2" />
          <span className="font-black text-[10px] uppercase tracking-widest">Dark</span>
        </button>

        <button
          onClick={() => setTheme('system')}
          className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
            theme === 'system' ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10' : 'border-white/5 bg-white/[0.02] text-white/20 hover:border-white/10 hover:text-white'
          }`}
        >
          <Monitor size={20} className="mb-2" />
          <span className="font-black text-[10px] uppercase tracking-widest">System</span>
        </button>
      </div>
    </div>
  );
}
