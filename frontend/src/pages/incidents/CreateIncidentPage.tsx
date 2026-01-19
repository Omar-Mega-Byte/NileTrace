import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Layout } from '@/components/layout';
import { Button, Input, Textarea, Select, FileUpload, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { incidentService } from '@/services';
import { Severity, CreateIncidentRequest, ApiError } from '@/types';
import { ArrowLeft, Send, FileText } from 'lucide-react';

const severityOptions = [
  { value: 'SEV1', label: 'SEV1 - Critical (System Down)' },
  { value: 'SEV2', label: 'SEV2 - Major (Significant Impact)' },
  { value: 'SEV3', label: 'SEV3 - Moderate (Limited Impact)' },
  { value: 'SEV4', label: 'SEV4 - Minor (Minimal Impact)' },
  { value: 'SEV5', label: 'SEV5 - Low (Informational)' },
];

export const CreateIncidentPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CreateIncidentRequest>({
    title: '',
    description: '',
    severity: 'SEV3' as Severity,
    logs: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [autoAnalyze, setAutoAnalyze] = useState(true);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.severity) {
      newErrors.severity = 'Severity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Create the incident
      const incident = await incidentService.create(formData);
      toast.success('Incident created successfully');

      // Auto-start analysis if enabled and logs are provided
      if (autoAnalyze && formData.logs?.trim()) {
        try {
          await incidentService.analyze(incident.id);
          toast.success('Analysis started');
        } catch (err) {
          // Non-critical error - incident was created but analysis failed to start
          console.error('Failed to start analysis:', err);
          toast.error('Incident created, but analysis could not be started');
        }
      }

      navigate(`/incidents/${incident.id}`);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Failed to create incident');
      if (error.errors) {
        setErrors(
          Object.fromEntries(
            Object.entries(error.errors).map(([key, value]) => [key, value[0]])
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileUpload = (content: string) => {
    setFormData((prev) => ({ ...prev, logs: content }));
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Incident</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Document an incident for AI-powered postmortem analysis
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Incident Details</CardTitle>
                <CardDescription>
                  Provide basic information about the incident
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <Input
                  label="Title"
                  name="title"
                  placeholder="Brief description of the incident"
                  value={formData.title}
                  onChange={handleChange}
                  error={errors.title}
                  autoFocus
                />

                <Select
                  label="Severity"
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  options={severityOptions}
                  error={errors.severity}
                />

                <Textarea
                  label="Description"
                  name="description"
                  placeholder="Detailed description of what happened, impact, and timeline..."
                  value={formData.description}
                  onChange={handleChange}
                  error={errors.description}
                  className="min-h-[150px]"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Logs & Evidence
                </CardTitle>
                <CardDescription>
                  Paste logs or upload a log file for analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  label="Log Data"
                  name="logs"
                  placeholder="Paste relevant log entries, error messages, or stack traces..."
                  value={formData.logs}
                  onChange={handleChange}
                  className="min-h-[200px] font-mono text-sm"
                />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">
                      or upload a file
                    </span>
                  </div>
                </div>

                <FileUpload
                  onFileSelect={handleFileUpload}
                  accept=".txt,.log,.json"
                  maxSize={10 * 1024 * 1024} // 10MB
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analysis Options</CardTitle>
              </CardHeader>
              <CardContent>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoAnalyze}
                    onChange={(e) => setAutoAnalyze(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      Auto-start analysis
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Automatically begin AI analysis after creating the incident
                    </p>
                  </div>
                </label>
              </CardContent>
            </Card>

            <Card className="bg-slate-50 dark:bg-slate-800/50 border-dashed">
              <CardContent className="pt-6">
                <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Tips for better analysis
                </h4>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                  <li>• Include timestamps in your logs</li>
                  <li>• Provide full stack traces when available</li>
                  <li>• Describe the expected vs actual behavior</li>
                  <li>• Note any recent changes before the incident</li>
                  <li>• Include metrics or monitoring data if relevant</li>
                </ul>
              </CardContent>
            </Card>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              leftIcon={<Send className="h-4 w-4" />}
            >
              Create Incident
            </Button>
          </div>
        </div>
      </form>
    </Layout>
  );
};
