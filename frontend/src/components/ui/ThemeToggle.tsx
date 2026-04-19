'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-muted/50 border animate-pulse" />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2.5 rounded-xl bg-background border hover:bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center justify-center relative overflow-hidden"
    >
      <Sun className="h-[1.125rem] w-[1.125rem] transition-all dark:-rotate-90 dark:scale-0 dark:opacity-0" />
      <Moon className="absolute h-[1.125rem] w-[1.125rem] rotate-90 scale-0 opacity-0 transition-all dark:rotate-0 dark:scale-100 dark:opacity-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
