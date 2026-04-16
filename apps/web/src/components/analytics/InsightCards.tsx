'use client';

import React from 'react';
import { InsightPattern } from '@epms/shared';
import { AlertCircle, Zap, ShieldCheck, Flame, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function InsightCards({ insights }: { insights: InsightPattern[] }) {
  const t = useTranslations('Analytics');
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'BURNOUT': return <Flame size={24} className="text-orange-500" />;
      case 'DELAY': return <AlertCircle size={24} className="text-rose-500" />;
      case 'IMBALANCE': return <Zap size={24} className="text-amber-500" />;
      case 'EXCELLENCE': return <ShieldCheck size={24} className="text-emerald-500" />;
      default: return <ArrowUpRight size={24} className="text-blue-500" />;
    }
  };

  const getTheme = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'from-rose-500/10 to-transparent border-rose-200/50 text-rose-600';
      case 'MEDIUM': return 'from-orange-500/10 to-transparent border-orange-200/50 text-orange-600';
      case 'LOW': return 'from-amber-500/10 to-transparent border-amber-200/50 text-amber-600';
      default: return 'from-blue-500/10 to-transparent border-blue-200/50 text-blue-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {insights.map((insight, idx) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
          key={idx}
          className={`group relative p-8 rounded-[2.5rem] border backdrop-blur-xl bg-white/60 shadow-2xl shadow-gray-200/50 flex flex-col gap-6 overflow-hidden bg-gradient-to-br ${getTheme(insight.severity)}`}
        >
          <div className="flex justify-between items-start">
            <div className="w-14 h-14 bg-white/80 rounded-2xl flex items-center justify-center shadow-inner-lg group-hover:scale-110 transition-transform duration-300">
              {getIcon(insight.type)}
            </div>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-white shadow-sm border ${getTheme(insight.severity)}`}>
              {insight.severity}
            </div>
          </div>

          <div className="space-y-4">
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('intelligentPattern')}</span>
             <p className="text-lg font-bold text-gray-900 leading-tight group-hover:text-gray-800 tracking-tight">
               {insight.message}
             </p>
          </div>

          <div className="mt-auto pt-6 border-t border-gray-100/50 flex items-center justify-between">
            <button className="text-sm font-black flex items-center gap-2 group-hover:gap-3 transition-all">
              {t('viewPlan')} <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"/>
            </button>
            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-20" />
          </div>
        </motion.div>
      ))}
      
      {insights.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="col-span-full py-20 text-center bg-white/40 border-2 border-dashed border-gray-200/50 rounded-[3rem] backdrop-blur-sm"
        >
           <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-100/50">
             <ShieldCheck size={40} />
           </div>
           <h3 className="text-2xl font-black text-gray-900 mb-2">{t('allSystemsGreen')}</h3>
           <p className="text-gray-500 font-medium">{t('noCriticalPatterns')}</p>
        </motion.div>
      )}
    </div>
  );
}
