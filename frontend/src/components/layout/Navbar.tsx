'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, User, Menu, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { openProfile } = useProfileStore();
  const logout = useAuthStore((state) => state.logout);
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
              <div className="absolute right-0 top-full mt-3 w-56 astra-glass border border-divider rounded-2xl shadow-2xl overflow-hidden z-50 bg-card/90 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      if (user?.id) openProfile(user.id);
                    }}
                    className="w-full text-left px-4 py-3 text-xs font-bold text-foreground hover:bg-primary/10 rounded-xl flex items-center gap-3 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <User size={16} className="text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    My Profile
                  </button>

                  <Link
                    href="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full text-left px-4 py-3 text-xs font-bold text-foreground hover:bg-primary/10 rounded-xl flex items-center gap-3 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <Settings size={16} className="text-muted-foreground group-hover:rotate-45 transition-transform" />
                    </div>
                    General Settings
                  </Link>

                  <div className="h-px bg-divider mx-2 my-1" />

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                      router.push('/');
                    }}
                    className="w-full text-left px-4 py-3 text-xs font-black text-red-500 hover:bg-red-500/10 rounded-xl flex items-center gap-3 transition-all group uppercase tracking-widest"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                    </div>
                    Sign Out
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
