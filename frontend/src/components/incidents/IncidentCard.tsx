import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import { Incident } from '@/types';
import { StatusBadge, SeverityBadge, Card } from '@/components/ui';
import { Clock, ChevronRight } from 'lucide-react';

interface IncidentCardProps {
  incident: Incident;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident }) => {
  return (
    <Link to={`/incidents/${incident.id}`}>
      <Card hover className="group">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {incident.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {incident.description}
            </p>
          </div>
          <StatusBadge status={incident.status} />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SeverityBadge severity={incident.severity} />
            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
              <Clock className="h-4 w-4 mr-1" />
              {formatRelativeTime(incident.createdAt)}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary-500 transition-colors" />
        </div>
      </Card>
    </Link>
  );
};

interface IncidentListProps {
  incidents: Incident[];
  className?: string;
}

export const IncidentList: React.FC<IncidentListProps> = ({ incidents, className }) => {
  return (
    <div className={cn('space-y-4', className)}>
      {incidents.map((incident) => (
        <IncidentCard key={incident.id} incident={incident} />
      ))}
    </div>
  );
};
