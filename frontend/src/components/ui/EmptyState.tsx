import React from 'react';
import { cn } from '@/lib/utils';
import { FileQuestion, AlertCircle, Inbox, Search } from 'lucide-react';

type EmptyStateType = 'no-data' | 'error' | 'search' | 'custom';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

const defaultConfig: Record<
  Exclude<EmptyStateType, 'custom'>,
  { icon: React.ReactNode; title: string; description: string }
> = {
  'no-data': {
    icon: <Inbox className="h-12 w-12" />,
    title: 'No data yet',
    description: 'Start by creating your first item.',
  },
  error: {
    icon: <AlertCircle className="h-12 w-12" />,
    title: 'Something went wrong',
    description: 'We encountered an error loading this content.',
  },
  search: {
    icon: <Search className="h-12 w-12" />,
    title: 'No results found',
    description: 'Try adjusting your search or filters.',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'no-data',
  title,
  description,
  icon,
  action,
  className,
}) => {
  const config = type === 'custom' ? null : defaultConfig[type];

  const displayIcon = icon || config?.icon || <FileQuestion className="h-12 w-12" />;
  const displayTitle = title || config?.title || 'Nothing here';
  const displayDescription = description || config?.description || '';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className
      )}
    >
      <div className="text-slate-300 dark:text-slate-600 mb-4">{displayIcon}</div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
        {displayTitle}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {displayDescription}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
