import { apiClient } from './api';
import { AnalysisJob, StartAnalysisRequest } from '@/types';

/**
 * Analysis service - handles all analysis job related API calls
 */
export const analysisService = {
  /**
   * Start a new analysis job for an incident
   */
  async startAnalysis(data: StartAnalysisRequest): Promise<AnalysisJob> {
    const response = await apiClient.post<AnalysisJob>('/analysis/jobs', data);
    return response.data;
  },

  /**
   * Get analysis job status and result
   */
  async getJobStatus(jobId: string): Promise<AnalysisJob> {
    const response = await apiClient.get<AnalysisJob>(`/analysis/jobs/${jobId}`);
    return response.data;
  },

  /**
   * Poll analysis job status until completion
   * @param jobId - The analysis job ID to poll
   * @param onProgress - Callback function called on each poll with current job status
   * @param intervalMs - Polling interval in milliseconds (default: 2000)
   * @param maxAttempts - Maximum polling attempts before giving up (default: 150 = ~5 minutes)
   * @returns Promise that resolves when job completes or rejects on failure
   */
  async pollJobStatus(
    jobId: string,
    onProgress?: (job: AnalysisJob) => void,
    intervalMs = 2000,
    maxAttempts = 150
  ): Promise<AnalysisJob> {
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          attempts++;
          const job = await this.getJobStatus(jobId);

          // Call progress callback if provided
          if (onProgress) {
            onProgress(job);
          }

          // Check if job is complete (support both QUEUED and PENDING for backwards compatibility)
          if (job.status === 'COMPLETED') {
            resolve(job);
            return;
          }

          // Check if job failed
          if (job.status === 'FAILED') {
            reject(new Error(job.errorMessage || job.error || 'Analysis job failed'));
            return;
          }

          // Check if max attempts reached
          if (attempts >= maxAttempts) {
            reject(new Error('Analysis polling timed out'));
            return;
          }

          // Continue polling
          setTimeout(poll, intervalMs);
        } catch (error) {
          reject(error);
        }
      };

      // Start polling
      poll();
    });
  },
};
