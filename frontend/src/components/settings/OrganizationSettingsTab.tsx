'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  Loader2, 
  Globe, 
  Mail, 
  MapPin, 
  Users, 
  Palette, 
  Image as ImageIcon,
  Save,
  RotateCcw,
  ExternalLink,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';
import api from '@/services/api';
import { useOrgTheme } from '@/components/providers/OrgThemeProvider';
import { cn } from '@/lib/utils';

export function OrganizationSettingsTab() {
  const { branding, refreshBranding } = useOrgTheme();
  
  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    primaryColor: '#6366f1',
    secondaryColor: '#4338ca',
    address: '',
    website: '',
    contactEmail: '',
    industry: '',
    size: ''
  });

  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchOrg() {
      try {
        const res = await api.get('/organizations/me');
        const data = {
          name: res.data.name || '',
          logoUrl: res.data.logoUrl || '',
          primaryColor: res.data.primaryColor || '#6366f1',
          secondaryColor: res.data.secondaryColor || '#4338ca',
          address: res.data.address || '',
          website: res.data.website || '',
          contactEmail: res.data.contactEmail || '',
          industry: res.data.industry || '',
          size: res.data.size || ''
        };
        setFormData(data);
        setInitialData(data);
      } catch (err) {
        console.error('Failed to load organization settings', err);
        toast.error('Identity records sync error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrg();
  }, []);

  const industryOptions: SelectOption[] = [
    { value: 'TECHNOLOGY', label: 'Technology / Software' },
    { value: 'FINANCE', label: 'Financial Services' },
    { value: 'HEALTHCARE', label: 'Healthcare' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'RETAIL', label: 'Retail / E-commerce' },
    { value: 'MANUFACTURING', label: 'Manufacturing' },
    { value: 'OTHER', label: 'Other / Specialized' },
  ];

  const sizeOptions: SelectOption[] = [
    { value: '1-10', label: '1 - 10 Employees' },
    { value: '11-50', label: '11 - 50 Employees' },
    { value: '51-200', label: '51 - 200 Employees' },
    { value: '201-500', label: '201 - 500 Employees' },
    { value: '501-1000', label: '501 - 1000 Employees' },
    { value: '1000+', label: '1000+ Enterprise' },
  ];

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !hasChanges) return;

    setIsSaving(true);
    try {
      await api.patch('/organizations/me', formData);
      toast.success('Organization branding synchronized');
      setInitialData(formData);
      await refreshBranding(); // Trigger dynamic re-theming
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    if (initialData) setFormData(initialData);
  };

  if (isLoading) {
    return (
      <div className="flex w-full h-full items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-1000 h-full flex flex-col pb-10">
      {/* Branding Header Area */}
      <div className="flex flex-col md:flex-row gap-10 items-center justify-between mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
             <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Palette className="text-primary" size={16} strokeWidth={2.5} />
             </div>
             <h2 className="text-[9px] font-black text-primary uppercase tracking-[0.2em] leading-none mb-0.5">Brand Identity Hub</h2>
          </div>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Organization <span className="text-primary">Branding</span></h1>
          <p className="text-[10px] text-muted-foreground font-medium max-w-sm uppercase tracking-widest leading-relaxed">
             Define your corporate aesthetics, logo, and metadata to professionalize your entire workspace.
          </p>
        </div>

        <div className="flex items-center gap-10">
           {/* Logo Preview */}
           <div className="flex flex-col items-center gap-2">
              <div className="w-24 h-24 rounded-[32px] bg-muted/20 border border-divider flex items-center justify-center overflow-hidden shadow-inner group relative">
                 {formData.logoUrl ? (
                   <img src={formData.logoUrl} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                 ) : (
                   <ImageIcon size={32} className="text-muted-foreground/20" />
                 )}
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-[8px] font-black text-white uppercase tracking-widest">Logo Preview</p>
                 </div>
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 text-center">Brand Mark</span>
           </div>

           {/* Color Preview */}
           <div className="flex flex-col items-center gap-2">
              <div 
                className="w-24 h-24 rounded-[32px] border border-divider shadow-inner relative flex flex-col overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor})` }}
              >
                 <div className="mt-auto p-2 bg-black/20 backdrop-blur-md border-t border-white/10 flex justify-center">
                    <p className="text-[8px] font-black text-white uppercase tracking-widest">Aura Theme</p>
                 </div>
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 text-center">Dynamic Gradient</span>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Core Identity Grid */}
        <section className="space-y-6">
           <div className="flex items-center gap-3">
              <p className="text-[10px] font-black uppercase tracking-widest leading-none text-muted-foreground">Core Identity</p>
              <div className="h-px flex-1 bg-divider" />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Corporate Name" 
                placeholder="Nexus Global Inc."
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-muted/10 border-divider rounded-2xl h-12 text-[11px] font-black"
                required
              />
              <Input 
                label="Branding Logo (URL)" 
                placeholder="https://example.com/logo.png"
                value={formData.logoUrl}
                onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                className="bg-muted/10 border-divider rounded-2xl h-12 text-[11px] font-black"
              />
           </div>
        </section>

        {/* Brand Theme Colors */}
        <section className="space-y-6">
           <div className="flex items-center gap-3">
              <p className="text-[10px] font-black uppercase tracking-widest leading-none text-muted-foreground">Aura Design System</p>
              <div className="h-px flex-1 bg-divider" />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Primary Brand Color</label>
                 <div className="flex items-center gap-3 p-2 bg-muted/10 border border-divider rounded-2xl h-12">
                    <input 
                      type="color" 
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                      className="w-10 h-10 rounded-xl bg-transparent border-none cursor-pointer"
                    />
                    <input 
                       value={formData.primaryColor}
                       onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                       className="flex-1 bg-transparent border-none outline-none text-[11px] font-black uppercase"
                    />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Secondary (Accent) Color</label>
                 <div className="flex items-center gap-3 p-2 bg-muted/10 border border-divider rounded-2xl h-12">
                    <input 
                      type="color" 
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({...formData, secondaryColor: e.target.value})}
                      className="w-10 h-10 rounded-xl bg-transparent border-none cursor-pointer"
                    />
                    <input 
                       value={formData.secondaryColor}
                       onChange={(e) => setFormData({...formData, secondaryColor: e.target.value})}
                       className="flex-1 bg-transparent border-none outline-none text-[11px] font-black uppercase"
                    />
                 </div>
              </div>
              <div className="flex flex-col justify-end">
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-3">
                     <Target className="text-primary" size={16} />
                     <p className="text-[10px] font-bold text-primary tracking-tight">The entire system will re-theme instantly upon save.</p>
                  </div>
              </div>
           </div>
        </section>

        {/* Corporate Metadata */}
        <section className="space-y-6">
           <div className="flex items-center gap-3">
              <p className="text-[10px] font-black uppercase tracking-widest leading-none text-muted-foreground">Corporate Metadata</p>
              <div className="h-px flex-1 bg-divider" />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Industry</label>
                 <CustomSelect 
                   value={formData.industry}
                   onChange={(val) => setFormData({...formData, industry: val})}
                   options={industryOptions}
                   className="h-12 bg-muted/10"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Company Size</label>
                 <CustomSelect 
                   value={formData.size}
                   onChange={(val) => setFormData({...formData, size: val})}
                   options={sizeOptions}
                   className="h-12 bg-muted/10"
                 />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input 
                label="Official Website" 
                placeholder="https://nexus.com"
                value={formData.website}
                icon={<Globe size={14} />}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                className="bg-muted/10 border-divider rounded-2xl h-12 text-[11px] font-black"
              />
              <Input 
                label="Contact Email" 
                placeholder="hr@nexus.com"
                value={formData.contactEmail}
                icon={<Mail size={14} />}
                onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                className="bg-muted/10 border-divider rounded-2xl h-12 text-[11px] font-black"
              />
              <Input 
                label="Corporate Address" 
                placeholder="Silicon Valley, CA"
                value={formData.address}
                icon={<MapPin size={14} />}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="bg-muted/10 border-divider rounded-2xl h-12 text-[11px] font-black"
              />
           </div>
        </section>

        {/* Action Controls */}
        <div className="pt-10 flex border-t border-divider gap-4 items-center justify-between">
           <div className="flex items-center gap-4 text-muted-foreground/40">
              <div className="p-2 border border-divider rounded-xl">
                 <Target size={14} />
              </div>
              <div>
                 <p className="text-[8px] font-black uppercase tracking-widest leading-none mb-1">System Authority</p>
                 <p className="text-[9px] font-black text-primary tracking-widest leading-none">EPMS-ORG-ROOT</p>
              </div>
           </div>

           <div className="flex gap-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={resetForm}
                disabled={!hasChanges || isSaving}
                className="h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-foreground"
              >
                 <RotateCcw size={16} className="mr-2" /> Reset
              </Button>
              <Button 
                type="submit" 
                disabled={!hasChanges || isSaving} 
                className="h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/20"
              >
                 {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                 Synchronize Identity
              </Button>
           </div>
        </div>
      </form>
    </div>
  );
}
