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
        "fixed inset-y-0 right-0 z-[80] w-full max-w-[600px] bg-[#0a0a0f] border-l border-white/10 shadow-2xl transition-transform duration-500 transform overflow-hidden flex flex-col",
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] opacity-20 pointer-events-none" />
        <div 
          className="absolute bottom-0 left-0 w-64 h-64 blur-[80px] opacity-20 pointer-events-none" 
          style={{ background: color + '20' }}
        />

        <div className="relative h-full flex flex-col z-10">
          {/* Header */}
          <div className="p-8 sm:p-10 border-b border-white/5 flex justify-between items-center bg-background/40">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-foreground tracking-tighter">New Project</h2>
              <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">Launch a new initiative</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-muted-foreground hover:text-white border border-white/5"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 sm:p-10 space-y-10 scrollbar-none">
            {/* Project Name */}
            <div className="space-y-4">
              <Input
                label="Project Name"
                placeholder="e.g. Q4 Strategy Launch"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground/80 px-1 flex items-center gap-2">
                <BarChart size={14} className="text-primary" /> Project Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[120px] text-muted-foreground/80 font-medium text-sm leading-relaxed bg-white/[0.02] p-5 rounded-3xl border border-white/5 outline-none focus:border-primary/50 transition-colors resize-none placeholder:italic placeholder:opacity-50"
                placeholder="What is this project about?"
                disabled={isLoading}
              />
            </div>

            {/* Appearance Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground/80 px-1 flex items-center gap-2">
                  <Palette size={14} className="text-primary" /> Brand Color
                </label>
                <div className="flex gap-4 items-center bg-white/[0.02] p-4 rounded-3xl border border-white/5 shadow-inner">
                  <input
                    type="color"
                    className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none p-0 overflow-hidden shadow-lg"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                  <span className="text-xs font-black text-foreground/60 tracking-widest">{color.toUpperCase()}</span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground/80 px-1 flex items-center gap-2">
                  <ImageIcon size={14} className="text-primary" /> Cover Image URL
                </label>
                <input
                  className="flex h-14 w-full rounded-2xl border border-white/5 bg-white/[0.02] px-5 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30 transition-all font-medium"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground/80 px-1 flex items-center gap-2">
                <BarChart size={14} className="text-primary" /> Strategic Priority
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
                className="h-14 rounded-2xl border-white/5 bg-white/[0.02] px-5 text-xs font-black uppercase tracking-widest hover:bg-white/[0.05]"
                dropdownClassName="text-xs font-black uppercase tracking-widest"
              />
            </div>

            {/* Image Preview */}
            {imageUrl && (
              <div className="rounded-[32px] overflow-hidden border border-white/5 aspect-video relative group bg-black/20 shadow-2xl">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 flex items-center gap-2">
                  <div className="p-1 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] drop-shadow-md">Preview Active</span>
                </div>
              </div>
            )}

            {/* Members */}
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground/80 px-1 flex items-center gap-2">
                <Users size={14} className="text-primary" /> Team Assignment
              </label>
              <div className="flex flex-wrap gap-2 p-5 bg-white/[0.02] rounded-[32px] border border-white/5 min-h-[120px]">
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
                      "text-[10px] px-4 py-2.5 rounded-xl transition-all font-black uppercase tracking-wider border",
                      memberIds.includes(emp._id)
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105'
                        : 'bg-white/5 text-muted-foreground border-white/5 hover:border-primary/40'
                    )}
                  >
                    {emp.email.split('@')[0]}
                  </button>
                )) : (
                  <p className="text-[10px] font-bold text-muted-foreground/30 italic p-4 text-center w-full">Loading employees...</p>
                )}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="p-8 sm:p-10 border-t border-white/5 bg-background/80 backdrop-blur-xl flex gap-4 z-20">
            <Button 
              type="button" 
              variant="outline" 
              size="lg" 
              onClick={onClose} 
              disabled={isLoading} 
              className="flex-1 rounded-2xl border-white/10 hover:bg-white/5 bg-transparent h-14 font-black uppercase tracking-widest text-[11px]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isLoading} 
              className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus size={16} /> Create Project</>}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
