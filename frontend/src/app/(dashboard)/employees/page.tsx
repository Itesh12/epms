'use client';

import { useEffect, useState } from 'react';
import { Plus, Loader2, Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AddEmployeeModal } from '@/components/employees/AddEmployeeModal';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { useProfileStore } from '@/store/useProfileStore';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function EmployeesPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { openProfile } = useProfileStore();

  const fetchEmployees = async (silent = false) => {
    if (silent) setIsRefreshing(true);
    else setIsLoading(true);
    try {
      const res = await api.get('/users');
      setEmployees(res.data);
    } catch (error) {
      console.error('Failed to fetch employees', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    window.addEventListener('employee-updated', () => fetchEmployees(true));
    return () => window.removeEventListener('employee-updated', () => fetchEmployees(true));
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Users size={14} className="text-primary" />
            </div>
            <span className="text-[11px] font-black text-primary uppercase tracking-widest">Employee Directory</span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight leading-tight">
            Team Management
          </h1>
          <p className="text-muted-foreground text-sm font-medium max-w-md leading-relaxed opacity-70">
            View, manage, and update employee profiles and organizational structure.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => fetchEmployees(true)}
            disabled={isRefreshing}
            className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-muted-foreground hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          {isAdmin && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none rounded-xl h-9 px-5 text-sm font-bold"
            >
              <Plus size={16} className="mr-2" />
              Add Employee
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
            <span className="text-sm text-muted-foreground font-medium">Loading employees...</span>
          </div>
        </div>
      ) : (
        <EmployeeTable
          employees={employees}
          onUpdate={() => fetchEmployees(true)}
          onRowClick={(id) => openProfile(id)}
        />
      )}

      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchEmployees(true)}
      />
    </div>
  );
}
