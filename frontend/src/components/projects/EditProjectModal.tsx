'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Type, AlignLeft, BarChart, Image as ImageIcon, Palette, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project: any;
}

export function EditProjectModal({ isOpen, onClose, onSuccess, project }: EditProjectModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [imageUrl, setImageUrl] = useState('');
  const [color, setColor] = useState('#5850ec');
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (project && isOpen) {
      setTitle(project.title);
      setDescription(project.description || '');
      setStatus(project.status);
      setImageUrl(project.imageUrl || '');
      setColor(project.color || '#5850ec');
      setMemberIds(project.members || []);
      
      const fetchEmployees = async () => {
        try {
          const res = await api.get('/users');
          setEmployees(res.data);
        } catch (error) {
          console.error('Failed to fetch employees', error);
        }
      };
      fetchEmployees();
    }
  }, [project, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Strategic title is required');
      return;
    }

    setIsLoading(true);
    try {
      await api.patch(`/projects/${project._id}`, {
        title,
        description,
        status,
        imageUrl: imageUrl || undefined,
        color,
        members: memberIds
      });
      toast.success('Node configuration updated');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update node');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-all duration-500"
        onClick={onClose}
      />
      <div className="w-full max-w-xl rounded-[40px] astra-glass shadow-2xl border border-white/10 relative z-10 animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
        <div className="flex items-center justify-between p-10 border-b border-white/5 bg-background/20">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-foreground tracking-tighter">Configure Portfolio</h2>
            <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">Adjust Strategic node</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-3 hover:bg-white/5 rounded-2xl border border-transparent hover:border-white/10"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[80vh] overflow-y-auto scrollbar-none bg-background/40">
          <Input
            label="Node Designation"
            placeholder="e.g. Project Nexus"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoading}
            autoFocus
          />

          <div className="space-y-2 group">
            <label className="text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground/80 group-focus-within:text-primary transition-colors px-1">
              Objective Synopsis
            </label>
            <textarea
              className="flex w-full rounded-2xl border border-border bg-background/50 px-4 py-4 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary placeholder:text-muted-foreground/50 disabled:cursor-not-allowed disabled:opacity-50 font-medium astra-glass resize-none h-28"
              placeholder="Outline the primary mission parameters..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground/80 px-1 flex items-center gap-2">
                <Palette size={14} className="text-primary" /> Chroma Brand
              </label>
              <div className="flex gap-4 items-center bg-background/40 astra-glass p-3 rounded-2xl border border-border/50">
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
                <ImageIcon size={14} className="text-primary" /> Identity Stream
              </label>
              <input
                className="flex h-12 w-full rounded-2xl border border-border bg-background/40 px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium astra-glass"
                placeholder="Asset URL (https://...)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          </div>

          {imageUrl && (
            <div className="rounded-3xl overflow-hidden border border-white/5 aspect-video relative group bg-black/20 shadow-2xl">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                 <div className="p-1 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                 <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] drop-shadow-md">Identity Visual Active</span>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <label className="text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground/80 px-1 flex items-center gap-2">
                  <BarChart size={14} className="text-primary" /> Node Status
               </label>
               <select 
                 className="flex h-12 w-full rounded-2xl border border-border bg-background/40 px-4 text-xs font-black uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all astra-glass appearance-none"
                 value={status}
                 onChange={(e) => setStatus(e.target.value)}
               >
                 <option value="ACTIVE">Operational</option>
                 <option value="COMPLETED">Finalized</option>
                 <option value="ON_HOLD">Suspended</option>
               </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground/80 px-1 flex items-center gap-2">
              <Users size={14} className="text-primary" /> Squad Manifest
            </label>
            <div className="flex flex-wrap gap-2 p-4 bg-background/20 astra-glass border border-white/5 rounded-3xl min-h-[100px]">
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
                    "text-[10px] px-4 py-2 rounded-xl transition-all font-black uppercase tracking-wider border",
                    memberIds.includes(emp._id)
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                    : 'bg-muted/30 text-muted-foreground border-white/5 hover:border-primary/40'
                  )}
                >
                  {emp.email.split('@')[0]}
                </button>
              )) : (
                 <p className="text-[10px] font-bold text-muted-foreground/40 italic p-2 text-center w-full">Scanning for available squad members...</p>
              )}
            </div>
          </div>

          <div className="pt-8 flex justify-end gap-4 sticky bottom-0 bg-transparent py-4">
            <Button type="button" variant="ghost" size="lg" onClick={onClose} disabled={isLoading} className="rounded-2xl">
              Abort
            </Button>
            <Button type="submit" size="lg" disabled={isLoading} className="rounded-2xl min-w-[180px]">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Synchronize Config'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
