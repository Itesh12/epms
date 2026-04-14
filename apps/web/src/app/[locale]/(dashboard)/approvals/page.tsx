'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingApprovals, actionApproval } from '@/services/workflows';
import { ApprovalRequest, ApprovalTargetType } from '@epms/shared';
import { CheckSquare, XCircle, CheckCircle2, Clock, FileText, CalendarOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function ApprovalsInbox() {
  const t = useTranslations('Approvals');
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);

  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: getPendingApprovals,
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action, comment }: { id: string, action: 'APPROVE' | 'REJECT', comment?: string }) => actionApproval(id, action, comment),
    onSuccess: () => {
      toast.success(t('successMessage'));
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      setSelectedRequest(null);
    }
  });

  const getIcon = (type: ApprovalTargetType) => {
    switch (type) {
      case 'TIMESHEET': return <Clock className="text-blue-600" size={24} />;
      case 'LEAVE': return <CalendarOff className="text-purple-600" size={24} />;
      case 'ATTENDANCE_CORRECTION': return <FileText className="text-orange-600" size={24} />;
      default: return <FileText className="text-gray-600" size={24} />;
    }
  };

  const getBg = (type: ApprovalTargetType) => {
    switch (type) {
      case 'TIMESHEET': return 'bg-blue-100';
      case 'LEAVE': return 'bg-purple-100';
      case 'ATTENDANCE_CORRECTION': return 'bg-orange-100';
      default: return 'bg-gray-100';
    }
  };

  if (isLoading) return <div className="p-8 text-gray-500 animate-pulse">{t('loading')}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><CheckSquare size={24} /></span>
            {t('title')}
          </h1>
          <p className="text-gray-500 mt-1">{t('subtitle')}</p>
        </div>
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl ring-4 ring-indigo-50/50">
          {approvals.length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inbox List */}
        <div className="lg:col-span-1 space-y-3">
          {approvals.map((req: ApprovalRequest) => (
            <motion.div
              layout
              key={req.id || (req as any)._id}
              onClick={() => setSelectedRequest(req)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedRequest?.id === (req.id || (req as any)._id)
                  ? 'border-indigo-500 bg-indigo-50/30'
                  : 'border-gray-100 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-xl flex-shrink-0 ${getBg(req.targetType)}`}>
                  {getIcon(req.targetType)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{(req as any).requesterId?.name || 'User'}</h3>
                  <p className="text-sm text-gray-500 font-medium">{t(`types.${req.targetType}`)} {t('requestSuffix')}</p>
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <Clock size={12}/> 
                    {req.createdAt ? format(new Date(req.createdAt), 'MMM d, h:mm a') : t('unknownDate')}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          {approvals.length === 0 && (
            <div className="p-12 text-center text-gray-500 bg-white border border-gray-100 rounded-2xl">
              <CheckCircle2 size={48} className="mx-auto mb-4 text-green-300" />
              <p className="font-medium text-lg text-gray-900">{t('emptyInboxTitle')}</p>
              <p className="text-sm mt-1">{t('emptyInboxSubtitle')}</p>
            </div>
          )}
        </div>

        {/* Detail View */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="popLayout">
            {selectedRequest ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm sticky top-6"
              >
                <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {(selectedRequest as any).requesterId?.name?.[0]}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{(selectedRequest as any).requesterId?.name}</h2>
                      <p className="text-gray-500 font-medium">
                        {t('stepInfo', { current: selectedRequest.currentStepOrder, total: ((selectedRequest as any).flowId?.steps?.length) || 1 })} • {t(`types.${selectedRequest.targetType}`)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">{t('requestDetails')}</h4>
                  <div className="space-y-4 text-gray-700">
                     <p><strong>{t('trackingId')}</strong> {selectedRequest.targetId}</p>
                     <p>{t('formalRequestNote')}</p>
                     <p className="text-xs text-gray-400 mt-4">{t('automatedFetchNote')}</p>
                  </div>
                </div>

                <form onSubmit={(e: any) => {
                  e.preventDefault();
                  const action = e.nativeEvent.submitter.dataset.action;
                  const comment = e.target.comment.value;
                  actionMutation.mutate({ id: selectedRequest.id || (selectedRequest as any)._id, action, comment });
                }}>
                  <p className="text-sm font-bold text-gray-500 mb-2">{t('commentLabel')}</p>
                  <textarea name="comment" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 min-h-[100px] resize-none focus:ring-2 focus:ring-indigo-500 outline-none mb-6 text-gray-900 dark:text-gray-100" placeholder={t('commentPlaceholder')} />
                  
                  <div className="flex gap-4">
                    <button type="submit" data-action="REJECT" disabled={actionMutation.isPending} className="flex-1 py-3 px-6 rounded-xl font-bold border-2 border-red-100 text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50">
                      {t('rejectButton')}
                    </button>
                    <button type="submit" data-action="APPROVE" disabled={actionMutation.isPending} className="flex-1 py-3 px-6 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      <CheckCircle2 size={20} />
                      {t('approveButton')}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <div key="empty" className="h-[400px] flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                 <CheckSquare size={48} className="mb-4 text-gray-300" />
                 <p className="font-semibold text-lg">{t('selectPrompt')}</p>
                 <p className="text-sm mt-1">{t('selectSubtitle')}</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
