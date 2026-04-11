'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  React.useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-blue-100 p-8 border border-blue-50"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-500">Sign in to your enterprise portal</p>
        </div>

        <form className="space-y-6" autoComplete="off">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              placeholder="Enter your email address"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              placeholder="Enter your password"
              autoComplete="new-password"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded text-blue-600" />
              <span className="text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-blue-600 font-semibold hover:underline">Forgot password?</a>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-95">
            Sign In
          </button>
        </form>

        <div className="mt-10 space-y-4 border-t pt-8 border-gray-100">
          <p className="text-sm text-gray-500 text-center font-medium">New to EPMS?</p>
          <div className="flex flex-col gap-3">
            <Link 
              href="/signup?role=admin" 
              className="w-full py-3 px-4 rounded-xl border-2 border-blue-50 text-blue-600 font-bold text-sm text-center hover:bg-blue-50 hover:border-blue-100 transition-all"
            >
              Register your Organization
            </Link>
            <Link 
              href="/signup?role=employee" 
              className="w-full py-3 px-4 rounded-xl border-2 border-gray-50 text-gray-600 font-bold text-sm text-center hover:bg-gray-50 hover:border-gray-100 transition-all"
            >
              Join with Invite Code
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
