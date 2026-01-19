// Incident status types (must match backend enum)
export type IncidentStatus = 'OPEN' | 'ANALYZING' | 'RESOLVED' | 'FAILED';

// Severity levels
export type Severity = 'SEV1' | 'SEV2' | 'SEV3' | 'SEV4' | 'SEV5';

// Analysis job status (matches backend JobStatus enum)
export type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

// User type
export interface User {
  id: string;
  email: string;
  name: string;
  fullName?: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Incident types
export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  incidentStartTime?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  report?: IncidentReport;
}

export interface IncidentReport {
  id: string;
  incidentId: string;
  rootCauseAnalysis?: string;
  impactSummary?: string;
  actionItems?: string;
  preventionChecklist?: string;
  fullMarkdownReport?: string;
  modelVersion?: string;
  generatedAt: string;
}

export interface CreateIncidentRequest {
  title: string;
  description: string;
  severity: Severity;
  logs?: string;
  logContent?: string;
}

// Analysis types
export interface AnalysisJob {
  jobId: string;
  incidentId: string;
  status: JobStatus;
  markdownReport?: string;
  errorMessage?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
  piiEntitiesMasked?: number;
}

export interface AnalysisResult {
  postmortemReport: string;
  summary?: string;
  rootCause?: string;
  recommendations?: string[];
}

export interface StartAnalysisRequest {
  incidentId: string;
  title: string;
  description: string;
  severity: string;
  logContent: string;
  incidentStartTime?: string;
  createdAt?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// API Error type
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Pagination types
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
