'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';

interface OrganizationBranding {
  name: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
}

interface OrgThemeContextType {
  branding: OrganizationBranding | null;
  refreshBranding: () => Promise<void>;
}

const OrgThemeContext = createContext<OrgThemeContextType | undefined>(undefined);

export const useOrgTheme = () => {
  const context = useContext(OrgThemeContext);
  if (!context) throw new Error('useOrgTheme must be used within OrgThemeProvider');
  return context;
};

export function OrgThemeProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<OrganizationBranding | null>(null);
  const user = useAuthStore((state) => state.user);

  const applyTheme = (primary: string, secondary: string) => {
    const root = document.documentElement;
    
    // Inject primary and secondary colors
    root.style.setProperty('--primary', primary);
    root.style.setProperty('--aura-primary', `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`);
    
    // Auto-contrast detection for primary foreground
    const isLight = isColorLight(primary);
    root.style.setProperty('--primary-foreground', isLight ? '#020617' : '#ffffff');
  };

  const isColorLight = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155; // Threshold for switching to dark text
  };

  const fetchBranding = async () => {
    if (!user) return;
    try {
      const res = await api.get('/organizations/me');
      setBranding(res.data);
      if (res.data.primaryColor && res.data.secondaryColor) {
        applyTheme(res.data.primaryColor, res.data.secondaryColor);
      }
    } catch (error) {
      console.error('Failed to fetch organization branding', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBranding();
    } else {
      // Reset to defaults if logged out
      const root = document.documentElement;
      root.style.removeProperty('--primary');
      root.style.removeProperty('--aura-primary');
      root.style.removeProperty('--primary-foreground');
      setBranding(null);
    }
  }, [user]);

  return (
    <OrgThemeContext.Provider value={{ branding, refreshBranding: fetchBranding }}>
      {children}
    </OrgThemeContext.Provider>
  );
}
