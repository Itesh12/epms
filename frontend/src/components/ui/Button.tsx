import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-[var(--aura-primary)] text-primary-foreground hover:shadow-lg hover:shadow-primary/30 transition-all border border-primary/20',
      secondary: 'bg-muted/80 backdrop-blur-md text-foreground hover:bg-muted border border-border shadow-sm',
      outline: 'border-2 border-border bg-transparent hover:border-primary hover:text-primary transition-all text-foreground/80',
      ghost: 'bg-transparent hover:bg-muted/50 text-foreground/70 hover:text-foreground',
      danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20',
    };

    const sizes = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-10 py-4 text-base font-bold',
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-2xl transition-all active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none font-bold tracking-tight select-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
