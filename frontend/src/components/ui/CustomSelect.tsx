'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
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
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync position for portal
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', () => setIsOpen(false), { passive: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', () => setIsOpen(false));
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  const dropdown = isOpen && mounted ? createPortal(
    <div 
      className={cn(
        "fixed z-[9999] mt-2 rounded-2xl border border-divider shadow-2xl overflow-hidden overflow-y-auto max-h-[300px]",
        "bg-card/95 backdrop-blur-3xl animate-in fade-in slide-in-from-top-2 duration-200 scrollbar-none",
        dropdownClassName
      )}
      style={{ 
        top: coords.top, 
        left: coords.left, 
        width: coords.width 
      }}
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
                "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all text-left",
                isSelected 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-foreground/40 hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2 truncate">
                {opt.icon && (
                  <span className={cn("flex-shrink-0 scale-90", opt.color)}>
                    {opt.icon}
                  </span>
                )}
                <span className={cn("truncate", opt.color && !isSelected ? opt.color : "")}>
                  {opt.label}
                </span>
              </div>
              {isSelected && (
                <div className="w-1.5 h-1.5 rounded-full bg-current ml-3" />
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
    </div>,
    document.body
  ) : null;

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
          "w-full flex items-center justify-between text-xs font-bold transition-all outline-none",
          "bg-muted/30 border border-divider rounded-xl px-4 py-2 text-foreground",
          "hover:bg-muted/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/50",
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
              <span className={cn("truncate", selectedOption.color ? selectedOption.color : "text-foreground")}>
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
            isOpen && "transform rotate-180 text-foreground"
          )} 
        />
      </button>

      {dropdown}
    </div>
  );
}

