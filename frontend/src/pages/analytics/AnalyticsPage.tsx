import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Layout } from '@/components/layout';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui';
import { incidentService } from '@/services';
import { Incident, PaginatedResponse, Severity } from '@/types';
import {
  ArrowLeft,
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Calendar,
  Activity,
  Target,
  Timer,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Download,
} from 'lucide-react';
import { DefinitionList } from '@/components/ui/Stats';
import { DonutChart, BarChart, Sparkline } from '@/components/ui/Charts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Progress, CircularProgress } from '@/components/ui/Progress';
import { Timeline } from '@/components/ui/Timeline';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';

export const AnalyticsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setTimeRange] = useState('30d');

  const fetchIncidents = useCallback(async () => {
    try {
      const response = await incidentService.getAll();
      if (Array.isArray(response)) {
        setIncidents(response);
      } else {
        setIncidents((response as PaginatedResponse<Incident>).content || []);
      }
    } catch (err) {
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // Calculate comprehensive stats
  const stats = {
    total: incidents.length,
    open: incidents.filter((i) => i.status === 'OPEN').length,
    analyzing: incidents.filter((i) => i.status === 'ANALYZING').length,
    resolved: incidents.filter((i) => i.status === 'RESOLVED').length,
    failed: incidents.filter((i) => i.status === 'FAILED').length,
  };

  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
  const failureRate = stats.total > 0 ? Math.round((stats.failed / stats.total) * 100) : 0;

  // Severity breakdown
  const severityCounts: Record<Severity, number> = {
    SEV1: incidents.filter((i) => i.severity === 'SEV1').length,
    SEV2: incidents.filter((i) => i.severity === 'SEV2').length,
    SEV3: incidents.filter((i) => i.severity === 'SEV3').length,
    SEV4: incidents.filter((i) => i.severity === 'SEV4').length,
    SEV5: incidents.filter((i) => i.severity === 'SEV5').length,
  };

  const severityData = [
    { label: 'SEV1 - Critical', value: severityCounts.SEV1, color: '#ef4444' },
    { label: 'SEV2 - Major', value: severityCounts.SEV2, color: '#f97316' },
    { label: 'SEV3 - Moderate', value: severityCounts.SEV3, color: '#eab308' },
    { label: 'SEV4 - Minor', value: severityCounts.SEV4, color: '#3b82f6' },
    { label: 'SEV5 - Low', value: severityCounts.SEV5, color: '#64748b' },
  ];

  const statusData = [
    { label: 'Open', value: stats.open, color: '#f59e0b' },
    { label: 'Analyzing', value: stats.analyzing, color: '#3b82f6' },
    { label: 'Resolved', value: stats.resolved, color: '#22c55e' },
    { label: 'Failed', value: stats.failed, color: '#ef4444' },
  ];

  // Mock data for trends (in a real app, this would come from API)
  const weeklyData = [
    { label: 'Mon', value: 3 },
    { label: 'Tue', value: 5 },
    { label: 'Wed', value: 2 },
    { label: 'Thu', value: 8 },
    { label: 'Fri', value: 4 },
    { label: 'Sat', value: 1 },
    { label: 'Sun', value: 2 },
  ];

  const monthlyTrend = [12, 8, 15, 10, 18, 14, 22, 16, 19, 25, 20, incidents.length];
  const avgResolutionTime = '2h 34m';
  const criticalIncidents = severityCounts.SEV1 + severityCounts.SEV2;

  // Timeline items for resolved incidents
  const timelineItems = incidents
    .filter((i) => i.status === 'RESOLVED')
    .slice(0, 5)
    .map((incident) => ({
      id: incident.id,
      title: incident.title,
      description: `Severity: ${incident.severity}`,
      timestamp: formatRelativeTime(incident.updatedAt || incident.createdAt),
      status: 'completed' as const,
    }));

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Activity className="h-8 w-8 text-primary-500 animate-pulse" />
            </div>
            <p className="text-slate-600 dark:text-slate-400">Loading analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/dashboard"
          className="flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              Analytics
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Comprehensive insights into your incident management performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Tabs defaultValue="30d" onChange={(v) => setTimeRange(v)}>
              <TabsList>
                <TabsTrigger value="7d">7 Days</TabsTrigger>
                <TabsTrigger value="30d">30 Days</TabsTrigger>
                <TabsTrigger value="90d">90 Days</TabsTrigger>
                <TabsTrigger value="all">All Time</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="secondary" size="sm" leftIcon={<Download className="h-4 w-4" />}>
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 lg:grid-cols-4 mb-8">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 border-none">
          <CardContent className="p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm font-medium">Total Incidents</p>
                <p className="text-4xl font-bold mt-2">{stats.total}</p>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>12% from last period</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/20">
                <Activity className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-none">
          <CardContent className="p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Resolution Rate</p>
                <p className="text-4xl font-bold mt-2">{resolutionRate}%</p>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>5% improvement</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-none">
          <CardContent className="p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Critical Incidents</p>
                <p className="text-4xl font-bold mt-2">{criticalIncidents}</p>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <ArrowDownRight className="h-4 w-4" />
                  <span>3% decrease</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/20">
                <AlertTriangle className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500 to-purple-600 border-none">
          <CardContent className="p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100 text-sm font-medium">Avg Resolution Time</p>
                <p className="text-4xl font-bold mt-2">{avgResolutionTime}</p>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <Minus className="h-4 w-4" />
                  <span>No change</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/20">
                <Timer className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary-500" />
              Status Distribution
            </CardTitle>
            <CardDescription>Current breakdown by incident status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <DonutChart
                data={statusData}
                size={200}
                strokeWidth={24}
                showLegend={false}
                centerLabel={
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                      {stats.total}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Total
                    </div>
                  </div>
                }
              />
              <div className="flex-1 space-y-4">
                {statusData.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        {item.value}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        ({stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0}%)
                      </span>
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
              <Target className="h-5 w-5 text-primary-500" />
              Severity Analysis
            </CardTitle>
            <CardDescription>Incidents categorized by severity level</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={severityData}
              height={220}
              orientation="horizontal"
              showValues
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary-500" />
                  Monthly Trend
                </CardTitle>
                <CardDescription>Incident volume over the past 12 months</CardDescription>
              </div>
              <Sparkline data={monthlyTrend} width={100} height={36} color="#3b82f6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-end justify-between gap-2">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => {
                const value = monthlyTrend[index];
                const maxValue = Math.max(...monthlyTrend);
                const height = (value / maxValue) * 100;
                
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex-1 flex items-end justify-center">
                      <div
                        className={cn(
                          'w-full max-w-[40px] rounded-t-lg transition-all duration-300 hover:opacity-80',
                          index === monthlyTrend.length - 1
                            ? 'bg-primary-500'
                            : 'bg-primary-200 dark:bg-primary-900/50'
                        )}
                        style={{ height: `${height}%`, minHeight: '8px' }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{month}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary-500" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <CircularProgress
                value={resolutionRate}
                size={140}
                strokeWidth={12}
                variant="success"
                label="Resolved"
              />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Analysis Success</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {100 - failureRate}%
                  </span>
                </div>
                <Progress value={100 - failureRate} variant="success" size="sm" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Critical Response</span>
                  <span className="font-medium text-slate-900 dark:text-white">85%</span>
                </div>
                <Progress value={85} variant="warning" size="sm" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600 dark:text-slate-400">SLA Compliance</span>
                  <span className="font-medium text-slate-900 dark:text-white">92%</span>
                </div>
                <Progress value={92} variant="default" size="sm" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary-500" />
              Weekly Activity
            </CardTitle>
            <CardDescription>Incidents by day of week</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart data={weeklyData} height={180} showLabels showValues />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary-500" />
              Recent Resolutions
            </CardTitle>
            <CardDescription>Latest resolved incidents</CardDescription>
          </CardHeader>
          <CardContent>
            {timelineItems.length > 0 ? (
              <Timeline items={timelineItems} />
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No resolved incidents yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary-500" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DefinitionList
              items={[
                { label: 'Total Incidents', value: stats.total },
                { label: 'Open Incidents', value: stats.open },
                { label: 'In Analysis', value: stats.analyzing },
                { label: 'Resolved', value: stats.resolved },
                { label: 'Failed', value: stats.failed },
                { label: 'SEV1 Incidents', value: severityCounts.SEV1 },
                { label: 'SEV2 Incidents', value: severityCounts.SEV2 },
                { label: 'Resolution Rate', value: `${resolutionRate}%` },
              ]}
              direction="horizontal"
              columns={1}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
