import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Input } from '@/components/ui/Input';
import api from '@/services/api';
import toast from 'react-hot-toast';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Email address is required');
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = { 
        email, 
        role, 
        firstName, 
        lastName, 
        designation, 
        department 
      };
      if (password.trim() !== '') {
        payload.password = password;
      }
      
      await api.post('/users', payload);
      toast.success('Employee added successfully');
      setEmail('');
      setRole('EMPLOYEE');
      setFirstName('');
      setLastName('');
      setDesignation('');
      setDepartment('');
      setPassword('');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add employee');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-all duration-500" 
        onClick={onClose}
      />
      <div className="w-full max-w-xl rounded-[40px] bg-background shadow-2xl border border-white/10 relative z-10 animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
        <div className="flex items-center justify-between p-10 border-b border-white/5 bg-background/20">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-foreground tracking-tighter">Add Employee</h2>
            <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">New Employee Account</p>
          </div>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-all p-3 hover:bg-white/5 rounded-2xl border border-transparent hover:border-white/10"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-background/40">
          <Input 
            label="Work Email"
            type="email"
            placeholder="employee@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            autoFocus
          />

          <div className="grid grid-cols-2 gap-6">
            <Input 
              label="First Name"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isLoading}
            />
            <Input 
              label="Last Name"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Input 
              label="Designation"
              placeholder="Lead Dev"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              disabled={isLoading}
            />
            <Input 
              label="Department"
              placeholder="Engineering"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground/80 px-1">
              Permission Role
            </label>
            <CustomSelect 
              value={role}
              onChange={setRole}
              disabled={isLoading}
              options={[
                { value: 'EMPLOYEE', label: 'EMPLOYEE', color: 'text-slate-400' },
                { value: 'MANAGER', label: 'MANAGER', color: 'text-blue-400' },
                { value: 'ADMIN', label: 'ADMINISTRATOR', color: 'text-emerald-400' }
              ]}
              className="flex h-12 w-full rounded-2xl border border-border bg-background/40 px-4 text-xs font-black uppercase tracking-widest hover:bg-background/80"
              dropdownClassName="text-xs uppercase tracking-widest font-black"
            />
          </div>

          <div className="space-y-2 mt-4">
             <Input 
              label="Temporary Password"
              type="password"
              placeholder="Defaults to Welcome@123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-[10px] font-bold text-muted-foreground/40 italic ml-1 px-1">
              If unspecified, the employee can sign in using <b className="text-primary/60">Welcome@123</b>.
            </p>
          </div>

          <div className="pt-8 flex justify-end gap-4">
            <Button type="button" variant="ghost" size="lg" onClick={onClose} disabled={isLoading} className="rounded-2xl">
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={isLoading} className="rounded-2xl min-w-[180px]">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
