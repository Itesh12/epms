'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { EmployeeDetailDrawer } from '@/components/employees/EmployeeDetailDrawer';
import { useProfileStore } from '@/store/useProfileStore';
import { useAuthStore } from '@/store/useAuthStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isOpen, selectedEmployeeId, closeProfile } = useProfileStore();

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 selection:text-primary">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="lg:pl-[18rem] flex flex-col min-h-screen transition-all duration-500">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="p-4 lg:p-10 flex-1 lg:max-w-[1600px] lg:mx-auto w-full">
          {children}
        </main>
      </div>

      <EmployeeDetailDrawer 
        employeeId={selectedEmployeeId}
        isOpen={isOpen}
        onClose={closeProfile}
        onUpdate={() => {
          // You might want to refresh current page data if needed
          window.dispatchEvent(new CustomEvent('employee-updated'));
        }}
      />
    </div>
  );
}
