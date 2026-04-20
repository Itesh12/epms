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
  X,
  Clock,
  Calendar,
  Megaphone,
  Wallet,
  Package,
  BookOpen
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Projects', icon: Briefcase, href: '/projects' },
  { label: 'Employees', icon: Users, href: '/employees' },
  { label: 'Attendance', icon: Clock, href: '/attendance' },
  { label: 'Connect Hub', icon: Calendar, href: '/calendar' },
  { label: 'Performance', icon: Trophy, href: '/performance' },
  { label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { label: 'Announcements', icon: Megaphone, href: '/announcements' },
  { label: 'Finance', icon: Wallet, href: '/finance' },
  { label: 'Assets', icon: Package, href: '/assets' },
  { label: 'Knowledge Base', icon: BookOpen, href: '/wiki' },
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
          "lg:left-4 lg:top-4 lg:bottom-4 lg:w-[240px] lg:rounded-2xl lg:translate-x-0 astra-glass shadow-2xl border border-divider shadow-primary/5",
          // Mobile: Sliding Panel
          isOpen ? "left-0 top-0 bottom-0 w-64 rounded-r-2xl translate-x-0" : "-translate-x-full",
          !isOpen && "lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full bg-background/50 backdrop-blur-3xl dark:bg-card/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8 translate-y-0 opacity-100 transition-all duration-700">
              <div className="flex items-center gap-2.5">
                <div className="bg-[var(--aura-primary)] text-primary-foreground p-1.5 rounded-xl shadow-lg shadow-primary/20">
                  <BarChart3 size={18} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tight text-foreground leading-none">EPMS</span>
                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest mt-0.5 opacity-60">Enterprise v1.0</span>
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
                  if (item.href === '/announcements' && user?.role !== 'ADMIN') return false;
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
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden',
                      isActive 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'hover:bg-primary/5 text-muted-foreground/80 hover:text-foreground font-semibold'
                    )}
                  >
                    <item.icon 
                      size={18} 
                      strokeWidth={isActive ? 2.5 : 2}
                      className={cn(isActive ? 'text-primary-foreground rotate-0' : 'text-muted-foreground/60 group-hover:text-primary group-hover:scale-110 group-hover:rotate-3 transition-all')} 
                    />
                    <span className="tracking-tight text-sm">{item.label}</span>
                    {isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white/20 rounded-l-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-6 border-t border-divider">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all w-full group font-extrabold tracking-tight text-sm"
            >
              <LogOut size={18} className="group-hover:scale-110 group-hover:-translate-x-1 transition-transform" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
