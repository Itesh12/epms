'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Briefcase, 
  Users, 
  Settings, 
  LayoutDashboard,
  LogOut,
  Trophy,
  X
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Projects', icon: Briefcase, href: '/projects' },
  { label: 'Employees', icon: Users, href: '/employees' },
  { label: 'Performance', icon: Trophy, href: '/performance' },
  { label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity duration-500 backdrop-blur-sm",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <div 
        className={cn(
          "fixed z-50 overflow-hidden transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ease-in-out",
          // Desktop: Floating Glass
          "lg:left-4 lg:top-4 lg:bottom-4 lg:w-64 lg:rounded-3xl lg:translate-x-0 astra-glass shadow-2xl border border-white/5 shadow-primary/5",
          // Mobile: Sliding Panel
          isOpen ? "left-0 top-0 bottom-0 w-72 rounded-r-3xl translate-x-0" : "-translate-x-full",
          !isOpen && "lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full bg-background/20 backdrop-blur-3xl">
          <div className="p-8">
            <div className="flex items-center justify-between mb-10 translate-y-0 opacity-100 transition-all duration-700">
              <div className="flex items-center gap-3">
                <div className="bg-[var(--aura-primary)] text-primary-foreground p-2 rounded-2xl shadow-lg shadow-primary/20">
                  <BarChart3 size={22} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tight text-foreground leading-none">EPMS</span>
                  <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mt-1">Enterprise v1.0</span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="lg:hidden text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted/50 rounded-xl"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="space-y-2">
              {navItems
                .filter(item => {
                  if (item.href === '/analytics' && user?.role !== 'ADMIN') return false;
                  return true;
                })
                .map((item, idx) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={cn(
                      'flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden',
                      isActive 
                        ? 'bg-[var(--aura-primary)] text-primary-foreground shadow-lg shadow-primary/20' 
                        : 'hover:bg-primary/5 text-muted-foreground hover:text-foreground font-semibold'
                    )}
                  >
                    <item.icon 
                      size={20} 
                      strokeWidth={isActive ? 2.5 : 2}
                      className={cn(isActive ? 'text-primary-foreground rotate-0' : 'text-muted-foreground group-hover:text-primary group-hover:scale-110 group-hover:rotate-3 transition-all')} 
                    />
                    <span className="tracking-tight">{item.label}</span>
                    {isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white/20 rounded-l-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-8 border-t border-white/5">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex items-center gap-4 px-4 py-4 rounded-2xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all w-full group font-bold tracking-tight"
            >
              <LogOut size={20} className="group-hover:scale-110 group-hover:-translate-x-1 transition-transform" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
