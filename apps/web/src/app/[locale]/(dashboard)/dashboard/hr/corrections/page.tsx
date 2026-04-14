'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, User, AlertCircle, Search, Filter } from 'lucide-react';
import api from '@/services/api';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function HRCorrectionsPage() {
  const [corrections, setCorrections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [comment, setComment] = useState('');

  const fetchCorrections = async () => {
    try {
      const { data } = await api.get('/attendance/corrections/pending');
      setCorrections(data);
    } catch (error) {
      console.error('Failed to fetch corrections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCorrections();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await api.patch(`/attendance/corrections/${id}/${action}`, { adminComment: comment });
      toast.success(`Request ${action}d successfully`);
      setCorrections(corrections.filter(c => c._id !== id));
      setSelectedRequest(null);
      setComment('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Attendance Queue</h1>
          <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mt-1">Review and approve employee adjustment requests</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              placeholder="Search employee..." 
              className="pl-12 pr-4 py-3 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/40 outline-none w-64 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600"
            />
          </div>
          <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-3xl" />)}
        </div>
      ) : corrections.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">Queue is Clear!</h3>
          <p className="text-gray-400 font-bold max-w-sm mx-auto uppercase tracking-tighter">Everything has been processed. Great job staying on top of the requests.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {corrections.map((request) => (
            <motion.div 
              layout
              key={request._id}
              className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-50/50 hover:shadow-blue-100/50 transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-2 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">
                  {request.userId.name[0]}
                </div>
                <div>
                  <h4 className="font-black text-gray-900 leading-none mb-1">{request.userId.name}</h4>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded inline-block">
                    {request.correctionType.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-gray-500 font-bold">
                  <Clock size={16} />
                  <span>Requested: {format(new Date(request.requestedTime), 'MMM dd, hh:mm a')}</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Reason</p>
                  <p className="text-sm font-bold text-gray-700 leading-relaxed italic">"{request.reason}"</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => handleAction(request._id, 'approve')}
                  className="flex-1 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-black text-xs transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={14} />
                  APPROVE
                </button>
                <button 
                  onClick={() => handleAction(request._id, 'reject')}
                  className="flex-1 py-3 bg-white border border-gray-100 text-gray-400 hover:text-red-600 hover:border-red-100 rounded-xl font-black text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <XCircle size={14} />
                  REJECT
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
