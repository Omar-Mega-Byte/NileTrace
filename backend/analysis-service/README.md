# Analysis Service

AI-powered log analysis microservice for NileTrace. This service provides PII scrubbing and LLM-based postmortem report generation.

## Features

- **PII Sanitization**: Automatically masks sensitive data (emails, IPs, phone numbers, credit cards) before sending to external LLM
- **LLM Integration**: Uses Groq API with llama-3.1-70b model for intelligent log analysis
- **Async Processing**: Job-based architecture with polling for results
- **Retry Logic**: Automatic retry for transient Groq API failures

## API Endpoints

### Submit Analysis Job
```http
POST /api/analysis/jobs
Content-Type: application/json

{
  "incidentId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Database Connection Timeout",
  "description": "Users experiencing intermittent connection failures",
  "severity": "SEV2",
  "logContent": "2024-01-15 10:23:45 ERROR...",
  "incidentStartTime": "2024-01-15T10:00:00Z",
  "createdAt": "2024-01-15T10:30:00Z",
  "serviceName": "user-service",
  "environment": "production",
  "region": "us-east-1"
}
```

**Response (202 Accepted):**
```json
{
  "jobId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "QUEUED",
  "message": "Analysis job queued successfully..."
}
```

### Get Job Status/Result
```http
GET /api/analysis/jobs/{jobId}
```

**Response (200 OK):**
```json
{
  "jobId": "123e4567-e89b-12d3-a456-426614174000",
  "incidentId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "COMPLETED",
  "markdownReport": "# Executive Summary\n...",
  "errorMessage": null,
  "createdAt": "2024-01-15T10:30:00Z",
  "completedAt": "2024-01-15T10:31:15Z",
  "piiEntitiesMasked": 5
}
```

### Health Check
```http
GET /api/analysis/health
```

## Job Status Values

| Status | Description |
|--------|-------------|
| `QUEUED` | Job accepted, not yet started |
| `PROCESSING` | LLM analysis in progress |
| `COMPLETED` | Report ready |
| `FAILED` | Permanent failure |

## Severity Levels

| Level | Meaning |
|-------|---------|
| `SEV1` | Critical outage |
| `SEV2` | Major degradation |
| `SEV3` | Partial impact |
| `SEV4` | Minor issue |
| `SEV5` | Informational |

## Configuration

| Property | Description | Default |
|----------|-------------|---------|
| `GROQ_API_KEY` | Groq API key (required) | - |
| `groq.api.model` | LLM model to use | `llama-3.1-70b-versatile` |
| `groq.api.temperature` | Response creativity | `0.3` |
| `groq.api.max-tokens` | Max response tokens | `4096` |
| `analysis.job.retention-hours` | Job cleanup interval | `24` |

## Running Locally

```bash
# Set environment variable
export GROQ_API_KEY=your_api_key_here

# Build and run
mvn clean package
java -jar target/analysis-service-0.0.1-SNAPSHOT.jar
```

## Docker

```bash
# Build image
docker build -t analysis-service .

# Run container
docker run -p 8083:8083 -e GROQ_API_KEY=your_key analysis-service
```

## API Documentation

Swagger UI available at: `http://localhost:8083/swagger-ui.html`

## Privacy Shield

The service logs PII masking activity for auditability:
```
WARN: Privacy Shield Active: Masking 5 detected PII entities before external transmission. Types: [EMAIL, IP, PHONE]
```

## Report Template

Generated reports follow a 7-section postmortem structure:
1. Executive Summary
2. Incident Timeline
3. Root Cause Analysis
4. Impact Assessment
5. Resolution Steps
6. Lessons Learned
7. Action Items
