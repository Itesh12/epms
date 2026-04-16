'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, Users, BarChart3 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ComponentType<{ size: number }>, title: string, description: string }) => (
  <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 leading-relaxed">{description}</p>
  </div>
);

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      const dashboardUrl = `/dashboard/${user.role.toLowerCase()}`;
      router.push(dashboardUrl);
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="h-20 flex items-center justify-between px-6 lg:px-12 max-w-7xl mx-auto">
        <span className="text-2xl font-bold text-blue-600 tracking-tight">EPMS.</span>
        <div className="flex items-center gap-8">
          <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors uppercase tracking-widest">Sign In</Link>
          <Link href="/signup?role=admin" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest">Register Org</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-bold mb-6">
              Phase 1 Foundational System Live
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 mb-8 tracking-tight max-w-4xl mx-auto leading-[1.1]">
              Manage your Enterprise with <span className="text-blue-600">Absolute Precision.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              The only SaaS architecture designed for multi-tenant scalability, secure RBAC, and mobile-first workforce management.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/signup?role=admin" 
                className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
              >
                Register Organization <ArrowRight size={20} />
              </Link>
              <Link 
                href="/signup?role=employee" 
                className="w-full sm:w-auto bg-white text-gray-900 border-2 border-gray-100 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-gray-50 transition-all text-center"
              >
                Join Organization
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-blue-50/50 via-white to-white pointer-events-none" />
      </header>

      {/* Feature Grid */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={Shield} 
              title="Secure Auth" 
              description="Enterprise-grade JWT architecture with secure HttpOnly cookies."
            />
            <FeatureCard 
              icon={Users} 
              title="Multi-tenant" 
              description="Complete data isolation with organization-scoped logic built-in."
            />
            <FeatureCard 
              icon={Zap} 
              title="Mobile First" 
              description="Responsive layouts that transform complex tables into clean mobile cards."
            />
            <FeatureCard 
              icon={BarChart3} 
              title="Scalable API" 
              description="Clean Architecture principles ensuring future-proof expansion."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row justify-between items-center gap-6">
          <span className="text-xl font-bold text-gray-900">EPMS.</span>
          <p className="text-gray-500 text-sm">© 2026 Enterprise Solutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
