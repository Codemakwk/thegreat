import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantClasses = {
  primary:
    'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 active:bg-primary-800',
  secondary:
    'bg-surface-200 hover:bg-surface-300 text-surface-900 dark:bg-surface-700 dark:hover:bg-surface-600 dark:text-surface-100',
  outline:
    'border-2 border-surface-300 dark:border-surface-600 hover:border-primary-500 dark:hover:border-primary-400 text-surface-700 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400',
  ghost:
    'hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400',
  danger:
    'bg-danger-500 hover:bg-danger-600 text-white shadow-lg shadow-danger-500/25',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2
        dark:focus:ring-offset-surface-900
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        <span className="w-4 h-4">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
