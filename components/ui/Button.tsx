import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-background-dark';
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-lg shadow-primary/30',
    secondary: 'bg-secondary text-white hover:bg-secondary-hover focus:ring-secondary shadow-lg shadow-secondary/30',
    outline: 'border-2 border-primary text-primary hover:bg-primary/5 focus:ring-primary dark:border-primary dark:text-primary dark:hover:bg-primary/10',
    ghost: 'text-text-muted-light hover:text-primary dark:text-text-muted-dark dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-surface-dark',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      {...props}
    >
      {icon && <span className={`material-icons-outlined ${children ? 'mr-2' : ''} text-[1.1em]`}>{icon}</span>}
      {children}
    </button>
  );
};
