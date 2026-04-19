'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Shield, 
  Calendar, 
  Pencil, 
  Save, 
  Camera,
  CheckCircle2,
  Lock,
  ChevronRight,
  Loader2,
  Briefcase,
  User as UserIcon,
  MapPin,
  Globe,
  Phone,
  Heart,
  BookOpen,
  Award,
  Link as LinkIcon,
  ShieldAlert,
  Fingerprint,
  ShieldCheck,
  Terminal,
  Code2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Input } from '@/components/ui/Input';
import { ManagerSelect } from './ManagerSelect';
import { SkillTagInput } from './SkillTagInput';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

interface EmployeeDetailDrawerProps {
  employeeId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

type TabType = 'job' | 'expertise' | 'personal' | 'security';

export function EmployeeDetailDrawer({ employeeId, isOpen, onClose, onUpdate }: EmployeeDetailDrawerProps) {
  const currentUser = useAuthStore((state) => state.user);
  const isAdmin = currentUser?.role === 'ADMIN';
  const isSelf = currentUser?.id === employeeId;

  const [activeTab, setActiveTab] = useState<TabType>('job');
  const [employee, setEmployee] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (employeeId && isOpen) {
      fetchEmployee();
    } else {
      setEmployee(null);
      setIsEditing(false);
      setActiveTab('job');
    }
  }, [employeeId, isOpen]);

  const fetchEmployee = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/users/${employeeId}`);
      setEmployee(res.data);
      setFormData({
        ...res.data,
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error('Failed to load employee profile');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      // Strip system-only properties that backend might reject
      const { 
        password, confirmPassword, _id, organizationId, createdAt, updatedAt, __v,
        employeeId: ignored, email: ignoredEmail,
        ...payload 
      } = formData;
      
      // Sanitization: ONLY admins can edit joiningDate, employmentType, and workLocation
      if (!isAdmin) {
          delete payload.joiningDate;
          delete payload.employmentType;
          delete payload.workLocation;
          delete payload.designation;
          delete payload.department;
          delete payload.role;
      }

      // The API populates reportingManager as a full object; the DTO expects a plain string ID
      if (payload.reportingManager && typeof payload.reportingManager === 'object') {
        payload.reportingManager = payload.reportingManager._id;
      }
      
      // Ensure reportingManager is null/empty string safe
      if (!payload.reportingManager) {
        payload.reportingManager = null;
      }

      await api.patch(`/users/${employeeId}`, payload);

      if (formData.password) {
        await api.patch('/users/me/password', {
          oldPassword: 'Welcome@123', // Default verification flow
          newPassword: formData.password
        });
      }

      toast.success('Profile updated successfully');
      setIsEditing(false);
      fetchEmployee();
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message?.[0] || error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const canSeeSensitive = isAdmin || isSelf;

  if (!isOpen && !employeeId) return null;

  const tabs: { id: TabType; label: string; icon: any; protected?: boolean }[] = [
    { id: 'job', label: 'Job Profile', icon: Briefcase },
    { id: 'expertise', label: 'Expertise', icon: BookOpen },
    { id: 'personal', label: 'Personal', icon: Fingerprint, protected: true },
    { id: 'security', label: 'Security', icon: Lock, protected: true },
  ];

  const visibleTabs = tabs.filter(tab => !tab.protected || canSeeSensitive);

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm transition-opacity duration-500",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      <div className={cn(
        "fixed right-0 top-0 bottom-0 w-full max-w-xl bg-background/95 z-[70] shadow-2xl transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1) border-l border-divider",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col h-full relative overflow-hidden backdrop-blur-3xl">
          {/* Performance Mesh BG */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          {/* Compact Header */}
          <div className="px-6 py-5 border-b border-divider relative z-10 flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                 <UserIcon size={20} strokeWidth={2.5} />
               </div>
               <div className="space-y-0.5">
                <h2 className="text-lg font-black text-foreground tracking-tighter leading-none">Employee Profile</h2>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                   <Shield size={10} className="text-primary/60" />
                   <span className="tabular-nums">Employee ID: {employee?.employeeId || 'EP-SYNC'}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-foreground border border-divider shadow-sm"
            >
              <X size={20} />
            </button>
          </div>

          {/* Sleek Tab Navigation */}
          <div className="px-6 pt-4 pb-2 relative z-10">
            <div className="flex gap-1 bg-muted/40 p-1 rounded-2xl border border-divider shadow-inner group">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                    activeTab === tab.id 
                      ? "aura-bg-primary text-white shadow-lg shadow-primary/20 scale-[0.98]" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <tab.icon size={12} strokeWidth={activeTab === tab.id ? 3 : 2} />
                  <span className="hidden sm:inline">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32 scrollbar-none">
            {isLoading && !employee ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-primary/5 rounded-3xl border border-primary/10">
                   <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 animate-pulse">Synchronizing Profile...</span>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeTab === 'job' && (
                  <div className="space-y-6">
                    {/* Hero Profile Minimal */}
                    <div className="flex items-center gap-6 bg-muted/30 p-6 rounded-[28px] border border-divider shadow-sm group relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform">
                         <Briefcase size={80} />
                      </div>
                      <div className="relative z-10 w-20 h-20 rounded-[22px] aura-bg-primary border-4 border-background flex items-center justify-center text-3xl font-black text-white shadow-2xl">
                        {formData.firstName?.[0] || employee?.email?.[0]?.toUpperCase()}
                      </div>
                      <div className="space-y-1 relative z-10">
                        <div className="text-2xl font-black text-foreground tracking-tighter leading-none">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <input 
                                className="bg-transparent border-b border-divider outline-none w-28 focus:border-primary transition-all text-lg font-bold"
                                value={formData.firstName || ''}
                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                placeholder="First"
                              />
                              <input 
                                className="bg-transparent border-b border-divider outline-none w-28 focus:border-primary transition-all text-lg font-bold"
                                value={formData.lastName || ''}
                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                placeholder="Last"
                              />
                            </div>
                          ) : (
                            `${employee?.firstName || 'New'} ${employee?.lastName || 'Associate'}`
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                           {isEditing && isAdmin ? (
                             <input 
                               className="bg-transparent border-b border-divider outline-none w-24 text-[10px] font-black text-primary uppercase tracking-widest focus:border-primary transition-all"
                               value={formData.designation || ''}
                               onChange={(e) => setFormData({...formData, designation: e.target.value})}
                               placeholder="Designation"
                             />
                           ) : (
                             <span className="text-[10px] font-black text-primary uppercase tracking-widest">{employee?.designation || 'Specialist'}</span>
                           )}
                           <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                           {isEditing && isAdmin ? (
                             <input 
                               className="bg-transparent border-b border-divider outline-none w-24 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest focus:border-primary transition-all"
                               value={formData.department || ''}
                               onChange={(e) => setFormData({...formData, department: e.target.value})}
                               placeholder="Department"
                             />
                           ) : (
                             <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">{employee?.department || 'Operations'}</span>
                           )}
                        </div>
                      </div>
                    </div>

                    {/* High Density Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                       <div className="col-span-2 sm:col-span-1 space-y-4 astra-glass p-5 rounded-2xl border border-divider hover:border-primary/20 transition-all group">
                         <div className="flex items-center justify-between mb-2">
                            <h3 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Employment</h3>
                            <ShieldCheck size={14} className="text-primary/40 group-hover:text-primary transition-colors" />
                         </div>
                         <div className="space-y-4">
                            <div className="flex flex-col">
                              <label className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none mb-1">Employment Type</label>
                              {isEditing && isAdmin ? (
                                <CustomSelect
                                  value={formData.employmentType}
                                  onChange={(val) => setFormData({...formData, employmentType: val})}
                                  options={[
                                    { value: 'FULL_TIME', label: 'FULL TIME' },
                                    { value: 'CONTRACT', label: 'CONTRACT' },
                                    { value: 'INTERN', label: 'INTERN' },
                                    { value: 'FREELANCE', label: 'FREELANCE' }
                                  ]}
                                  className="h-8 text-[10px] font-black uppercase"
                                />
                              ) : (
                                <div className="text-xs font-bold text-foreground truncate">{employee?.employmentType?.replace('_', ' ') || 'Associate'}</div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <label className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none mb-1">Joining Date</label>
                              {isEditing && isAdmin ? (
                                <Input 
                                  type="date" 
                                  value={formData.joiningDate ? new Date(formData.joiningDate).toISOString().split('T')[0] : ''} 
                                  onChange={(e) => setFormData({...formData, joiningDate: e.target.value})} 
                                  className="h-8"
                                />
                              ) : (
                                <div className="text-xs font-bold text-foreground tabular-nums">{employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric', day: 'numeric' }) : 'Pending Sync'}</div>
                              )}
                            </div>
                         </div>
                       </div>

                       <div className="col-span-2 sm:col-span-1 space-y-4 astra-glass p-5 rounded-2xl border border-divider hover:border-primary/20 transition-all group">
                         <div className="flex items-center justify-between mb-2">
                            <h3 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Hierarchy</h3>
                            <UserIcon size={14} className="text-primary/40 group-hover:text-primary transition-colors" />
                         </div>
                         <div className="space-y-4">
                            <div className="flex flex-col">
                              <label className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none mb-1">Reporting Manager</label>
                              {isEditing && isAdmin ? (
                                 <ManagerSelect value={formData.reportingManager} onChange={(id) => setFormData({...formData, reportingManager: id})} />
                              ) : (
                                <div className="text-xs font-bold text-emerald-500 truncate">
                                  {employee?.reportingManager 
                                    ? `${employee.reportingManager.firstName || 'User'} ${employee.reportingManager.lastName || ''}`.trim()
                                    : 'Corporate HQ'}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <label className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none mb-1">Work Email</label>
                              <div className="text-xs font-bold text-foreground/70 truncate lowercase">{employee?.email}</div>
                            </div>
                         </div>
                       </div>

                       <div className="col-span-2 space-y-4 astra-glass p-5 rounded-3xl border border-divider hover:border-primary/20 transition-all flex items-center justify-between group">
                          <div className="flex gap-8">
                             <div className="space-y-1">
                                <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] leading-none mb-1">Work Location</span>
                                <div className="flex items-center gap-2">
                                   <MapPin size={12} className="text-primary" />
                                   {isEditing && isAdmin ? (
                                      <CustomSelect
                                        value={formData.workLocation}
                                        onChange={(val) => setFormData({...formData, workLocation: val})}
                                        options={[
                                          { value: 'REMOTE', label: 'REMOTE' },
                                          { value: 'HYBRID', label: 'HYBRID' },
                                          { value: 'ONSITE', label: 'ONSITE' }
                                        ]}
                                        className="h-7 w-28 text-[9px] font-black"
                                      />
                                   ) : (
                                      <span className="text-xs font-black text-foreground uppercase tracking-widest">{employee?.workLocation || 'REMOTE'}</span>
                                   )}
                                </div>
                             </div>
                             <div className="space-y-1 border-l border-divider pl-8">
                                <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] leading-none mb-1">Role & Permissions</span>
                                <div className="flex items-center gap-2">
                                   <Shield size={12} className="text-primary" />
                                   {isEditing && isAdmin ? (
                                      <CustomSelect
                                        value={formData.role}
                                        onChange={(val) => setFormData({...formData, role: val})}
                                        options={[
                                          { value: 'ADMIN', label: 'ADMIN' },
                                          { value: 'MANAGER', label: 'MANAGER' },
                                          { value: 'TEAM_LEADER', label: 'TEAM LEADER' },
                                          { value: 'EMPLOYEE', label: 'EMPLOYEE' }
                                        ]}
                                        className="h-7 w-28 text-[9px] font-black"
                                      />
                                   ) : (
                                      <span className="text-xs font-black text-foreground uppercase tracking-widest">{employee?.role?.replace('_', ' ') || 'EMPLOYEE'}</span>
                                   )}
                                </div>
                             </div>
                          </div>
                          {!isEditing && (isAdmin || isSelf) && (
                             <div className="flex gap-2">
                                <Button size="sm" className="rounded-lg h-8 text-[9px] uppercase font-black" onClick={() => setIsEditing(true)}>Edit</Button>
                             </div>
                          )}
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'expertise' && (
                  <div className="space-y-6">
                    <div className="astra-glass p-6 rounded-3xl border border-divider">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-6 flex items-center gap-2">
                         <Terminal className="text-primary" size={14} /> Skills & Expertise
                      </h3>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="col-span-2">
                              {isEditing ? (
                                <Input label="Primary Tech Stack" value={formData.techStack} onChange={(e) => setFormData({...formData, techStack: e.target.value})} placeholder="e.g., MERN Stack" />
                              ) : (
                                <div className="flex items-center justify-between p-3.5 bg-primary/5 rounded-xl border border-primary/10">
                                   <div className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Main Ecosystem</div>
                                   <div className="text-xs font-black text-foreground">{employee?.techStack || 'Universal'}</div>
                                </div>
                              )}
                           </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Core Skills</label>
                          {isEditing ? (
                             <SkillTagInput skills={formData.skills || []} onChange={(s) => setFormData({...formData, skills: s})} />
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {employee?.skills?.map((s: string) => (
                                <span key={s} className="px-2.5 py-1.5 bg-muted border border-divider rounded-lg text-[9px] font-black text-foreground/70 uppercase tracking-widest hover:border-primary/30 transition-colors cursor-default">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Editable Profile Links */}
                    <div className="grid grid-cols-2 gap-4">
                       {[
                         { id: 'githubUrl', label: 'GitHub Explorer', icon: Code2, value: isEditing ? formData.githubUrl : employee?.githubUrl, color: 'text-foreground' },
                         { id: 'linkedinUrl', label: 'LinkedIn Connect', icon: ExternalLink, value: isEditing ? formData.linkedinUrl : employee?.linkedinUrl, color: 'text-blue-500' },
                         { id: 'portfolioUrl', label: 'Portfolio Link', icon: Globe, value: isEditing ? formData.portfolioUrl : employee?.portfolioUrl, color: 'text-emerald-500' },
                       ].map(link => (
                         <div key={link.id} className={cn("p-4 bg-muted/30 rounded-2xl border border-divider flex flex-col gap-3 group relative overflow-hidden transition-all", link.id === 'portfolioUrl' && 'col-span-2')}>
                            <div className="flex items-center gap-3">
                               <div className={cn("p-2 rounded-xl bg-muted/80 shadow-inner", link.color)}>
                                  <link.icon size={16} />
                               </div>
                               <span className="text-[8px] font-black text-muted-foreground/40 uppercase block">{link.label}</span>
                            </div>
                            {isEditing ? (
                              <input 
                                className="bg-transparent border-b border-divider text-[10px] font-bold outline-none focus:border-primary transition-all w-full py-1"
                                value={link.value || ''}
                                onChange={(e) => setFormData({...formData, [link.id]: e.target.value})}
                                placeholder="https://..."
                              />
                            ) : (
                              <button 
                                onClick={() => link.value && window.open(link.value, '_blank')}
                                className="text-[10px] font-bold text-foreground truncate block hover:text-primary transition-colors text-left"
                              >
                                {link.value || 'Unlinked'}
                              </button>
                            )}
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                {activeTab === 'personal' && canSeeSensitive && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/20 p-5 rounded-2xl border border-divider space-y-4">
                        <div className="flex items-center justify-between mb-2">
                           <h3 className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-2"><UserIcon size={12} /> Personal</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black text-muted-foreground/40 uppercase leading-none mb-1">Date of Birth</span>
                              {isEditing ? (
                                <Input type="date" value={formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : ''} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="h-8" />
                              ) : (
                                <span className="text-xs font-bold text-foreground tabular-nums">{employee?.dob ? new Date(employee.dob).toLocaleDateString() : '—'}</span>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black text-muted-foreground/40 uppercase leading-none mb-1">Gender</span>
                              {isEditing ? (
                                 <CustomSelect
                                  value={formData.gender}
                                  onChange={(val) => setFormData({...formData, gender: val})}
                                  options={[
                                    { value: 'MALE', label: 'MALE' },
                                    { value: 'FEMALE', label: 'FEMALE' },
                                    { value: 'OTHER', label: 'OTHER' },
                                    { value: 'PREFER_NOT_TO_SAY', label: 'SECURE' }
                                  ]}
                                  className="h-8 text-[10px] font-black"
                                 />
                              ) : (
                                <span className="text-xs font-extrabold text-foreground/80 uppercase tracking-widest">{employee?.gender?.replace('_', ' ') || 'Not Shared'}</span>
                              )}
                            </div>
                        </div>
                      </div>

                      <div className="bg-muted/20 p-5 rounded-2xl border border-divider space-y-4">
                        <div className="flex items-center justify-between mb-2">
                           <h3 className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-2"><Phone size={12} /> Connectivity</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black text-muted-foreground/40 uppercase leading-none mb-1">Phone Number</span>
                              {isEditing ? (
                                <input className="bg-transparent border-b border-divider text-xs font-bold outline-none focus:border-primary py-1" value={formData.phoneNumber || ''} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} />
                              ) : (
                                <span className="text-xs font-bold text-foreground tabular-nums">{employee?.phoneNumber || '—'}</span>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black text-muted-foreground/40 uppercase leading-none mb-1">Personal Email</span>
                              {isEditing ? (
                                <input className="bg-transparent border-b border-divider text-xs font-bold outline-none focus:border-primary py-1" value={formData.personalEmail || ''} onChange={(e) => setFormData({...formData, personalEmail: e.target.value})} />
                              ) : (
                                <span className="text-xs font-bold text-foreground/60 truncate max-w-[150px]">{employee?.personalEmail || '—'}</span>
                              )}
                            </div>
                        </div>
                      </div>

                      <div className="col-span-2 astra-glass p-5 rounded-3xl border border-divider space-y-4">
                         <h3 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Bio & Status</h3>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                               <span className="text-[8px] font-black text-muted-foreground/40 uppercase mb-1">Marital Status</span>
                               {isEditing ? (
                                 <CustomSelect
                                  value={formData.maritalStatus}
                                  onChange={(val) => setFormData({...formData, maritalStatus: val})}
                                  options={[
                                    { value: 'SINGLE', label: 'SINGLE' },
                                    { value: 'MARRIED', label: 'MARRIED' },
                                    { value: 'DIVORCED', label: 'DIVORCED' }
                                  ]}
                                  className="h-8 text-[10px] font-black"
                                 />
                               ) : (
                                 <span className="text-xs font-bold text-foreground">{employee?.maritalStatus || '—'}</span>
                               )}
                            </div>
                            <div className="flex flex-col">
                               <span className="text-[8px] font-black text-muted-foreground/40 uppercase mb-1">Blood Group</span>
                               {isEditing ? (
                                 <input className="bg-transparent border-b border-divider text-xs font-bold outline-none focus:border-primary py-1" value={formData.bloodGroup || ''} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})} />
                               ) : (
                                 <span className="text-xs font-black text-red-500">{employee?.bloodGroup || '—'}</span>
                               )}
                            </div>
                         </div>
                      </div>

                      <div className="col-span-2 space-y-4">
                         <div className="astra-glass p-5 rounded-3xl border border-divider space-y-3">
                            <span className="text-[8px] font-black text-muted-foreground/40 uppercase">Current Address</span>
                            {isEditing ? (
                               <textarea className="w-full h-16 bg-muted/10 rounded-xl border border-divider p-3 text-xs font-medium outline-none focus:border-primary" value={formData.currentAddress || ''} onChange={(e) => setFormData({...formData, currentAddress: e.target.value})} />
                            ) : (
                               <p className="text-xs font-medium text-foreground/80 leading-relaxed italic">{employee?.currentAddress || 'No primary address recorded'}</p>
                            )}
                         </div>
                         <div className="astra-glass p-5 rounded-3xl border border-divider space-y-3">
                            <span className="text-[8px] font-black text-muted-foreground/40 uppercase">Permanent Address</span>
                            {isEditing ? (
                               <textarea className="w-full h-16 bg-muted/10 rounded-xl border border-divider p-3 text-xs font-medium outline-none focus:border-primary" value={formData.permanentAddress || ''} onChange={(e) => setFormData({...formData, permanentAddress: e.target.value})} />
                            ) : (
                               <p className="text-xs font-medium text-foreground/80 leading-relaxed italic">{employee?.permanentAddress || 'No permanent base recorded'}</p>
                            )}
                         </div>
                      </div>
                    </div>

                    <div className="p-6 bg-red-500/5 rounded-3xl border border-red-500/10 space-y-4">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-2 mb-2">
                         <ShieldAlert size={14} /> Emergency Contact
                       </h3>
                       <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black text-red-500/40 uppercase mb-1">Contact Name</span>
                              {isEditing ? (
                                <input className="bg-transparent border-b border-divider text-xs font-bold outline-none focus:border-red-500 py-1" value={formData.emergencyContactName || ''} onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})} />
                              ) : (
                                <div className="text-xs font-black text-foreground leading-none">{employee?.emergencyContactName || '—'}</div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black text-red-500/40 uppercase mb-1">Relationship</span>
                              {isEditing ? (
                                <input className="bg-transparent border-b border-divider text-xs font-bold outline-none focus:border-red-500 py-1" value={formData.emergencyContactRelation || ''} onChange={(e) => setFormData({...formData, emergencyContactRelation: e.target.value})} />
                              ) : (
                                <div className="text-xs font-black text-foreground leading-none">{employee?.emergencyContactRelation || '—'}</div>
                              )}
                            </div>
                            <div className="col-span-2 flex flex-col pt-2 border-t border-red-500/5">
                              <span className="text-[8px] font-black text-red-500/40 uppercase mb-1">Emergency Phone</span>
                              {isEditing ? (
                                <input className="bg-transparent border-b border-divider text-xs font-bold outline-none focus:border-red-500 py-1" value={formData.emergencyContactPhone || ''} onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})} />
                              ) : (
                                <div className="text-xs font-black text-red-500 tabular-nums leading-none tracking-widest">{employee?.emergencyContactPhone || '—'}</div>
                              )}
                            </div>
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && canSeeSensitive && (
                  <div className="space-y-6">
                    <div className="p-8 astra-glass rounded-3xl border border-divider text-center bg-primary/5">
                      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-lg shadow-primary/5">
                         <Lock size={28} className="text-primary" />
                      </div>
                      <div className="space-y-2 mb-8">
                        <h3 className="text-lg font-black text-foreground tracking-tighter">Security Settings</h3>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mx-auto leading-relaxed opacity-60">
                          Update your security credentials
                        </p>
                      </div>

                      <div className="space-y-4 max-w-xs mx-auto text-left">
                         <Input 
                           label="New Credentials" 
                           type="password" 
                           value={formData.password} 
                           onChange={(e) => setFormData({...formData, password: e.target.value})} 
                           placeholder="••••••••••••"
                         />
                         <Input 
                           label="Verification" 
                           type="password" 
                           value={formData.confirmPassword} 
                           onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                           placeholder="••••••••••••"
                         />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {(isEditing || activeTab === 'security') && (
            <div className="p-4 border-t border-divider bg-background/80 backdrop-blur-2xl absolute bottom-0 left-0 right-0 z-50 flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 rounded-xl h-12 border-divider text-foreground font-black uppercase tracking-widest text-[9px]" 
                onClick={() => {
                   setIsEditing(false);
                   if (activeTab === 'security') setActiveTab('job');
                }}
              >
                Cancel
              </Button>
              <Button 
                className="flex-[2] rounded-xl h-12 bg-primary text-white shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[9px] group" 
                onClick={handleUpdate}
                isLoading={isLoading}
              >
                <Save size={16} className="mr-2 group-hover:scale-110 transition-transform" /> Save Changes
              </Button>
            </div>
          )}
          
          {!isEditing && activeTab !== 'security' && canSeeSensitive && (
             <div className="p-4 absolute bottom-0 left-0 right-0">
               <Button 
                className="w-full rounded-xl h-12 bg-muted/40 border border-divider text-muted-foreground hover:text-foreground font-black uppercase tracking-widest text-[9px] hover:bg-muted transition-all flex items-center justify-center gap-2 shadow-sm"
                onClick={() => setIsEditing(true)}
               >
                 <Pencil size={12} /> Edit Profile
               </Button>
             </div>
          )}
        </div>
      </div>
    </>
  );
}
