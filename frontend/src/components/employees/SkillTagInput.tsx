'use client';

import { useState } from 'react';
import { X, Plus, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillTagInputProps {
  skills: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function SkillTagInput({ skills, onChange, placeholder = "Add expertise...", className }: SkillTagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addSkill = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
      setInputValue('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(skills.filter(s => s !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-2 min-h-[48px] p-3 rounded-2xl bg-black/20 border border-white/5 shadow-inner">
        {skills.map((skill) => (
          <div 
            key={skill}
            className="flex items-center gap-2 bg-primary/20 text-primary border border-primary/30 py-1.5 pl-3 pr-2 rounded-xl text-xs font-black uppercase tracking-widest group animate-in zoom-in-95 duration-300"
          >
            {skill}
            <button 
              onClick={() => removeSkill(skill)}
              className="p-1 hover:bg-primary/20 rounded-md transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {skills.length === 0 && (
          <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest py-1.5 px-2">No expertise modules initialized</span>
        )}
      </div>

      <div className="relative group">
        <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity" size={16} />
        <input 
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-2xl h-12 pl-12 pr-12 text-xs font-bold text-white placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-primary outline-none transition-all"
        />
        <button 
          onClick={addSkill}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
