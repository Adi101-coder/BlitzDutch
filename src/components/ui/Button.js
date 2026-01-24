import React from 'react';
import { cn } from '../../lib/utils';

const Button = React.forwardRef(({ 
  className, 
  variant = 'default', 
  size = 'default',
  children, 
  ...props 
}, ref) => {
  const variants = {
    default: 'bg-white text-black hover:bg-black hover:text-white border border-white',
    secondary: 'bg-transparent text-white border border-white/20 hover:border-white/40 hover:bg-white/5',
    ghost: 'bg-transparent text-white hover:bg-white/10',
    outline: 'bg-transparent text-white border-2 border-white hover:bg-white hover:text-black',
  };

  const sizes = {
    default: 'px-6 py-3',
    sm: 'px-4 py-2 text-sm',
    lg: 'px-8 py-4 text-lg',
    icon: 'p-2',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black',
        'disabled:opacity-50 disabled:pointer-events-none',
        'uppercase tracking-wide',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;

