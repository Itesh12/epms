'use client';

import React from 'react';
import { InsightPattern } from '@epms/shared';
import { AlertCircle, Zap, ShieldCheck, Flame, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InsightCards({ insights }: { insights: InsightPattern[] }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'BURNOUT': return <Flame size={24} className="text-orange-500" />;
      case 'DELAY': return <AlertCircle size={24} className="text-red-500" />;
      case 'IMBALANCE': return <Zap size={24} className="text-purple-500" />;
      case 'EXCELLENCE': return <ShieldCheck size={24} className="text-green-500" />;
      default: return <ArrowUpRight size={24} className="text-blue-500" />;
    }
  };

  const getBg = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'bg-red-50 border-red-100 shadow-red-100/50';
      case 'MEDIUM': return 'bg-orange-50 border-orange-100 shadow-orange-100/50';
      case 'LOW': return 'bg-purple-50 border-purple-100 shadow-purple-100/50';
      default: return 'bg-blue-50 border-blue-100 shadow-blue-100/50';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {insights.map((insight, idx) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          key={idx}
          className={`p-6 rounded-3xl border shadow-xl flex gap-4 ${getBg(insight.severity)}`}
        >
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
            {getIcon(insight.type)}
          </div>
          <div className="flex-1 min-w-0">
             <div className="flex justify-between items-start mb-2">
               <span className="px-2 py-0.5 bg-white/60 text-[10px] font-bold rounded uppercase tracking-wider text-gray-500">Intelligent Pattern</span>
               <span className={`w-2 h-2 rounded-full ${
                 insight.severity === 'HIGH' ? 'bg-red-500' :
                 insight.severity === 'MEDIUM' ? 'bg-orange-500' :
                 'bg-blue-500'
               }`}></span>
             </div>
             <p className="text-sm font-bold text-gray-900 leading-tight">{insight.message}</p>
             <button className="flex items-center gap-1 text-xs font-bold mt-4 opacity-70 hover:opacity-100 transition-opacity">
               VIEW PLAN <ArrowUpRight size={14}/>
             </button>
          </div>
        </motion.div>
      ))}
      {insights.length === 0 && (
        <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-3xl">
           <ShieldCheck size={48} className="mx-auto mb-4 opacity-30" />
           <p className="font-bold text-lg">All systems green.</p>
           <p className="text-sm">No critical performance patterns detected this week.</p>
        </div>
      )}
    </div>
  );
}
