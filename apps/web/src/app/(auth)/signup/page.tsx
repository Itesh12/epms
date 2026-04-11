'use client';

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building, Mail, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

function SignupForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAuth } = useAuthStore();
  
  const initialRole = searchParams.get('role') || 'admin';
  const [step, setStep] = useState(searchParams.get('role') ? 2 : 1);
  const [role, setRole] = useState(initialRole);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organizationName: '',
    inviteCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = role === 'admin' ? '/auth/signup-admin' : '/auth/signup-employee';
      const payload = role === 'admin' 
        ? { 
            name: formData.name, 
            email: formData.email, 
            password: formData.password, 
            organizationName: formData.organizationName 
          }
        : { 
            name: formData.name, 
            email: formData.email, 
            password: formData.password, 
            inviteCode: formData.inviteCode 
          };

      const { data } = await api.post(endpoint, payload);
      setAuth(data.user, data.token);
      setStep(3);
      
      // Auto redirect after showing success for 2 seconds
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  const FormInput = ({ icon: Icon, label, name, ...props }: any) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          {...props}
          name={name}
          value={(formData as any)[name]}
          onChange={handleChange}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
        />
      </div>
    </div>
  );

  return (
    <motion.div 
      layout
      className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-blue-100 p-8 border border-blue-50"
    >
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create an Account</h1>
            <p className="text-gray-500 mb-8">Choose how you want to join our platform</p>
            
            <div className="space-y-4">
              <button 
                onClick={() => handleRoleSelect('admin')}
                className="w-full text-left p-4 rounded-xl border-2 border-blue-100 hover:border-blue-600 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-600 text-white"><Building /></div>
                  <div>
                    <h3 className="font-bold text-gray-900">Organization Admin</h3>
                    <p className="text-sm text-gray-500">Register your company and add employees</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => handleRoleSelect('employee')}
                className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-blue-600 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"><User /></div>
                  <div>
                    <h3 className="font-bold text-gray-900">Employee</h3>
                    <p className="text-sm text-gray-500">Join an existing organization with a code</p>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-600 transition-colors">← Back</button>
              <h2 className="text-2xl font-bold text-gray-900">
                {role === 'admin' ? 'Register Organization' : 'Join Organization'}
              </h2>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} autoComplete="off">
              <FormInput icon={User} label="Full Name" name="name" placeholder="Enter your full name" autoComplete="off" required />
              <FormInput icon={Mail} label="Email Address" name="email" type="email" placeholder="example@company.com" autoComplete="off" required />
              
              {role === 'admin' ? (
                <FormInput icon={Building} label="Organization Name" name="organizationName" placeholder="Enter company name" autoComplete="off" required />
              ) : (
                <FormInput icon={Building} label="Invite Code" name="inviteCode" placeholder="Enter 12-digit invite code" autoComplete="off" required />
              )}
              
              <FormInput icon={Lock} label="Password" name="password" type="password" placeholder="Create a strong password" autoComplete="new-password" required />
              
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-200 mt-4 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{role === 'admin' ? 'Create Organization' : 'Join Account'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-500 mb-8">Your account has been created successfully. Redirecting you to the dashboard...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-6">
      <Suspense fallback={<div className="h-64 w-full max-w-md bg-white rounded-2xl animate-pulse" />}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
