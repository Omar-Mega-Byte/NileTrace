import { useState, useEffect, useCallback, useRef } from 'react';
import { AnalysisJob } from '@/types';
import { analysisService } from '@/services';

interface UseAnalysisPollingOptions {
  intervalMs?: number;
  maxAttempts?: number;
  enabled?: boolean;
}

interface UseAnalysisPollingReturn {
  job: AnalysisJob | null;
  isPolling: boolean;
  error: string | null;
  startPolling: (jobId: string) => void;
  stopPolling: () => void;
}

/**
 * Hook for polling analysis job status
 * Automatically stops when job completes or fails
 */
export const useAnalysisPolling = (
  options: UseAnalysisPollingOptions = {}
): UseAnalysisPollingReturn => {
  const { intervalMs = 2000, maxAttempts = 150, enabled = true } = options;

  const [job, setJob] = useState<AnalysisJob | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const jobIdRef = useRef<string | null>(null);
  const attemptsRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPolling(false);
    jobIdRef.current = null;
    attemptsRef.current = 0;
  }, []);

  const poll = useCallback(async () => {
    if (!jobIdRef.current || !enabled) {
      stopPolling();
      return;
    }

    try {
      attemptsRef.current++;
      const jobData = await analysisService.getJobStatus(jobIdRef.current);
      setJob(jobData);

      // Check completion states
      if (jobData.status === 'COMPLETED') {
        stopPolling();
        return;
      }

      if (jobData.status === 'FAILED') {
        setError(jobData.error || 'Analysis failed');
        stopPolling();
        return;
      }

      // Check max attempts
      if (attemptsRef.current >= maxAttempts) {
        setError('Analysis polling timed out');
        stopPolling();
        return;
      }

      // Schedule next poll
      timeoutRef.current = setTimeout(poll, intervalMs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job status');
      stopPolling();
    }
  }, [enabled, intervalMs, maxAttempts, stopPolling]);

  const startPolling = useCallback(
    (jobId: string) => {
      // Reset state
      setError(null);
      setJob(null);
      attemptsRef.current = 0;
      jobIdRef.current = jobId;
      setIsPolling(true);

      // Start polling
      poll();
    },
    [poll]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    job,
    isPolling,
    error,
    startPolling,
    stopPolling,
  };
};
