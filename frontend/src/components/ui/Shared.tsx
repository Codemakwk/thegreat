import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variantClasses = {
  default: 'bg-surface-200 text-surface-700 dark:bg-surface-700 dark:text-surface-300',
  success: 'bg-success-500/15 text-success-600 dark:text-success-400',
  warning: 'bg-warning-500/15 text-warning-600 dark:text-warning-400',
  danger: 'bg-danger-500/15 text-danger-600 dark:text-danger-400',
  info: 'bg-primary-500/15 text-primary-600 dark:text-primary-400',
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

/* ─── Skeleton Loaders ──────────────────────────────────────────── */

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`shimmer rounded-lg ${className}`} />
);

export const ProductCardSkeleton: React.FC = () => (
  <div className="glass-card overflow-hidden animate-pulse">
    <Skeleton className="w-full h-64" />
    <div className="p-5 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
    </div>
  </div>
);

/* ─── Rating Stars ──────────────────────────────────────────────── */

export const Stars: React.FC<{ rating: number; size?: number; interactive?: boolean; onChange?: (rating: number) => void }> = ({
  rating,
  size = 16,
  interactive = false,
  onChange,
}) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={star <= rating ? '#F59E0B' : 'none'}
            stroke={star <= rating ? '#F59E0B' : '#94A3B8'}
            strokeWidth="2"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

/* ─── Modal ─────────────────────────────────────────────────────── */

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const modalSizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={`
          relative w-full ${modalSizes[size]}
          bg-white dark:bg-surface-800
          rounded-2xl shadow-2xl
          border border-surface-200 dark:border-surface-700
          animate-scale-in
          max-h-[90vh] overflow-y-auto
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

/* ─── LoadingSpinner ────────────────────────────────────────────── */

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex items-center justify-center py-12">
      <div
        className={`${sizeClasses[size]} border-3 border-surface-300 dark:border-surface-600 border-t-primary-500 rounded-full animate-spin`}
      />
    </div>
  );
};

/* ─── EmptyState ────────────────────────────────────────────────── */

export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {icon && <div className="mb-4 text-surface-400">{icon}</div>}
    <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300 mb-2">{title}</h3>
    {description && <p className="text-surface-500 dark:text-surface-400 mb-6 max-w-md">{description}</p>}
    {action}
  </div>
);
