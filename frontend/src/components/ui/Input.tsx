import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, type, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 group">
        {label && (
          <label className="text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground/80 group-focus-within:text-primary transition-colors px-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors pointer-events-none">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-10 w-full rounded-xl border border-border bg-background/50 px-4 py-2 text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary placeholder:text-muted-foreground/50 disabled:cursor-not-allowed disabled:opacity-50 font-medium astra-glass',
              icon && 'pl-10',
              error && 'border-red-500 focus-visible:ring-red-500/20',
              className
            )}
            ref={ref}
            {...props}
            value={props.value ?? ''}
          />
        </div>
        {error && (
          <p className="text-[10px] font-bold text-red-500 px-1 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
