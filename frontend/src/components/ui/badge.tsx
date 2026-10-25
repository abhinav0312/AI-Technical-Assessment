import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'border-transparent bg-brand-500/15 text-brand-300 border border-brand-500/30',
    secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'border-transparent bg-rose-500/15 text-rose-300 border border-rose-500/30',
    outline: 'text-foreground border border-border/80',
    success: 'border-transparent bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    warning: 'border-transparent bg-amber-500/15 text-amber-300 border border-amber-500/30',
    info: 'border-transparent bg-sky-500/15 text-sky-300 border border-sky-500/30',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
