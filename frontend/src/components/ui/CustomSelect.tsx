'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  color?: string; // Hex or theme color class
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string; // Added to trigger button
  dropdownClassName?: string; // Added to dropdown container
  disabled?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className,
  dropdownClassName,
  disabled
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={cn(
          "w-full flex items-center justify-between text-sm font-bold transition-all outline-none",
          "bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5",
          "hover:bg-white/[0.05] focus:border-primary/50 focus:ring-1 focus:ring-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <span className={cn("flex-shrink-0 flex items-center justify-center", selectedOption.color)}>
                  {selectedOption.icon}
                </span>
              )}
              <span className={cn("truncate", selectedOption.color ? selectedOption.color : "text-white")}>
                {selectedOption.label}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground/50 truncate">{placeholder}</span>
          )}
        </div>
        <ChevronDown 
          size={16} 
          className={cn(
            "text-muted-foreground/50 transition-transform duration-300 ml-2 flex-shrink-0",
            isOpen && "transform rotate-180 text-white"
          )} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className={cn(
            "absolute z-[100] w-full mt-2 rounded-2xl border border-white/10 shadow-2xl overflow-hidden overflow-y-auto max-h-[300px]",
            "bg-background/95 backdrop-blur-3xl animate-in fade-in slide-in-from-top-2 duration-200 scrollbar-none",
            dropdownClassName
          )}
        >
          <div className="p-1.5 flex flex-col gap-1">
            {options.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all",
                    isSelected 
                      ? "bg-primary/20 text-white" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.icon && (
                      <span className={cn("flex-shrink-0", opt.color)}>
                        {opt.icon}
                      </span>
                    )}
                    <span className={cn("truncate", opt.color && !isSelected ? opt.color : "")}>
                      {opt.label}
                    </span>
                  </div>
                  {isSelected && (
                    <CheckCircle2 size={16} className="text-primary flex-shrink-0 ml-3" />
                  )}
                </button>
              );
            })}
            
            {options.length === 0 && (
              <div className="px-4 py-8 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground/40">
                No options available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
