import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  trend?: {
    value: number;
    label?: string;
    direction: 'up' | 'down' | 'neutral';
  };
  action?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBg = 'bg-primary-100 dark:bg-primary-900/30',
  trend,
  action,
  className,
}) => {
  const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'down':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800';
    }
  };

  const TrendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  }[trend?.direction || 'neutral'];

  return (
    <div className={cn('card p-6 hover:shadow-soft-lg transition-shadow', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="mt-3 flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                  getTrendColor(trend.direction)
                )}
              >
                <TrendIcon className="h-3 w-3" />
                {trend.value}%
              </span>
              {trend.label && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {trend.label}
                </span>
              )}
            </div>
          )}
          {action && <div className="mt-4">{action}</div>}
        </div>
        {icon && (
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl',
              iconBg
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

interface MetricGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const MetricGrid: React.FC<MetricGridProps> = ({
  children,
  columns = 4,
  className,
}) => {
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-6', columnClasses[columns], className)}>
      {children}
    </div>
  );
};

interface KeyValuePairProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

export const KeyValuePair: React.FC<KeyValuePairProps> = ({
  label,
  value,
  icon,
  direction = 'horizontal',
  className,
}) => {
  if (direction === 'vertical') {
    return (
      <div className={cn('space-y-1', className)}>
        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          {icon}
          {label}
        </dt>
        <dd className="text-base font-semibold text-slate-900 dark:text-white">
          {value}
        </dd>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-between py-2', className)}>
      <dt className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
        {icon}
        {label}
      </dt>
      <dd className="text-sm font-medium text-slate-900 dark:text-white">
        {value}
      </dd>
    </div>
  );
};

interface DefinitionListProps {
  items: { label: string; value: React.ReactNode; icon?: React.ReactNode }[];
  direction?: 'horizontal' | 'vertical';
  columns?: 1 | 2 | 3;
  className?: string;
}

export const DefinitionList: React.FC<DefinitionListProps> = ({
  items,
  direction = 'horizontal',
  columns = 1,
  className,
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <dl className={cn('grid gap-4', columnClasses[columns], className)}>
      {items.map((item, index) => (
        <KeyValuePair
          key={index}
          label={item.label}
          value={item.value}
          icon={item.icon}
          direction={direction}
        />
      ))}
    </dl>
  );
};
