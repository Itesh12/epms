'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Palette, Image as ImageIcon, Users, BarChart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CustomSelect } from '@/components/ui/CustomSelect';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface CreateProjectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateProjectDrawer({ isOpen, onClose, onSuccess }: CreateProjectDrawerProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [color, setColor] = useState('#5850ec');
  const [priority, setPriority] = useState('MEDIUM');
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      async function fetchEmployees() {
        try {
          const res = await api.get('/users');
          setEmployees(res.data);
        } catch (error) {
          console.error('Failed to fetch employees', error);
        }
      }
      fetchEmployees();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Project title is required');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/projects', {
        title,
        description,
        priority,
        imageUrl: imageUrl || undefined,
        color,
        members: memberIds
      });
      toast.success('Project created successfully');
      // Reset form
      setTitle('');
      setDescription('');
      setImageUrl('');
      setColor('#5850ec');
      setPriority('MEDIUM');
      setMemberIds([]);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] transition-opacity duration-500",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <div className={cn(
        "fixed inset-y-0 right-0 z-[80] w-full max-w-lg bg-background border-l border-divider shadow-2xl transition-transform duration-500 transform overflow-hidden flex flex-col",
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[120px] opacity-20 pointer-events-none" />
        <div 
          className="absolute bottom-0 left-0 w-64 h-64 blur-[80px] opacity-20 pointer-events-none" 
          style={{ background: color + '15' }}
        />

        <div className="relative h-full flex flex-col z-10 backdrop-blur-3xl">
          {/* Header */}
          <div className="px-6 py-5 border-b border-divider flex justify-between items-center bg-muted/20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                 <Plus size={20} strokeWidth={2.5} />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-xl font-black text-foreground tracking-tighter leading-none">New Project</h2>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-foreground border border-divider shadow-sm"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
            {/* Identity Group */}
            <div className="space-y-4">
              <Input
                label="Project Title"
                placeholder="e.g. Q4 Strategy Expansion"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground/80 px-1 flex items-center gap-2">
                  <BarChart size={12} className="text-primary/60" /> Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[90px] text-foreground/80 font-medium text-xs leading-relaxed bg-muted/10 p-4 rounded-2xl border border-divider outline-none focus:border-primary/50 transition-all resize-none placeholder:italic placeholder:opacity-50 astra-glass"
                  placeholder="Enter project details and objectives..."
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Appearance & Config Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground/80 px-1 flex items-center gap-2">
                  <Palette size={12} className="text-primary/60" /> Theme Color
                </label>
                <div className="flex gap-3 items-center bg-muted/10 p-3 rounded-xl border border-divider shadow-inner astra-glass">
                  <input
                    type="color"
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none p-0 overflow-hidden shadow-md"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                  <span className="text-[10px] font-black text-foreground/60 tracking-widest tabular-nums">{color.toUpperCase()}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground/80 px-1 flex items-center gap-2">
                  <BarChart size={12} className="text-primary/60" /> Project Priority
                </label>
                <CustomSelect
                  value={priority}
                  onChange={setPriority}
                  options={[
                    { value: 'LOW', label: 'LOW', color: 'text-blue-400' },
                    { value: 'MEDIUM', label: 'NORMAL', color: 'text-slate-400' },
                    { value: 'HIGH', label: 'HIGH', color: 'text-orange-400' },
                    { value: 'URGENT', label: 'URGENT', color: 'text-red-400' }
                  ]}
                  className="h-11 rounded-xl border-divider bg-background/50 px-4 text-[10px] font-black uppercase tracking-widest astra-glass"
                  dropdownClassName="text-[10px] font-black uppercase"
                />
              </div>

              <div className="col-span-2">
                 <Input
                  label="Project Image URL"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            {/* Preview Compact */}
            {imageUrl && (
              <div className="rounded-2xl overflow-hidden border border-divider aspect-video relative group bg-black/20 shadow-lg">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div className="p-1 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">Image Preview</span>
                </div>
              </div>
            )}

            {/* Team Distribution */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground/80 px-1 flex items-center gap-2">
                <Users size={12} className="text-primary/60" /> Team Members
              </label>
              <div className="flex flex-wrap gap-1.5 p-4 bg-muted/10 rounded-2xl border border-divider min-h-[100px] astra-glass">
                {employees.length > 0 ? employees.map(emp => (
                  <button
                    key={emp._id}
                    type="button"
                    onClick={() => {
                      setMemberIds(prev =>
                        prev.includes(emp._id)
                          ? prev.filter(id => id !== emp._id)
                           : [...prev, emp._id]
                      );
                    }}
                    className={cn(
                      "text-[9px] px-3 py-2 rounded-lg transition-all font-black uppercase tracking-wider border",
                      memberIds.includes(emp._id)
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 scale-105'
                        : 'bg-muted/50 text-muted-foreground/60 border-divider hover:border-primary/40'
                    )}
                  >
                    {emp.email.split('@')[0]}
                  </button>
                )) : (
                  <div className="w-full flex flex-col items-center justify-center py-6 gap-2">
                     <Loader2 className="w-4 h-4 animate-spin text-primary/40" />
                     <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 italic">Synchronizing Employees...</p>
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Footer Compact */}
          <div className="p-5 border-t border-divider bg-background/80 backdrop-blur-xl flex gap-3 z-20">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isLoading} 
              className="flex-1 rounded-xl border-divider h-12 font-black uppercase tracking-widest text-[9px]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isLoading} 
              className="flex-[2] h-12 rounded-xl bg-primary text-white shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 group"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus size={14} className="group-hover:scale-110 transition-transform" /> Create Project</>}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
