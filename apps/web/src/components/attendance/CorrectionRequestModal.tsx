'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Clock, Calendar, AlertCircle } from 'lucide-react';
import api from '@/services/api';
import { useTranslations } from 'next-intl';

interface CorrectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendanceId?: string;
}

export default function CorrectionRequestModal({ isOpen, onClose, attendanceId }: CorrectionRequestModalProps) {
  const [formData, setFormData] = useState({
    correctionType: 'CHECK_IN',
    requestedTime: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const t = useTranslations('Attendance');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/attendance/corrections', {
        attendanceId,
        ...formData,
        requestedTime: new Date(formData.requestedTime).toISOString()
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({ correctionType: 'CHECK_IN', requestedTime: '', reason: '' });
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || t('modal.failed'));
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
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl relative z-10 p-8"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-gray-900">{t('correction')}</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {success ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('modal.requestSubmitted')}</h3>
                <p className="text-gray-500">{t('modal.hrReview')}</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-bold flex items-center gap-3">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 border-l-2 border-blue-600 pl-2 uppercase tracking-widest">{t('modal.typeLabel')}</label>
                  <select 
                    value={formData.correctionType}
                    onChange={(e) => setFormData({...formData, correctionType: e.target.value})}
                    className="w-full p-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold appearance-none text-gray-900"
                  >
                    <option value="CHECK_IN">{t('modal.types.checkIn')}</option>
                    <option value="CHECK_OUT">{t('modal.types.checkOut')}</option>
                    <option value="BREAK">{t('modal.types.break')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 border-l-2 border-blue-600 pl-2 uppercase tracking-widest">{t('modal.correctedTime')}</label>
                  <div className="relative">
                    <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="datetime-local" 
                      required
                      value={formData.requestedTime}
                      onChange={(e) => setFormData({...formData, requestedTime: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 border-l-2 border-blue-600 pl-2 uppercase tracking-widest">{t('modal.reasonLabel')}</label>
                  <textarea 
                    required
                    rows={3}
                    placeholder={t('modal.reasonPlaceholder')}
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    className="w-full p-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <button 
                  disabled={loading}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-2xl font-black shadow-xl shadow-blue-100 flex items-center justify-center gap-3 transition-all"
                >
                  {loading ? t('modal.submitting') : t('modal.submitButton')}
                  <Send size={18} />
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
