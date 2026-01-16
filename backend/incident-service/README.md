# Incident Service

Incident management microservice for NileTrace platform.

## Features

- Create, Read, Delete incidents
- Support for text log input (textarea)
- Support for file uploads (.log, .txt, .json)
- Trigger AI analysis via analysis-service
- Store incident reports
- JWT authentication (shared secret with auth-service)

## Tech Stack

- Java 21
- Spring Boot 3.4.1
- Spring Security + JWT
- Spring Data JPA
- WebClient for inter-service communication
- H2 Database (development)
- PostgreSQL/Supabase (production)

## Data Models

### Incident
- `id` (UUID)
- `ownerId` (UUID)
- `title` (VARCHAR 255)
- `description` (TEXT)
- `severity` (ENUM: SEV1-SEV5)
- `incidentStartTime` (TIMESTAMP WITH TZ)
- `status` (ENUM: OPEN, ANALYZING, RESOLVED, FAILED)
- `createdAt`, `updatedAt`

### IncidentReport
- `id` (UUID)
- `incidentId` (FK, UNIQUE)
- `rootCauseAnalysis` (TEXT)
- `impactSummary` (TEXT)
- `actionItems` (TEXT)
- `preventionChecklist` (TEXT)
- `generatedAt` (TIMESTAMP)
- `modelVersion` (VARCHAR)

### IncidentLog
- `id` (UUID)
- `incidentId` (FK)
- `content` (TEXT)
- `contentType` (ENUM: TEXT, FILE)
- `originalFilename` (VARCHAR, nullable)

## API Endpoints

### POST `/api/incidents`
Create a new incident.

**Request:**
```json
{
  "title": "Production Database Outage",
  "description": "Connection pool exhausted",
  "severity": "SEV1",
  "incidentStartTime": "2026-01-16T10:00:00Z",
  "logContent": "ERROR: Connection refused..."
}
```

### GET `/api/incidents`
Get all incidents for authenticated user.

### GET `/api/incidents/{id}`
Get a specific incident (includes report if exists).

### POST `/api/incidents/{id}/logs`
Upload a log file (multipart/form-data).

**Accepted files:** `.log`, `.txt`, `.json`

### POST `/api/incidents/{id}/logs/text`
Add plain text log content.

### POST `/api/incidents/{id}/analyze`
Trigger AI analysis. Changes status:
- `OPEN` → `ANALYZING` → `RESOLVED` (success)
- `OPEN` → `ANALYZING` → `FAILED` (error)

### DELETE `/api/incidents/{id}`
Delete an incident and associated data.

## Running Locally

### Prerequisites
- Java 21
- Maven 3.9+
- analysis-service running on port 8083

### Build
```bash
mvn clean package
```

### Run
```bash
mvn spring-boot:run
```

### Run Tests
```bash
mvn test
```

The service will start on `http://localhost:8082`

## Docker

### Build Image
```bash
podman build -t niletrace-incident-service .
```

### Run Container
```bash
podman run -p 8082:8082 \
  -e ANALYSIS_SERVICE_URL=http://analysis-service:8083 \
  niletrace-incident-service
```

## Configuration

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | Shared JWT secret | (set in properties) |
| `ANALYSIS_SERVICE_URL` | URL of analysis-service | `http://localhost:8083` |

## Security

- All endpoints require valid JWT token
- JWT is validated locally (shared secret with auth-service)
- Incidents are scoped to authenticated user (ownerId)
