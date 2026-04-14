'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Calendar, MoreVertical, Shield, Loader2 } from 'lucide-react';
import { useSocket } from '@/components/realtime/SocketProvider';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';

const EmployeeCard = ({ emp }: { emp: any }) => {
  const t = useTranslations('Workforce');
  const commonT = useTranslations('Common');
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow lg:hidden mb-4"
    >
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold relative">
          {emp.name.split(' ').map((n: string) => n[0]).join('')}
          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${emp.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{emp.name}</h3>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{emp.dept || t('engineering')}</p>
        </div>
      </div>
      <button className="p-1 hover:bg-gray-50 rounded"><MoreVertical size={18} /></button>
    </div>
    
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Mail size={16} className="text-gray-400" />
        <span>{emp.email}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Shield size={16} className="text-gray-400" />
        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold ring-1 ring-blue-100">{commonT(`roles.${emp.role}`)}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Calendar size={16} className="text-gray-400" />
        <span>{t('joined', { date: format(new Date(emp.createdAt), 'MMM dd, yyyy') })}</span>
      </div>
    </div>
  </motion.div>
  );
};

export default function EmployeesPage() {
  const t = useTranslations('Workforce');
  const commonT = useTranslations('Common');
  const { onlineUsers } = useSocket();
  const { data: employees, isLoading, error } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await api.get('/employees');
      return response.data.map((e: any) => ({
        ...e,
        isOnline: onlineUsers.includes(e._id || e.id)
      }));
    }
  });

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-gray-500 font-medium">{t('fetching')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-500">{t('subtitle')}</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-100">
          <UserPlus size={20} />
          <span>{t('addEmployee')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: t('totalEmployees'), value: employees?.length || 0, change: '+100%' },
          { label: t('activeStatus'), value: t('live'), change: 'OK' },
          { label: t('cloudSync'), value: t('ready'), change: '100%' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg mb-1">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('table.employee')}</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('table.statusRole')}</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('table.department')}</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('table.joinedDate')}</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees?.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">{t('noEmployees')}</td>
                </tr>
            )}
            {employees?.map((emp: any) => (
              <tr key={emp._id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm relative">
                      {emp.name[0]}
                      <span className={`absolute bottom-[-2px] right-[-2px] w-2.5 h-2.5 rounded-full border-2 border-white ${emp.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 leading-none mb-1">{emp.name}</div>
                      <div className="text-xs text-gray-500 font-medium">{emp.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">{commonT(`roles.${emp.role}`)}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-gray-600">{emp.dept || t('engineering')}</span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-500">
                  {format(new Date(emp.createdAt), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 group-hover:text-gray-600">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden">
        {employees?.map((emp: any) => <EmployeeCard key={emp._id} emp={emp} />)}
      </div>
    </div>
  );
}
