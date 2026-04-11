'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, Lock, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const FormInput = ({ icon: Icon, label, ...props }: any) => (
  <div className="mb-6">
    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">{label}</label>
    <div className="relative">
      <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      <input 
        {...props}
        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-blue-600 focus:ring-0 transition-all outline-none text-gray-900 font-medium placeholder:text-gray-300"
      />
    </div>
  </div>
);

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Request, 2: Reset Form, 3: Success
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-white flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100/50 p-10 border border-blue-50/50"
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
                <ShieldCheck size={32} />
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Forgot Password?</h1>
              <p className="text-gray-500 mb-10 leading-relaxed font-medium">
                Enter your email address and we'll notify your Admin or HR to generate your reset code.
              </p>

              <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} autoComplete="off">
                <FormInput 
                  icon={Mail} 
                  label="Email Address" 
                  type="email" 
                  placeholder="Enter your registered email" 
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  required 
                />
                
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-xl shadow-blue-100 mt-4 flex items-center justify-center gap-3 active:scale-95">
                  <span>Request Reset Code</span>
                  <ArrowRight size={20} />
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-gray-50 text-center">
                <Link href="/login" className="text-sm font-bold text-gray-400 hover:text-blue-600 flex items-center justify-center gap-2 transition-colors group">
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  Back to Sign In
                </Link>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
               <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Security Reset</h1>
              <p className="text-gray-500 mb-10 leading-relaxed font-medium">
                Contact your **Admin or HR** to get your 6-digit reset code, then enter it below.
              </p>

              <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} autoComplete="off">
                <div className="mb-8">
                    <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-tight text-center">Verification Code</label>
                    <div className="flex justify-between gap-2">
                        {[1,2,3,4,5,6].map(i => (
                            <input 
                                key={i}
                                type="text"
                                maxLength={1}
                                className="w-12 h-14 bg-gray-50 border-2 border-gray-100 rounded-xl text-center font-black text-xl text-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all shadow-sm"
                                placeholder="•"
                            />
                        ))}
                    </div>
                </div>

                <FormInput icon={Lock} label="New Password" type="password" placeholder="Create a new password" required />
                
                <button className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 px-6 rounded-2xl transition-all shadow-xl mt-4 flex items-center justify-center gap-3">
                  Reset Password
                </button>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <CheckCircle size={48} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Password Reset!</h2>
              <p className="text-gray-500 mb-10 leading-relaxed font-medium">Your account security has been updated. You can now sign in with your new password.</p>
              
              <Link href="/login" className="inline-block w-full bg-blue-600 text-white font-black py-4 px-8 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                Proceed to Login
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
