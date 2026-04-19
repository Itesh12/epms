'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronDown, User, ShieldCheck, Loader2 } from 'lucide-react';
import api from '@/services/api';
import { cn } from '@/lib/utils';

interface Manager {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
}

interface ManagerSelectProps {
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export function ManagerSelect({ value, onChange, className }: ManagerSelectProps) {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);

  useEffect(() => {
    async function fetchManagers() {
      setIsLoading(true);
      try {
        const res = await api.get('/users/managers');
        setManagers(res.data);
      } catch (error) {
        console.error('Failed to fetch managers', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchManagers();
  }, []);

  useEffect(() => {
    if (value && managers.length > 0) {
      const found = managers.find(m => m._id === value);
      if (found) setSelectedManager(found);
    } else {
      setSelectedManager(null);
    }
  }, [value, managers]);

  const filteredManagers = managers.filter(m => 
    `${m.firstName || ''} ${m.lastName || ''} ${m.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={cn("relative", className)}>
      <div 
        className="astra-glass border border-white/10 rounded-xl px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <ShieldCheck size={16} className="text-primary" />
          <div className="text-left">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reporting Manager</div>
            <div className="text-xs font-bold text-white truncate max-w-[150px]">
              {selectedManager ? `${selectedManager.firstName || ''} ${selectedManager.lastName || ''}` : 'Select Supervisor'}
            </div>
          </div>
        </div>
        <ChevronDown size={14} className={cn("transition-transform duration-300", isOpen && "rotate-180")} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 astra-glass border border-white/10 rounded-2xl shadow-2xl z-[80] overflow-hidden animate-in slide-in-from-top-2 duration-300">
          <div className="p-3 border-b border-white/5 bg-white/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input 
                type="text" 
                placeholder="Search managers..." 
                className="w-full bg-black/40 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : filteredManagers.length > 0 ? (
              filteredManagers.map((m) => (
                <div 
                  key={m._id}
                  className={cn(
                    "p-4 hover:bg-primary/10 cursor-pointer flex items-center gap-3 transition-colors group",
                    value === m._id && "bg-primary/20"
                  )}
                  onClick={() => {
                    onChange(m._id);
                    setIsOpen(false);
                  }}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                    {m.firstName?.[0] || m.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-white group-hover:text-primary transition-colors">
                      {m.firstName} {m.lastName}
                    </div>
                    <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{m.designation || 'Specialist'}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                No commanders found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
