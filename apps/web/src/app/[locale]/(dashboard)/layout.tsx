'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Menu, Home, Users, BarChart2, Settings, LogOut, ChevronLeft, ChevronRight, Shield, Briefcase, Clock, CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AttendanceProvider } from '@/contexts/AttendanceContext';
import { disconnectSocket } from '@/services/socket';
import api from '@/services/api';
import NotificationCenter from '@/components/layout/NotificationCenter';
import LocaleSwitcher from '@/components/layout/LocaleSwitcher';
import { useTranslations } from 'next-intl';

const SidebarItem = ({ icon: Icon, label, href, isCollapsed, isActive }: { 
  icon: React.ComponentType<{ size: number }>, label: string, href: string, isCollapsed: boolean, isActive: boolean 
}) => (
  <Link href={href}>
    <div className={`
      flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200
      ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'hover:bg-gray-100 text-gray-600'}
    `}>
      <Icon size={20} />
      {!isCollapsed && <span className="font-semibold text-sm">{label}</span>}
    </div>
  </Link>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const t = useTranslations('Navigation');
  const commonT = useTranslations('Common');

  const handleLogout = async () => {
    try {
      // Call logout endpoint to clear server-side session
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error calling logout endpoint:', error);
    } finally {
      // Disconnect socket
      disconnectSocket();
      
      // Clear local auth state
      logout();
      
      // Redirect to login
      router.push('/login');
    }
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navItems = [
    { icon: Home, label: t('dashboard'), href: `/dashboard/${user?.role?.toLowerCase()}`, roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
    { icon: Clock, label: t('timesheets'), href: '/timesheets', roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
    { icon: Briefcase, label: t('projects'), href: '/projects', roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
    { icon: CheckSquare, label: t('approvals'), href: '/approvals', roles: ['ADMIN', 'HR', 'MANAGER'] },
    { icon: Users, label: t('workforce'), href: '/employees', roles: ['ADMIN', 'HR', 'MANAGER'] },
    { icon: BarChart2, label: t('analytics'), href: '/analytics', roles: ['ADMIN', 'HR'] },
    { icon: Shield, label: t('security'), href: '/dashboard/hr/security', roles: ['ADMIN', 'HR'] },
    { icon: Settings, label: t('settings'), href: '/settings', roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
  ].filter(item => item.roles.includes(user?.role || ''));

  return (
    <AttendanceProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Mobile Backdrop */}
        <AnimatePresence>
          {isMobile && isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ 
            width: isMobile ? (isSidebarOpen ? 280 : 0) : (isCollapsed ? 80 : 280),
            x: isMobile && !isSidebarOpen ? -280 : 0
          }}
          className={`
            fixed lg:relative z-50 h-full bg-white border-r shadow-sm flex flex-col
            transition-all duration-300 ease-in-out
          `}
        >
          {/* Logo Section */}
          <div className="h-16 flex items-center justify-between px-6 border-b">
            {!isCollapsed && <span className="text-xl font-bold text-blue-600 tracking-tight">{t('portalName')}</span>}
            {!isMobile && (
              <button onClick={() => setCollapsed(!isCollapsed)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 space-y-1.5 mt-6">
            {navItems.map((item) => (
              <SidebarItem 
                key={item.href}
                {...item}
                isActive={pathname === item.href}
                isCollapsed={isCollapsed}
              />
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t bg-gray-50/50">
            <button onClick={handleLogout} className="w-full">
              <SidebarItem icon={LogOut} label={t('signOut')} href="#" isCollapsed={isCollapsed} isActive={false} />
            </button>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Navbar */}
          <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 lg:hidden hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            
            <div className="flex items-center gap-4 ml-auto">
              <LocaleSwitcher />
              <NotificationCenter />
              <div className="text-right hidden sm:block ml-2">
                <span className="block text-sm font-bold text-gray-900">{user?.name}</span>
                <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-tighter bg-blue-50 px-1.5 py-0.5 rounded leading-none">
                  {user?.role ? commonT(`roles.${user.role}`) : ''}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-100">
                {user?.name?.[0]}
              </div>
            </div>
          </header>

          {/* Dynamic Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AttendanceProvider>
  );
}
