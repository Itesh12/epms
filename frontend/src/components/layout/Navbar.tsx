'use client';

import { useState } from 'react';
import { Bell, Search, User, Menu, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const user = useAuthStore((state) => state.user);
  const { openProfile } = useProfileStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="h-16 border-b bg-background/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors text-foreground/70"
        >
          <Menu size={24} />
        </button>

        <div className="relative max-w-md w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full bg-muted/50 border border-divider rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary transition-all placeholder:text-muted-foreground/40 font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-6">
        <div className="hidden lg:block">
          <ThemeToggle />
        </div>
        <button className="relative p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
        </button>

        <div className="flex items-center gap-3 pl-4 lg:pl-6 border-l hidden sm:flex">
          <div className="text-right">
            <p className="text-sm font-bold text-foreground">{user?.email || 'Guest'}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {user?.role || 'User'}
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border-2 border-primary/20 hover:bg-primary/20 transition-colors"
            >
              {user?.email?.[0].toUpperCase() || <User size={20} />}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-background border rounded-xl shadow-xl overflow-hidden z-50">
                <div className="py-2 border-b border-white/5">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      if (user?.id) openProfile(user.id);
                    }}
                    className="w-full text-left px-5 py-3 text-xs font-bold text-foreground hover:bg-white/5 flex items-center gap-3 transition-colors group"
                  >
                    <User className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                    My Grid Node
                  </button>
                  <button className="w-full text-left px-5 py-3 text-xs font-bold text-foreground hover:bg-white/5 flex items-center gap-3 transition-colors group">
                    <Settings className="w-4 h-4 text-muted-foreground group-hover:rotate-45 transition-transform" />
                    Matrix Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
