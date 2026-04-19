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
      <div className="mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Palette className="text-primary" size={20} /> Appearance
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Customize the dashboard interface. These changes are saved to your local browser.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
        <button
          onClick={() => setTheme('light')}
          className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all ${
            theme === 'light' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card text-muted-foreground hover:border-primary/50'
          }`}
        >
          <Sun size={32} className="mb-3" />
          <span className="font-semibold">Light</span>
        </button>

        <button
          onClick={() => setTheme('dark')}
          className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all ${
            theme === 'dark' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card text-muted-foreground hover:border-primary/50'
          }`}
        >
          <Moon size={32} className="mb-3" />
          <span className="font-semibold">Dark</span>
        </button>

        <button
          onClick={() => setTheme('system')}
          className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all ${
            theme === 'system' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card text-muted-foreground hover:border-primary/50'
          }`}
        >
          <Monitor size={32} className="mb-3" />
          <span className="font-semibold">System</span>
        </button>
      </div>
    </div>
  );
}
