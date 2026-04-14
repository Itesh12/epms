'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFlows, createFlow } from '@/services/workflows';
import { ApprovalFlow, ApprovalTargetType } from '@epms/shared';
import { GitBranch, Plus, Save, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function WorkflowsSettings() {
  const t = useTranslations('Settings.workflows');
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  
  const [newFlow, setNewFlow] = useState<{
    name: string;
    targetType: ApprovalTargetType;
    steps: { stepOrder: number; requiredRole: 'ADMIN' | 'MANAGER' | 'HR' | 'DIRECT_MANAGER' }[];
  }>({
    name: '',
    targetType: 'TIMESHEET',
    steps: [{ stepOrder: 1, requiredRole: 'MANAGER' }]
  });

  const { data: flows = [], isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: getFlows,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<ApprovalFlow>) => createFlow(data),
    onSuccess: () => {
      toast.success(t('successToast'));
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      setIsCreating(false);
    }
  });

  const addStep = () => {
    setNewFlow(f => ({
      ...f,
      steps: [...f.steps, { stepOrder: f.steps.length + 1, requiredRole: 'HR' }]
    }));
  };

  const removeStep = (index: number) => {
    setNewFlow(f => {
      const newSteps = [...f.steps];
      newSteps.splice(index, 1);
      return { ...f, steps: newSteps.map((s, i) => ({ ...s, stepOrder: i + 1 })) };
    });
  };

  const updateStepRole = (index: number, role: 'ADMIN' | 'MANAGER' | 'HR' | 'DIRECT_MANAGER') => {
    setNewFlow(f => {
      const newSteps = [...f.steps];
      newSteps[index].requiredRole = role;
      return { ...f, steps: newSteps };
    });
  };

  const handleCreate = () => {
    if (!newFlow.name) return toast.error(t('nameRequiredToast'));
    if (newFlow.steps.length === 0) return toast.error(t('stepRequiredToast'));
    createMutation.mutate(newFlow);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <span className="p-3 bg-purple-100 text-purple-600 rounded-2xl"><GitBranch size={28} /></span>
          {t('title')}
        </h1>
        <p className="text-gray-500 mt-2 text-lg">{t('subtitle')}</p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('activeRoutes')}</h2>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-black transition-colors"
        >
          <Plus size={18} /> {t('newTemplate')}
        </button>
      </div>

      {isCreating && (
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 mb-8 border-t-4 border-t-purple-500">
          <h3 className="text-xl font-bold mb-6">{t('builderTitle')}</h3>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('ruleName')}</label>
              <input value={newFlow.name} onChange={e => setNewFlow(f => ({...f, name: e.target.value}))} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-gray-100 outline-none" placeholder={t('ruleNamePlaceholder')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('targetPayload')}</label>
              <select value={newFlow.targetType} onChange={e => setNewFlow(f => ({...f, targetType: e.target.value as any}))} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-gray-100 outline-none">
                <option value="TIMESHEET">{t('payloadTypes.TIMESHEET')}</option>
                <option value="LEAVE">{t('payloadTypes.LEAVE')}</option>
                <option value="ATTENDANCE_CORRECTION">{t('payloadTypes.ATTENDANCE_CORRECTION')}</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-900 uppercase tracking-widest">{t('routingSteps')}</label>
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl space-y-4">
              {newFlow.steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">
                    {step.stepOrder}
                  </div>
                  <div className="flex-1">
                    <select 
                      value={step.requiredRole} 
                      onChange={e => updateStepRole(idx, e.target.value as 'ADMIN' | 'MANAGER' | 'HR' | 'DIRECT_MANAGER')}
                      className="w-full outline-none font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-lg p-1"
                    >
                      <option value="MANAGER">{t('roles.MANAGER')}</option>
                      <option value="DIRECT_MANAGER">{t('roles.DIRECT_MANAGER')}</option>
                      <option value="HR">{t('roles.HR')}</option>
                      <option value="ADMIN">{t('roles.ADMIN')}</option>
                    </select>
                  </div>
                  <button onClick={() => removeStep(idx)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={18}/></button>
                </div>
              ))}
              <div className="pt-2">
                <button onClick={addStep} className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 font-medium rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                   <Plus size={18} /> {t('addNextStep')}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 flex justify-end gap-3">
             <button onClick={() => setIsCreating(false)} className="px-6 py-2.5 text-gray-600 font-medium rounded-xl hover:bg-gray-100">{t('cancel')}</button>
             <button onClick={handleCreate} disabled={createMutation.isPending} className="px-6 py-2.5 bg-purple-600 font-medium text-white rounded-xl shadow-lg shadow-purple-200 flex items-center gap-2 hover:bg-purple-700 disabled:opacity-50">
               <Save size={18} /> {t('deployButton')}
             </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? <div className="p-8 text-center text-gray-500">{t('loading')}</div> : 
          flows.map((flow: ApprovalFlow) => (
            <div key={flow.id || (flow as any)._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div>
                 <div className="flex gap-2 items-center mb-2">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase tracking-wider">
                      {t(`payloadTypes.${flow.targetType}`)}
                    </span>
                    {flow.isActive && <span className="w-2 h-2 rounded-full bg-green-500" title="Active"></span>}
                 </div>
                 <h3 className="text-xl font-bold text-gray-900">{flow.name}</h3>
               </div>
               
               <div className="flex items-center gap-2 flex-wrap">
                  {flow.steps.map((step, idx) => (
                    <React.Fragment key={idx}>
                      <div className="px-4 py-2 bg-purple-50 text-purple-700 font-bold text-sm rounded-lg border border-purple-100 shadow-sm">
                        {step.requiredRole.replace('_', ' ')}
                      </div>
                      {idx < flow.steps.length - 1 && <ArrowRight size={16} className="text-gray-300" />}
                    </React.Fragment>
                  ))}
               </div>
            </div>
        ))}
        {!isLoading && flows.length === 0 && (
           <div className="text-center p-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
             <p className="text-gray-500 font-medium">{t('noRoutes')}</p>
           </div>
        )}
      </div>

    </div>
  );
}
