'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Plus, Loader2 } from 'lucide-react';
import { createOrganization } from '@/services/organizations';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (org: any, token: string) => void;
}

export default function CreateOrganizationModal({ isOpen, onClose, onSuccess }: CreateOrganizationModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const data = await createOrganization(name);
      toast.success('Organization created successfully');
      onSuccess(data.organization, data.token);
      onClose();
      setName('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">New Organization</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Expansion begins here</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Organization Name
                  </label>
                  <input
                    autoFocus
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Acme Corp Global"
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className={`
                    w-full py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest
                    transition-all duration-300 flex items-center justify-center gap-3
                    ${loading || !name.trim() 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 text-white shadow-xl shadow-blue-200 hover:shadow-2xl hover:scale-[1.02] active:scale-95'}
                  `}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Plus size={20} />
                      Create Organization
                    </>
                  )}
                </button>
              </form>
            </div>
            
            <div className="p-6 bg-gray-50 border-t flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter italic">
                Each organization has its own teams, projects, and billing.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
