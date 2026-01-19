import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  status?: 'completed' | 'current' | 'upcoming';
  icon?: React.ReactNode;
  color?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  items,
  orientation = 'vertical',
  className,
}) => {
  if (orientation === 'horizontal') {
    return <HorizontalTimeline items={items} className={className} />;
  }

  return (
    <div className={cn('relative', className)}>
      {items.map((item, index) => (
        <div key={item.id} className="relative pb-8 last:pb-0">
          {/* Connector line */}
          {index < items.length - 1 && (
            <div
              className={cn(
                'absolute left-4 top-8 -ml-px h-full w-0.5',
                item.status === 'completed'
                  ? 'bg-primary-500'
                  : 'bg-slate-200 dark:bg-slate-700'
              )}
            />
          )}

          <div className="relative flex items-start group">
            {/* Status dot */}
            <div
              className={cn(
                'relative z-10 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-900 transition-all',
                item.status === 'completed'
                  ? 'bg-primary-500 text-white'
                  : item.status === 'current'
                  ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500'
                  : 'bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600'
              )}
            >
              {item.icon || (item.status === 'completed' && (
                <Check className="h-4 w-4" />
              ))}
              {item.status === 'current' && (
                <span className="h-2.5 w-2.5 rounded-full bg-primary-500 animate-pulse" />
              )}
            </div>

            {/* Content */}
            <div className="ml-4 min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {item.title}
                </h4>
                {item.timestamp && (
                  <time className="text-xs text-slate-500 dark:text-slate-400">
                    {item.timestamp}
                  </time>
                )}
              </div>
              {item.description && (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const HorizontalTimeline: React.FC<{ items: TimelineItem[]; className?: string }> = ({
  items,
  className,
}) => {
  return (
    <div className={cn('flex items-start justify-between', className)}>
      {items.map((item, index) => (
        <div key={item.id} className="relative flex flex-col items-center flex-1">
          {/* Connector line */}
          {index < items.length - 1 && (
            <div
              className={cn(
                'absolute top-4 left-1/2 w-full h-0.5',
                item.status === 'completed'
                  ? 'bg-primary-500'
                  : 'bg-slate-200 dark:bg-slate-700'
              )}
            />
          )}

          {/* Status dot */}
          <div
            className={cn(
              'relative z-10 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-900',
              item.status === 'completed'
                ? 'bg-primary-500 text-white'
                : item.status === 'current'
                ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500'
                : 'bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600'
            )}
          >
            {item.icon || (item.status === 'completed' && (
              <Check className="h-4 w-4" />
            ))}
            {item.status === 'current' && (
              <span className="h-2.5 w-2.5 rounded-full bg-primary-500 animate-pulse" />
            )}
          </div>

          {/* Content */}
          <div className="mt-3 text-center">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              {item.title}
            </h4>
            {item.timestamp && (
              <time className="text-xs text-slate-500 dark:text-slate-400">
                {item.timestamp}
              </time>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

interface ActivityFeedItem {
  id: string;
  user?: { name: string; avatar?: string };
  action: string;
  target?: string;
  timestamp: string;
  icon?: React.ReactNode;
  iconColor?: string;
}

interface ActivityFeedProps {
  items: ActivityFeedItem[];
  className?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ items, className }) => {
  return (
    <div className={cn('flow-root', className)}>
      <ul className="-mb-8">
        {items.map((item, index) => (
          <li key={item.id}>
            <div className="relative pb-8">
              {index < items.length - 1 && (
                <span
                  className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-700"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start space-x-3">
                <div
                  className={cn(
                    'relative h-10 w-10 flex items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-900',
                    item.iconColor || 'bg-slate-100 dark:bg-slate-800'
                  )}
                >
                  {item.icon || (
                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {item.user && (
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.user.name}{' '}
                      </span>
                    )}
                    {item.action}
                    {item.target && (
                      <span className="font-medium text-slate-900 dark:text-white">
                        {' '}{item.target}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">
                    {item.timestamp}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
