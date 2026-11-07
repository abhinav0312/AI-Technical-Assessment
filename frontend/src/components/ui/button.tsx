import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'glow';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none';

    const variants = {
      default: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 font-medium',
      glow: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 font-medium',
      destructive: 'bg-destructive text-white shadow-sm hover:bg-destructive/90',
      outline: 'border border-border bg-white text-slate-800 hover:bg-slate-50 hover:text-slate-900 shadow-xs',
      secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200/80 font-medium',
      ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
      link: 'text-brand-600 underline-offset-4 hover:underline p-0 h-auto font-medium',
    };

    const sizes = {
      default: 'h-9 px-4 py-2',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-11 rounded-md px-8 text-base font-semibold',
      icon: 'h-9 w-9',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
