'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const router = useRouter();
  const { user, setAuth } = useAuthStore();
  const t = useTranslations('Auth');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.user, data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || t('loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-blue-100 p-8 border border-blue-50"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('loginTitle')}</h1>
          <p className="text-gray-500">{t('loginSubtitle')}</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium"
          >
            {error}
          </motion.div>
        )}

        <form className="space-y-6" autoComplete="off" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('emailLabel')}</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950"
              placeholder={t('emailPlaceholder')}
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('passwordLabel')}</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950"
                placeholder={t('passwordPlaceholder')}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded text-blue-600" />
              <span className="text-gray-600">{t('rememberMe')}</span>
            </label>
            <Link href="/forgot-password" title="Forgot Password Page" className="text-blue-600 font-semibold hover:underline">{t('forgotPassword')}</Link>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : t('signInButton')}
          </button>
        </form>

        <div className="mt-10 space-y-4 border-t pt-8 border-gray-100">
          <p className="text-sm text-gray-500 text-center font-medium">{t('newToPortal')}</p>
          <div className="flex flex-col gap-3">
            <Link 
              href="/signup?role=admin" 
              className="w-full py-3 px-4 rounded-xl border-2 border-blue-50 text-blue-600 font-bold text-sm text-center hover:bg-blue-50 hover:border-blue-100 transition-all"
            >
              {t('registerOrg')}
            </Link>
            <Link 
              href="/signup?role=employee" 
              className="w-full py-3 px-4 rounded-xl border-2 border-gray-50 text-gray-600 font-bold text-sm text-center hover:bg-gray-50 hover:border-gray-100 transition-all"
            >
              {t('joinWithInvite')}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
