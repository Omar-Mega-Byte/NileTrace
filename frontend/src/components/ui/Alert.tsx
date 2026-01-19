import React from 'react';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  Bell,
} from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: React.ReactNode;
  className?: string;
}

const variantConfig: Record<
  AlertVariant,
  { icon: React.ReactNode; className: string }
> = {
  info: {
    icon: <Info className="h-5 w-5" />,
    className:
      'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
  },
  success: {
    icon: <CheckCircle className="h-5 w-5" />,
    className:
      'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5" />,
    className:
      'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
  },
  error: {
    icon: <AlertCircle className="h-5 w-5" />,
    className:
      'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  icon,
  dismissible = false,
  onDismiss,
  action,
  className,
}) => {
  const config = variantConfig[variant];

  return (
    <div
      className={cn(
        'relative flex gap-3 p-4 rounded-xl border',
        config.className,
        className
      )}
      role="alert"
    >
      <div className="flex-shrink-0">{icon || config.icon}</div>
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold mb-1">{title}</h4>
        )}
        <div className="text-sm opacity-90">{children}</div>
        {action && <div className="mt-3">{action}</div>}
      </div>
      {dismissible && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 -m-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

// Notification Bell with Badge
interface NotificationBadgeProps {
  count?: number;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count = 0,
  className,
}) => {
  return (
    <button
      className={cn(
        'relative p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
        className
      )}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
};

// Status indicator dot
interface StatusDotProps {
  status: 'online' | 'offline' | 'busy' | 'away';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-slate-400',
  busy: 'bg-red-500',
  away: 'bg-amber-500',
};

const dotSizes = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-4 w-4',
};

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  size = 'md',
  pulse = false,
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex rounded-full',
        statusColors[status],
        dotSizes[size],
        pulse && 'animate-pulse',
        className
      )}
    />
  );
};

// Banner component
interface BannerProps {
  variant?: 'info' | 'success' | 'warning' | 'error' | 'promo';
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: React.ReactNode;
  className?: string;
}

const bannerVariants = {
  info: 'bg-blue-600',
  success: 'bg-green-600',
  warning: 'bg-amber-500',
  error: 'bg-red-600',
  promo: 'bg-gradient-to-r from-violet-600 to-pink-600',
};

export const Banner: React.FC<BannerProps> = ({
  variant = 'info',
  children,
  dismissible = false,
  onDismiss,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-4 px-4 py-3 text-sm font-medium text-white',
        bannerVariants[variant],
        className
      )}
    >
      <div className="flex-1 text-center">{children}</div>
      {action && <div className="flex-shrink-0">{action}</div>}
      {dismissible && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
