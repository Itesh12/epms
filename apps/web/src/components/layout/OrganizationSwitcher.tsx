'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ChevronDown, Check, Plus, Loader2 } from 'lucide-react';
import { getMyOrganizations, Organization, switchOrganization } from '@/services/organizations';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import CreateOrganizationModal from '../modals/CreateOrganizationModal';

export default function OrganizationSwitcher({ isCollapsed }: { isCollapsed: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, token, switchOrg } = useAuthStore();

  const currentOrg = organizations.find(org => org._id === user?.organizationId);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const data = await getMyOrganizations();
        setOrganizations(data);
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user && user.role === 'ADMIN') {
      fetchOrgs();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleSwitch = async (orgId: string) => {
    if (orgId === user?.organizationId) return;

    try {
      const data = await switchOrganization(orgId);
      switchOrg(data.user, data.token);
      setIsOpen(false);
      toast.success(`Switched to ${data.user.organizationId === orgId ? data.message : 'Organization'}`);
      // Refresh page to clear any cached data
      window.location.reload();
    } catch (error) {
      toast.error('Failed to switch organization');
    }
  };

  const handleOrgCreated = (newOrg: any, newToken: string) => {
    setOrganizations(prev => [...prev, newOrg]);
    if (user) {
      switchOrg({
        ...user,
        organizationId: newOrg._id
      }, newToken);
      window.location.reload();
    }
  };

  if (user?.role !== 'ADMIN') return null;

  return (
    <div className="relative px-4 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300
          ${isOpen ? 'bg-blue-50 ring-2 ring-blue-600' : 'hover:bg-gray-50 border border-transparent'}
        `}
      >
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100 flex-shrink-0">
          <Building2 size={20} />
        </div>
        
        {!isCollapsed && (
          <>
            <div className="flex-1 text-left overflow-hidden">
              <span className="block text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                Organization
              </span>
              <span className="block text-sm font-bold text-gray-900 truncate">
                {currentOrg?.name || 'Loading...'}
              </span>
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40 outline-none" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute left-4 right-4 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
            >
              <div className="p-2 space-y-1">
                {loading ? (
                  <div className="p-4 flex items-center justify-center text-gray-400">
                    <Loader2 size={20} className="animate-spin" />
                  </div>
                ) : (
                  <>
                    {organizations.map((org) => (
                      <button
                        key={org._id}
                        onClick={() => handleSwitch(org._id)}
                        className={`
                          w-full flex items-center justify-between p-3 rounded-xl transition-all
                          ${org._id === user?.organizationId 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'hover:bg-gray-50 text-gray-600'}
                        `}
                      >
                        <span className="font-bold text-sm truncate pr-4">{org.name}</span>
                        {org._id === user?.organizationId && <Check size={16} />}
                      </button>
                    ))}
                    
                    <div className="h-px bg-gray-100 my-2" />
                    
                    <button
                      onClick={() => {
                        setIsModalOpen(true);
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-blue-600 transition-all"
                    >
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Plus size={16} />
                      </div>
                      <span className="font-black text-xs uppercase tracking-widest">Add New Org</span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CreateOrganizationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleOrgCreated}
      />
    </div>
  );
}
