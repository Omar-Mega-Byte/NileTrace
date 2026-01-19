import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Layout } from '@/components/layout';
import {
  Button,
  EmptyState,
  IncidentCardSkeleton,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  StatusBadge,
  SeverityBadge,
} from '@/components/ui';
import { IncidentList } from '@/components/incidents';
import { incidentService } from '@/services';
import { Incident, PaginatedResponse } from '@/types';
import {
  Plus,
  RefreshCw,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Clock,
  Zap,
  TrendingUp,
  BarChart3,
  PieChart,
  ArrowRight,
  Flame,
  Shield,
  Target,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { StatCard, MetricGrid } from '@/components/ui/Stats';
import { DonutChart, BarChart, Sparkline } from '@/components/ui/Charts';
import { ActivityFeed } from '@/components/ui/Timeline';
import { SearchBar, ViewToggle, FilterButton, SortButton, Pagination } from '@/components/ui/DataControls';
import { Progress } from '@/components/ui/Progress';
import { Banner } from '@/components/ui/Alert';
import { formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

export const DashboardPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);

  const fetchIncidents = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      const response = await incidentService.getAll();
      
      if (Array.isArray(response)) {
        setIncidents(response);
      } else {
        setIncidents((response as PaginatedResponse<Incident>).content || []);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load incidents';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  useEffect(() => {
    const hasAnalyzingIncidents = incidents.some((i) => i.status === 'ANALYZING');
    
    if (hasAnalyzingIncidents) {
      const interval = setInterval(() => {
        fetchIncidents(true);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [incidents, fetchIncidents]);

  const stats = {
    total: incidents.length,
    open: incidents.filter((i) => i.status === 'OPEN').length,
    analyzing: incidents.filter((i) => i.status === 'ANALYZING').length,
    resolved: incidents.filter((i) => i.status === 'RESOLVED').length,
    failed: incidents.filter((i) => i.status === 'FAILED').length,
  };

  const severityData = [
    { label: 'SEV1', value: incidents.filter((i) => i.severity === 'SEV1').length, color: '#ef4444' },
    { label: 'SEV2', value: incidents.filter((i) => i.severity === 'SEV2').length, color: '#f97316' },
    { label: 'SEV3', value: incidents.filter((i) => i.severity === 'SEV3').length, color: '#eab308' },
    { label: 'SEV4', value: incidents.filter((i) => i.severity === 'SEV4').length, color: '#3b82f6' },
    { label: 'SEV5', value: incidents.filter((i) => i.severity === 'SEV5').length, color: '#64748b' },
  ];

  const statusData = [
    { label: 'Open', value: stats.open, color: '#f59e0b' },
    { label: 'Analyzing', value: stats.analyzing, color: '#3b82f6' },
    { label: 'Resolved', value: stats.resolved, color: '#22c55e' },
    { label: 'Failed', value: stats.failed, color: '#ef4444' },
  ];

  const filteredIncidents = incidents
    .filter((i) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          i.title.toLowerCase().includes(query) ||
          i.description.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter((i) => !selectedStatus || i.status === selectedStatus)
    .sort((a, b) => {
      const aVal = sortBy === 'createdAt' ? new Date(a.createdAt).getTime() : a.severity;
      const bVal = sortBy === 'createdAt' ? new Date(b.createdAt).getTime() : b.severity;
      if (sortDir === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);
  const paginatedIncidents = filteredIncidents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const recentActivity = incidents
    .slice(0, 5)
    .map((incident) => ({
      id: incident.id,
      action: incident.status === 'RESOLVED' ? 'resolved incident' : incident.status === 'ANALYZING' ? 'started analysis on' : 'created incident',
      target: `"${incident.title}"`,
      timestamp: formatRelativeTime(incident.updatedAt || incident.createdAt),
      icon: incident.status === 'RESOLVED' ? <CheckCircle2 className="h-4 w-4 text-white" /> : incident.status === 'ANALYZING' ? <Activity className="h-4 w-4 text-white" /> : <AlertTriangle className="h-4 w-4 text-white" />,
      iconColor: incident.status === 'RESOLVED' ? 'bg-green-500' : incident.status === 'ANALYZING' ? 'bg-blue-500' : 'bg-amber-500',
    }));

  const weeklyTrend = [3, 5, 2, 8, 4, 6, incidents.length];
  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  return (
    <Layout>
      {showWelcomeBanner && incidents.length === 0 && !isLoading && (
        <Banner
          variant="promo"
          dismissible
          onDismiss={() => setShowWelcomeBanner(false)}
          className="mb-6 rounded-xl"
        >
          🎉 Welcome to NileTrace! Create your first incident to get started with AI-powered postmortem analysis.
        </Banner>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500">
              <Activity className="h-7 w-7 text-white" />
            </div>
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Track, analyze, and manage your incident postmortems with AI-powered insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchIncidents(true)}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
          <Link to="/incidents/new">
            <Button leftIcon={<Plus className="h-4 w-4" />} className="shadow-lg shadow-primary-500/25">
              New Incident
            </Button>
          </Link>
        </div>
      </div>

      {!isLoading && (
        <MetricGrid columns={4} className="mb-8">
          <StatCard
            title="Total Incidents"
            value={stats.total}
            icon={<FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />}
            iconBg="bg-primary-100 dark:bg-primary-900/30"
            subtitle="All time incidents"
            trend={stats.total > 0 ? { value: 12, direction: 'up', label: 'vs last week' } : undefined}
          />
          <StatCard
            title="Open"
            value={stats.open}
            icon={<AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
            iconBg="bg-amber-100 dark:bg-amber-900/30"
            subtitle="Awaiting analysis"
          />
          <StatCard
            title="In Progress"
            value={stats.analyzing}
            icon={<Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            subtitle="Being analyzed"
          />
          <StatCard
            title="Resolved"
            value={stats.resolved}
            icon={<CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />}
            iconBg="bg-green-100 dark:bg-green-900/30"
            subtitle="Completed analysis"
            trend={stats.resolved > 0 ? { value: 8, direction: 'up', label: 'this month' } : undefined}
          />
        </MetricGrid>
      )}

      {!isLoading && incidents.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-primary-500" />
                      Status Overview
                    </CardTitle>
                    <CardDescription>Current incident status distribution</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Resolution Rate</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{resolutionRate}%</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <DonutChart
                    data={statusData}
                    size={160}
                    strokeWidth={20}
                    showLegend={false}
                    centerLabel={
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Total</div>
                      </div>
                    }
                  />
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    {statusData.map((item) => (
                      <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{item.value}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary-500" />
                  Severity Distribution
                </CardTitle>
                <CardDescription>Incidents grouped by severity level</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={severityData} height={180} orientation="horizontal" showValues />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary-500" />
                      Weekly Trend
                    </CardTitle>
                    <CardDescription>Incident activity over the past week</CardDescription>
                  </div>
                  <Sparkline data={weeklyTrend} width={120} height={40} color="#3b82f6" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <div key={day} className="text-center">
                      <div
                        className="mx-auto w-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 transition-all hover:bg-primary-200 dark:hover:bg-primary-800/50"
                        style={{ height: `${Math.max(20, weeklyTrend[index] * 15)}px` }}
                      />
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{day}</p>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{weeklyTrend[index]}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary-500" />
                  Resolution Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={resolutionRate} variant="gradient" size="lg" showLabel label="Resolution Rate" animated={stats.analyzing > 0} />
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</p>
                      <p className="text-xs text-green-700 dark:text-green-300">Resolved</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                      <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.open + stats.analyzing}</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300">Pending</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <ActivityFeed items={recentActivity} />
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No recent activity</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/incidents/new" className="block">
                  <button className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                        <Plus className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Create Incident</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Report a new incident</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </button>
                </Link>
                <Link to="/analytics" className="block">
                  <button className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                        <BarChart3 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">View Analytics</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Detailed reports</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </button>
                </Link>
                <Link to="/settings" className="block">
                  <button className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                        <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Settings</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Configure preferences</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-primary-500" />
                All Incidents
              </CardTitle>
              <CardDescription>{filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''} found</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search incidents..." className="w-full sm:w-64" />
              <div className="flex items-center gap-2">
                <FilterButton active={!!selectedStatus} count={selectedStatus ? 1 : 0} onClick={() => setShowFilters(!showFilters)} />
                <SortButton
                  options={[
                    { value: 'createdAt', label: 'Date Created' },
                    { value: 'severity', label: 'Severity' },
                  ]}
                  value={sortBy}
                  direction={sortDir}
                  onChange={(value, direction) => {
                    setSortBy(value);
                    setSortDir(direction);
                  }}
                />
                <ViewToggle view={viewMode} onChange={setViewMode} />
              </div>
            </div>
          </div>
        </CardHeader>

        {showFilters && (
          <div className="px-6 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">Status:</span>
              {['OPEN', 'ANALYZING', 'RESOLVED', 'FAILED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    selectedStatus === status
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  )}
                >
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
              {selectedStatus && (
                <button onClick={() => setSelectedStatus(null)} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}

        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <IncidentCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              type="error"
              title="Failed to load incidents"
              description={error}
              icon={<AlertTriangle className="h-12 w-12" />}
              action={
                <Button onClick={() => fetchIncidents()} variant="secondary">
                  Try again
                </Button>
              }
            />
          ) : filteredIncidents.length === 0 ? (
            <EmptyState
              type="no-data"
              title={searchQuery ? 'No matching incidents' : 'No incidents yet'}
              description={
                searchQuery
                  ? `No incidents found matching "${searchQuery}"`
                  : 'Create your first incident to get started with AI-powered postmortem analysis.'
              }
              action={
                !searchQuery && (
                  <Link to="/incidents/new">
                    <Button leftIcon={<Plus className="h-4 w-4" />}>Create Incident</Button>
                  </Link>
                )
              }
            />
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {paginatedIncidents.map((incident) => (
                <IncidentGridCard key={incident.id} incident={incident} />
              ))}
            </div>
          ) : (
            <IncidentList incidents={paginatedIncidents} />
          )}

          {filteredIncidents.length > itemsPerPage && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredIncidents.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
};

interface IncidentGridCardProps {
  incident: Incident;
}

const IncidentGridCard: React.FC<IncidentGridCardProps> = ({ incident }) => {
  return (
    <Link to={`/incidents/${incident.id}`}>
      <div className="card p-5 hover:shadow-soft-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 group h-full">
        <div className="flex items-start justify-between gap-3 mb-3">
          <StatusBadge status={incident.status} />
          <SeverityBadge severity={incident.severity} />
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mb-2">
          {incident.title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4">
          {incident.description}
        </p>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-700">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" />
            {formatRelativeTime(incident.createdAt)}
          </span>
          {incident.status === 'RESOLVED' && (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Report Ready
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
