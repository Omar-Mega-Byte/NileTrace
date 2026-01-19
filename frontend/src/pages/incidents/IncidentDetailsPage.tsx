import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { Layout } from '@/components/layout';
import {
  Button,
  StatusBadge,
  SeverityBadge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  PageLoader,
  EmptyState,
  Spinner,
} from '@/components/ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Timeline } from '@/components/ui/Timeline';
import { Progress, CircularProgress } from '@/components/ui/Progress';
import { Alert } from '@/components/ui/Alert';
import { CodeBlock, LogViewer, JsonViewer } from '@/components/ui/CodeBlock';
import { StatCard, KeyValuePair, DefinitionList } from '@/components/ui/Stats';
import { Avatar } from '@/components/ui/Avatar';
import { incidentService } from '@/services';
import { Incident } from '@/types';
import { formatDate, formatRelativeTime, cn } from '@/lib/utils';
import {
  ArrowLeft,
  Play,
  RefreshCw,
  Clock,
  Calendar,
  AlertTriangle,
  FileText,
  Activity,
  CheckCircle2,
  XCircle,
  Download,
  Copy,
  Share2,
  Bookmark,
  MoreHorizontal,
  Zap,
  Target,
  Shield,
  List,
  BookOpen,
  TrendingUp,
  Users,
  Timer,
  Eye,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const IncidentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStartingAnalysis, setIsStartingAnalysis] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Fetch incident details
  const fetchIncident = useCallback(async () => {
    if (!id) return;

    setError(null);

    try {
      const data = await incidentService.getById(id);
      setIncident(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load incident';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIncident();
  }, [fetchIncident]);

  // Handle starting analysis
  const handleStartAnalysis = async () => {
    if (!incident) return;

    setIsStartingAnalysis(true);

    try {
      const updatedIncident = await incidentService.analyze(incident.id);
      toast.success('Analysis started');
      
      setIncident(updatedIncident);
      
      if (updatedIncident.status === 'RESOLVED') {
        toast.success('Analysis completed');
      } else if (updatedIncident.status === 'ANALYZING') {
        toast('Analysis in progress...');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start analysis';
      toast.error(message);
    } finally {
      setIsStartingAnalysis(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  const handleExport = () => {
    if (!incident) return;
    const content = JSON.stringify(incident, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-${incident.id}.json`;
    a.click();
    toast.success('Incident exported');
  };

  if (isLoading) {
    return (
      <Layout>
        <PageLoader message="Loading incident details..." />
      </Layout>
    );
  }

  if (error || !incident) {
    return (
      <Layout>
        <EmptyState
          type="error"
          title="Incident not found"
          description={error || 'The incident you are looking for does not exist.'}
          action={
            <Link to="/dashboard">
              <Button variant="secondary">Back to Dashboard</Button>
            </Link>
          }
        />
      </Layout>
    );
  }

  const showAnalysisButton = incident.status === 'OPEN' || incident.status === 'FAILED';
  const isAnalyzing = incident.status === 'ANALYZING';
  const isResolved = incident.status === 'RESOLVED';

  // Build timeline items
  const timelineItems = [
    {
      id: '1',
      title: 'Incident Created',
      description: 'Incident was reported and logged',
      timestamp: formatRelativeTime(incident.createdAt),
      status: 'completed' as const,
    },
    ...(incident.incidentStartTime ? [{
      id: '2',
      title: 'Incident Started',
      description: 'When the incident first occurred',
      timestamp: formatDate(incident.incidentStartTime),
      status: 'completed' as const,
    }] : []),
    ...(incident.status === 'ANALYZING' ? [{
      id: '3',
      title: 'Analysis Started',
      description: 'AI analysis in progress',
      timestamp: 'In progress',
      status: 'current' as const,
    }] : []),
    ...(isResolved && incident.report ? [{
      id: '4',
      title: 'Analysis Completed',
      description: 'Postmortem report generated',
      timestamp: formatRelativeTime(incident.report.generatedAt),
      status: 'completed' as const,
    }] : []),
  ];

  const getStatusIcon = () => {
    switch (incident.status) {
      case 'RESOLVED':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'ANALYZING':
        return <Activity className="h-6 w-6 text-blue-500 animate-pulse" />;
      case 'FAILED':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-amber-500" />;
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </button>

        {/* Incident Header Card */}
        <Card className="overflow-hidden">
          <div className="p-6 pb-0">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className={cn(
                    'p-3 rounded-xl',
                    incident.status === 'RESOLVED' && 'bg-green-100 dark:bg-green-900/30',
                    incident.status === 'ANALYZING' && 'bg-blue-100 dark:bg-blue-900/30',
                    incident.status === 'FAILED' && 'bg-red-100 dark:bg-red-900/30',
                    incident.status === 'OPEN' && 'bg-amber-100 dark:bg-amber-900/30'
                  )}>
                    {getStatusIcon()}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {incident.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <SeverityBadge severity={incident.severity} />
                      <StatusBadge status={incident.status} />
                      <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(incident.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    isBookmarked
                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
                  )}
                  title="Bookmark"
                >
                  <Bookmark className={cn('h-5 w-5', isBookmarked && 'fill-current')} />
                </button>
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                  title="Copy link"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <button
                  onClick={handleExport}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                  title="Export"
                >
                  <Download className="h-5 w-5" />
                </button>
                
                {showAnalysisButton && (
                  <Button
                    onClick={handleStartAnalysis}
                    isLoading={isStartingAnalysis}
                    leftIcon={<Play className="h-4 w-4" />}
                  >
                    {incident.status === 'FAILED' ? 'Retry Analysis' : 'Start Analysis'}
                  </Button>
                )}
                {isAnalyzing && (
                  <Button variant="secondary" disabled leftIcon={<Spinner size="sm" />}>
                    Analyzing...
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-6 pt-4">
            <Tabs defaultValue="overview" onChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="overview">
                  <Eye className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="report" badge={isResolved ? undefined : undefined}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Report
                </TabsTrigger>
                <TabsTrigger value="timeline">
                  <Activity className="h-4 w-4 mr-2" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="data">
                  <FileText className="h-4 w-4 mr-2" />
                  Raw Data
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </Card>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Analysis Status Alert */}
              {isAnalyzing && (
                <Alert
                  variant="info"
                  title="Analysis in Progress"
                  className="animate-pulse"
                >
                  <div className="flex items-center gap-4 mt-3">
                    <CircularProgress value={65} size={60} strokeWidth={8} />
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Our AI is analyzing the incident data and generating a postmortem report.
                        This usually takes 1-3 minutes.
                      </p>
                      <div className="mt-2">
                        <Progress value={65} variant="default" animated />
                      </div>
                    </div>
                  </div>
                </Alert>
              )}

              {incident.status === 'FAILED' && (
                <Alert variant="error" title="Analysis Failed">
                  <p className="text-sm">
                    The analysis could not be completed. Please try again or contact support if the issue persists.
                  </p>
                </Alert>
              )}

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary-500" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {incident.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              {isResolved && incident.report && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <StatCard
                    title="Root Cause Identified"
                    value="Yes"
                    icon={<Target className="h-5 w-5" />}
                    trend={{ direction: 'up', value: 'Analyzed' }}
                    variant="success"
                  />
                  <StatCard
                    title="Action Items"
                    value={incident.report.actionItems ? 
                      incident.report.actionItems.split('\n').filter(Boolean).length.toString() : '0'}
                    icon={<List className="h-5 w-5" />}
                    description="Identified for follow-up"
                  />
                </div>
              )}

              {/* Report Summary Preview */}
              {isResolved && incident.report && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary-500" />
                        Report Summary
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab('report')}
                        className="text-primary-600"
                      >
                        View Full Report
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {incident.report.rootCauseAnalysis && (
                        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                          <h4 className="font-medium text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                            <Target className="h-4 w-4 text-red-500" />
                            Root Cause
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                            {incident.report.rootCauseAnalysis}
                          </p>
                        </div>
                      )}
                      {incident.report.impactSummary && (
                        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                          <h4 className="font-medium text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            Impact Summary
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                            {incident.report.impactSummary}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <DefinitionList
                    items={[
                      {
                        label: 'Created',
                        value: (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatRelativeTime(incident.createdAt)}
                          </span>
                        ),
                      },
                      {
                        label: 'Updated',
                        value: (
                          <span className="flex items-center gap-1">
                            <RefreshCw className="h-3.5 w-3.5" />
                            {formatRelativeTime(incident.updatedAt)}
                          </span>
                        ),
                      },
                      {
                        label: 'Incident ID',
                        value: (
                          <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono">
                            {incident.id.slice(0, 8)}...
                          </code>
                        ),
                      },
                      ...(incident.report ? [{
                        label: 'Report Generated',
                        value: formatRelativeTime(incident.report.generatedAt),
                      }] : []),
                    ]}
                    direction="horizontal"
                    columns={1}
                  />
                </CardContent>
              </Card>

              {/* Mini Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary-500" />
                    Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Timeline items={timelineItems} size="sm" />
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start"
                    onClick={handleStartAnalysis}
                    isLoading={isStartingAnalysis}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {isResolved ? 'Re-run Analysis' : 'Run Analysis'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start"
                    onClick={handleCopyLink}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start"
                    onClick={handleExport}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Report Tab */}
        {activeTab === 'report' && (
          <div className="space-y-6">
            {isResolved && incident.report ? (
              <>
                {/* Report Header Stats */}
                <div className="grid gap-4 sm:grid-cols-4">
                  <StatCard
                    title="Root Cause"
                    value="Identified"
                    icon={<Target className="h-5 w-5" />}
                    variant="success"
                  />
                  <StatCard
                    title="Impact Assessed"
                    value="Complete"
                    icon={<AlertTriangle className="h-5 w-5" />}
                    variant="warning"
                  />
                  <StatCard
                    title="Action Items"
                    value={incident.report.actionItems ? 
                      incident.report.actionItems.split('\n').filter(Boolean).length.toString() : '0'}
                    icon={<List className="h-5 w-5" />}
                  />
                  <StatCard
                    title="Prevention Steps"
                    value={incident.report.preventionChecklist ? 
                      incident.report.preventionChecklist.split('\n').filter(Boolean).length.toString() : '0'}
                    icon={<Shield className="h-5 w-5" />}
                  />
                </div>

                {/* Report Sections */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {incident.report.rootCauseAnalysis && (
                    <Card className="border-l-4 border-l-red-500">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-red-500" />
                          Root Cause Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-slate dark:prose-invert prose-sm max-w-none">
                          <ReactMarkdown>{incident.report.rootCauseAnalysis}</ReactMarkdown>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {incident.report.impactSummary && (
                    <Card className="border-l-4 border-l-amber-500">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                          Impact Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-slate dark:prose-invert prose-sm max-w-none">
                          <ReactMarkdown>{incident.report.impactSummary}</ReactMarkdown>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {incident.report.actionItems && (
                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <List className="h-5 w-5 text-blue-500" />
                          Action Items
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-slate dark:prose-invert prose-sm max-w-none">
                          <ReactMarkdown>{incident.report.actionItems}</ReactMarkdown>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {incident.report.preventionChecklist && (
                    <Card className="border-l-4 border-l-green-500">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-green-500" />
                          Prevention Checklist
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-slate dark:prose-invert prose-sm max-w-none">
                          <ReactMarkdown>{incident.report.preventionChecklist}</ReactMarkdown>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Full Report */}
                {incident.report.fullReport && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary-500" />
                        Full Postmortem Report
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-slate dark:prose-invert max-w-none">
                        <ReactMarkdown>{incident.report.fullReport}</ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <EmptyState
                    type="empty"
                    title="No Report Available"
                    description={
                      isAnalyzing 
                        ? 'Analysis is in progress. The report will appear here once complete.'
                        : 'Run analysis to generate a postmortem report for this incident.'
                    }
                    action={
                      !isAnalyzing && showAnalysisButton ? (
                        <Button onClick={handleStartAnalysis} isLoading={isStartingAnalysis}>
                          <Play className="h-4 w-4 mr-2" />
                          Start Analysis
                        </Button>
                      ) : undefined
                    }
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary-500" />
                Incident Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline items={timelineItems} />
              
              {incident.incidentStartTime && (
                <div className="mt-8 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary-500" />
                    Time Metrics
                  </h4>
                  <DefinitionList
                    items={[
                      { label: 'Incident Start', value: formatDate(incident.incidentStartTime) },
                      { label: 'Incident Logged', value: formatDate(incident.createdAt) },
                      { label: 'Last Updated', value: formatDate(incident.updatedAt) },
                      ...(incident.report ? [{
                        label: 'Report Generated',
                        value: formatDate(incident.report.generatedAt),
                      }] : []),
                    ]}
                    direction="horizontal"
                    columns={2}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Raw Data Tab */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary-500" />
                    Incident Data
                  </span>
                  <Button variant="secondary" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <JsonViewer data={incident} maxHeight="600px" />
              </CardContent>
            </Card>

            {incident.logs && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary-500" />
                    Attached Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LogViewer content={incident.logs} maxHeight="400px" />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};
