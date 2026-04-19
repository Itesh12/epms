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
      // Strip all system/read-only fields that the backend rejects
      const { 
        password, confirmPassword, role, isActive, employeeId: ignored,
        _id, email, organizationId, createdAt, updatedAt, __v,
        ...payload 
      } = formData;
      
      // Sanitization for non-admins
      if (!isAdmin) {
          delete payload.joiningDate;
          delete payload.employmentType;
      }

      // The API populates reportingManager as a full object; the DTO expects a plain string ID
      if (payload.reportingManager && typeof payload.reportingManager === 'object') {
        payload.reportingManager = payload.reportingManager._id;
      }
      // Remove it entirely if empty/null so the backend doesn't receive null
      if (!payload.reportingManager) {
        delete payload.reportingManager;
      }

      await api.patch(`/users/${employeeId}`, payload);


      if (formData.password) {
        await api.patch('/users/me/password', {
          oldPassword: 'Welcome@123', // Still awaiting full old-password-verification flow
          newPassword: formData.password
        });
      }

      toast.success('Profile updated successfully');
      setIsEditing(false);
      fetchEmployee();
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
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
        "fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-[#030712]/95 z-[70] shadow-2xl transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1) border-l border-white/5",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* Header BG Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

          <div className="p-8 border-b border-white/10 relative z-10 bg-white/5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-white tracking-tighter">Employee Profile</h2>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
                   <Shield size={12} />
                   <span>Employee ID / {employee?.employeeId || 'Loading...'}</span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-white/10 rounded-2xl transition-colors text-muted-foreground hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 bg-black/40 p-1 rounded-2xl border border-white/5">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === tab.id 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  )}
                >
                  <tab.icon size={14} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-10 space-y-12 pb-32">
            {isLoading && !employee ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary/40" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 animate-pulse">Loading employee profile...</span>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                {activeTab === 'job' && (
                  <div className="space-y-10">
                    <div className="flex items-center gap-8 bg-white/5 p-8 rounded-[40px] border border-white/5">
                      <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl font-black text-primary">
                        {formData.firstName?.[0] || employee?.email?.[0].toUpperCase()}
                      </div>
                      <div className="space-y-2">
                        <div className="text-2xl font-black text-white tracking-tighter">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <input 
                                className="bg-transparent border-b border-white/10 outline-none w-32 focus:border-primary transition-colors"
                                value={formData.firstName || ''}
                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                placeholder="First"
                              />
                              <input 
                                className="bg-transparent border-b border-white/10 outline-none w-32 focus:border-primary transition-colors"
                                value={formData.lastName || ''}
                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                placeholder="Last"
                              />
                            </div>
                          ) : (
                            `${employee?.firstName || 'New'} ${employee?.lastName || 'Associate'}`
                          )}
                        </div>
                        <div className="text-xs font-bold text-primary uppercase tracking-[0.2em]">{employee?.designation || 'No Designation'}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <div className="space-y-6 astra-glass p-8 rounded-3xl border border-white/5">
                         <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Employment Details</h3>
                         {isEditing && isAdmin ? (
                           <div className="space-y-6">
                             <Input label="Designation" value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} />
                             <Input label="Department" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} />
                             <ManagerSelect value={formData.reportingManager} onChange={(id) => setFormData({...formData, reportingManager: id})} />
                           </div>
                         ) : (
                           <div className="space-y-6">
                              <div className="flex items-center gap-4 text-white/80">
                                <ShieldCheck className="text-primary" size={18} />
                                <div className="text-xs font-bold uppercase tracking-wider">{employee?.department || 'Operations'}</div>
                              </div>
                              <div className="flex items-center gap-4 text-white/80">
                                <Calendar className="text-primary" size={18} />
                                 <div className="text-xs font-bold uppercase tracking-wider">Joined {employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'Not Set'}</div>
                              </div>
                              <div className="flex items-center gap-4 text-white/80">
                                <UserIcon className="text-primary" size={18} />
                                 <div className="text-xs font-bold uppercase tracking-wider">Reports to: {employee?.reportingManager ? `${employee.reportingManager.firstName} ${employee.reportingManager.lastName}` : 'Not Assigned'}</div>
                              </div>
                           </div>
                         )}
                       </div>

                       <div className="space-y-6 astra-glass p-8 rounded-3xl border border-white/5">
                         <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Work Status & Location</h3>
                         {isEditing && (isAdmin || isSelf) ? (
                            <div className="space-y-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Work Location</label>
                                <select 
                                  value={formData.workLocation}
                                  onChange={(e) => setFormData({...formData, workLocation: e.target.value})}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-xs font-bold text-white uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary"
                                >
                                   <option value="REMOTE">Remote</option>
                                   <option value="HYBRID">Hybrid</option>
                                   <option value="ONSITE">Onsite</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Employment Type</label>
                                <select 
                                  value={formData.employmentType}
                                  disabled={!isAdmin}
                                  onChange={(e) => setFormData({...formData, employmentType: e.target.value})}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-xs font-bold text-white uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                                >
                                  <option value="FULL_TIME">Full Time</option>
                                  <option value="CONTRACT">Contractor</option>
                                  <option value="INTERN">Intern</option>
                                </select>
                              </div>
                            </div>
                         ) : (
                           <div className="space-y-6">
                              <div className="flex items-center gap-4 text-white/80">
                                <MapPin className="text-primary" size={18} />
                                 <div className="text-xs font-bold uppercase tracking-wider">{employee?.workLocation || 'REMOTE'}</div>
                              </div>
                              <div className="flex items-center gap-4 text-white/80">
                                <Globe className="text-primary" size={18} />
                                 <div className="text-xs font-bold uppercase tracking-wider">{employee?.employmentType?.replace('_', ' ') || 'FULL TIME'}</div>
                              </div>
                           </div>
                         )}
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'expertise' && (
                  <div className="space-y-10">
                    <div className="astra-glass p-8 rounded-[40px] border border-white/5">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-8 flex items-center gap-2">
                         <Terminal className="text-primary" size={16} /> Technical Skills
                      </h3>
                      {isEditing ? (
                        <div className="space-y-8">
                          <Input label="Primary Tech Stack" value={formData.techStack} onChange={(e) => setFormData({...formData, techStack: e.target.value})} placeholder="e.g., MERN Stack" />
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Skills & Technologies</label>
                            <SkillTagInput skills={formData.skills || []} onChange={(s) => setFormData({...formData, skills: s})} />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          <div className="flex items-center justify-between p-4 bg-primary/10 rounded-2xl border border-primary/20">
                             <div className="text-xs font-black text-primary uppercase tracking-widest">Primary Tech Stack</div>
                             <div className="text-sm font-bold text-white">{employee?.techStack || 'Not Specified'}</div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {employee?.skills?.map((s: string) => (
                              <span key={s} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-[0.2em]">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Profile Links */}
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Profile Links</h3>
                      {isEditing ? (
                        <div className="space-y-4">
                          <Input
                            label="GitHub URL"
                            value={formData.githubUrl || ''}
                            onChange={(e) => setFormData({...formData, githubUrl: e.target.value})}
                            placeholder="https://github.com/username"
                          />
                          <Input
                            label="LinkedIn URL"
                            value={formData.linkedinUrl || ''}
                            onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
                            placeholder="https://linkedin.com/in/username"
                          />
                          <Input
                            label="Portfolio URL"
                            value={formData.portfolioUrl || ''}
                            onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})}
                            placeholder="https://yourportfolio.com"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <button
                            onClick={() => employee?.githubUrl && window.open(employee.githubUrl, '_blank')}
                            className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-all group overflow-hidden relative"
                          >
                            <div className="absolute top-0 left-0 w-1 h-full bg-white/40 group-hover:bg-primary transition-colors" />
                            <Code2 size={24} className="text-white group-hover:scale-110 transition-transform" />
                            <div className="text-left">
                              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Code Repository</div>
                              <div className="text-xs font-bold text-white truncate max-w-[150px]">{employee?.githubUrl?.split('/').pop() || 'Not linked'}</div>
                            </div>
                          </button>
                          <button
                            onClick={() => employee?.linkedinUrl && window.open(employee.linkedinUrl, '_blank')}
                            className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-all group overflow-hidden relative"
                          >
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/40 group-hover:bg-blue-500 transition-colors" />
                            <ExternalLink size={24} className="text-blue-400 group-hover:scale-110 transition-transform" />
                            <div className="text-left">
                              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">LinkedIn Profile</div>
                              <div className="text-xs font-bold text-white truncate max-w-[150px]">{employee?.linkedinUrl?.split('/').pop() || 'Not linked'}</div>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'personal' && canSeeSensitive && (
                  <div className="space-y-10">
                    {/* Personal Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-white/5 p-8 rounded-3xl border border-white/5 space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2"><UserIcon size={14} /> Personal Info</h3>
                        {isEditing ? (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date of Birth</label>
                              <input
                                type="date"
                                value={formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : ''}
                                onChange={(e) => setFormData({...formData, dob: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-primary"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Gender</label>
                              <select
                                value={formData.gender || ''}
                                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-xs font-bold text-white uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary"
                              >
                                <option value="">Select</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Blood Group</label>
                              <select
                                value={formData.bloodGroup || ''}
                                onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-xs font-bold text-white uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary"
                              >
                                <option value="">Select</option>
                                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
                              </select>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-black text-muted-foreground/60 uppercase">D.O.B</span>
                              <span className="text-xs font-bold text-white/80">{employee?.dob ? new Date(employee.dob).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-black text-muted-foreground/60 uppercase">Gender</span>
                              <span className="text-xs font-bold text-white/80 uppercase tracking-widest">{employee?.gender?.replace('_', ' ') || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-black text-muted-foreground/60 uppercase">Blood Group</span>
                              <span className="text-xs font-bold text-emerald-500 uppercase">{employee?.bloodGroup || 'N/A'}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-white/5 p-8 rounded-3xl border border-white/5 space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2"><Phone size={14} /> Contact Info</h3>
                        {isEditing ? (
                          <div className="space-y-4">
                            <Input
                              label="Phone Number"
                              value={formData.phoneNumber || ''}
                              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                              placeholder="+91 98765 43210"
                            />
                            <Input
                              label="Personal Email"
                              type="email"
                              value={formData.personalEmail || ''}
                              onChange={(e) => setFormData({...formData, personalEmail: e.target.value})}
                              placeholder="personal@email.com"
                            />
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-black text-muted-foreground/60 uppercase">Phone Number</span>
                              <span className="text-xs font-bold text-white/80">{employee?.phoneNumber || '—'}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-black text-muted-foreground/60 uppercase">Personal Email</span>
                              <span className="text-xs font-bold text-white/80">{employee?.personalEmail || '—'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="p-8 bg-red-500/5 rounded-[40px] border border-red-500/10 space-y-6">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                        <ShieldAlert size={16} /> Emergency Contact
                      </h3>
                      {isEditing ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <Input
                            label="Contact Name"
                            value={formData.emergencyContactName || ''}
                            onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                            placeholder="Full name"
                          />
                          <Input
                            label="Relation"
                            value={formData.emergencyContactRelation || ''}
                            onChange={(e) => setFormData({...formData, emergencyContactRelation: e.target.value})}
                            placeholder="e.g. Spouse, Parent"
                          />
                          <Input
                            label="Phone"
                            value={formData.emergencyContactPhone || ''}
                            onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})}
                            placeholder="+91 98765 43210"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-6">
                          <div>
                            <div className="text-[9px] font-black text-muted-foreground/60 uppercase mb-1">Contact Name</div>
                            <div className="text-xs font-bold text-white">{employee?.emergencyContactName || '—'}</div>
                          </div>
                          <div>
                            <div className="text-[9px] font-black text-muted-foreground/60 uppercase mb-1">Relation</div>
                            <div className="text-xs font-bold text-white uppercase tracking-widest">{employee?.emergencyContactRelation || '—'}</div>
                          </div>
                          <div>
                            <div className="text-[9px] font-black text-muted-foreground/60 uppercase mb-1">Emergency Phone</div>
                            <div className="text-xs font-bold text-red-500">{employee?.emergencyContactPhone || '—'}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Address Information */}
                    <div className="space-y-4">
                      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Address Information</div>
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Current Address</label>
                            <textarea
                              value={formData.currentAddress || ''}
                              onChange={(e) => setFormData({...formData, currentAddress: e.target.value})}
                              rows={3}
                              placeholder="Enter current address"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-medium text-white outline-none focus:ring-1 focus:ring-primary resize-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Permanent Address</label>
                            <textarea
                              value={formData.permanentAddress || ''}
                              onChange={(e) => setFormData({...formData, permanentAddress: e.target.value})}
                              rows={3}
                              placeholder="Enter permanent address"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-medium text-white outline-none focus:ring-1 focus:ring-primary resize-none"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                            <div className="text-[9px] font-black text-primary uppercase mb-2">Current Address</div>
                            <div className="text-xs font-medium text-white/60 leading-relaxed">{employee?.currentAddress || 'Not provided'}</div>
                          </div>
                          <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                            <div className="text-[9px] font-black text-primary uppercase mb-2">Permanent Address</div>
                            <div className="text-xs font-medium text-white/60 leading-relaxed">{employee?.permanentAddress || 'Not provided'}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'security' && canSeeSensitive && (
                  <div className="space-y-10 animate-in zoom-in-95 duration-500">
                    <div className="p-10 astra-glass rounded-[40px] border border-white/10 shadow-2xl space-y-8 text-center bg-primary/5">
                      <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/30 shadow-xl shadow-primary/10">
                         <Lock size={40} className="text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-black text-white tracking-tight">Change Password</h3>
                        <p className="text-xs text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed">
                          Update your account password. Make sure to use a strong password to keep your account secure.
                        </p>
                      </div>

                      <div className="space-y-4 max-w-sm mx-auto pt-6 text-left">
                         <Input 
                           label="New Password" 
                           type="password" 
                           value={formData.password} 
                           onChange={(e) => setFormData({...formData, password: e.target.value})} 
                           placeholder="••••••••••••"
                         />
                         <Input 
                           label="Confirm Password" 
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
            <div className="p-8 border-t border-white/10 bg-black/80 backdrop-blur-2xl absolute bottom-0 left-0 right-0 z-50 flex gap-4 shadow-top">
              <Button 
                variant="outline" 
                className="flex-1 rounded-2xl h-14 border-white/10 text-white font-black uppercase tracking-widest text-[10px]" 
                onClick={() => {
                   setIsEditing(false);
                   if (activeTab === 'security') setActiveTab('job');
                }}
              >
                Cancel
              </Button>
              <Button 
                className="flex-[2] rounded-2xl h-14 bg-primary text-white shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[10px] group" 
                onClick={handleUpdate}
                isLoading={isLoading}
              >
                <Save size={18} className="mr-2 group-hover:scale-110 transition-transform" /> Save Changes
              </Button>
            </div>
          )}
          
          {!isEditing && activeTab !== 'security' && canSeeSensitive && (
             <div className="p-8 absolute bottom-0 left-0 right-0 flex gap-4">
               <Button 
                className="w-full rounded-2xl h-14 bg-white/5 border border-white/10 text-white/60 hover:text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                onClick={() => setIsEditing(true)}
               >
                 <Pencil size={14} /> Edit Profile
               </Button>
             </div>
          )}
        </div>
      </div>
    </>
  );
}
