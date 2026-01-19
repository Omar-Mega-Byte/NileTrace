import React from 'react';
import { Link } from 'react-router-dom';
import { Button, EmptyState } from '@/components/ui';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <EmptyState
        type="custom"
        title="Page not found"
        description="The page you're looking for doesn't exist or has been moved."
        icon={
          <div className="text-6xl font-bold text-slate-200 dark:text-slate-700">404</div>
        }
        action={
          <Link to="/dashboard">
            <Button leftIcon={<Home className="h-4 w-4" />}>Back to Dashboard</Button>
          </Link>
        }
      />
    </div>
  );
};
