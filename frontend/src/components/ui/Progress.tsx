import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'gradient';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const variantClasses = {
  default: 'bg-primary-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  gradient: 'bg-gradient-to-r from-primary-500 via-violet-500 to-pink-500',
};

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  animated = false,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label || 'Progress'}
          </span>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden',
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            variantClasses[variant],
            animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showValue?: boolean;
  label?: string;
  className?: string;
}

const circularVariantClasses = {
  default: 'text-primary-500',
  success: 'text-green-500',
  warning: 'text-amber-500',
  danger: 'text-red-500',
};

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = 'default',
  showValue = true,
  label,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200 dark:text-slate-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            'transition-all duration-500 ease-out',
            circularVariantClasses[variant]
          )}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {Math.round(percentage)}%
          </span>
          {label && (
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
