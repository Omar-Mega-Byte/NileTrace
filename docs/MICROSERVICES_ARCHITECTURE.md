# Microservices Architecture Document
## Project: NileTrace

### 1. Architectural Overview
NileTrace follows a containerized microservices architecture. Each core business domain is separated into its own independently deployable service. The system is orchestrated using **Podman** (Podman Compose) for local development and potential production deployment.

### 2. Technology Stack
- **Frontend:** React (Vite)
- **Backend Framework:** Java 21+ / Spring Boot 3.x
- **Database:** Supabase (PostgreSQL managed service)
- **AI Provider:** Groq API
- **Containerization:** Podman

### 3. Service Definitions

#### 3.1 `frontend-client`
- **Type:** Single Page Application (SPA)
- **Tech:** React, Vite, Axios, TailwindCSS
- **Responsibility:**
    - User Interface for Login/Signup.
    - Forms for Incident log uploads.
    - Rendering Markdown reports.
    - PDF generation trigger (client-side or requesting binary from backend).

#### 3.2 `api-gateway` (Optional for MVP, simplifying to Nginx or direct port mapping)
*For this MVP (48h), we will map ports directly or use a lightweight proxy (Nginx). If complexity permits, Spring Cloud Gateway can be added.*

#### 3.3 `auth-service`
- **Tech:** Spring Boot, Spring Security, JWT
- **Port:** `8081`
- **Responsibility:**
    - User Registration & Login.
    - issuing JWT Tokens.
    - Validating tokens for other services (via shared secret or public key).
- **Database:** Stores User credentials/profiles in Supabase `users` table.

#### 3.4 `incident-service`
- **Tech:** Spring Boot
- **Port:** `8082`
- **Responsibility:**
    - CRUD operations for Incidents.
    - Handling file uploads (Logs).
    - Storing raw log content (Text or File Blob).
    - Orchestrating the "Analysis" workflow.
- **Database:** Stores `incidents`, `reports` in Supabase.

#### 3.5 `analysis-service`
- **Tech:** Spring Boot
- **Port:** `8083`
- **Responsibility:**
    - **PII Scrubbing:** Implementation of the Privacy Layer (Regex/NLP to mask emails, IPs).
    - **Prompt Engineering:** Constructing the context for the LLM.
    - **LLM Integration:** Client for Groq API.
    - Generates the markdown response and returns it to `incident-service`.

### 4. Data Flow

1.  **Ingestion:**
    - Client POSTs generic incident data + Log File to `incident-service`.
    - `incident-service` saves record as "PENDING".
2.  **Analysis Request:**
    - `incident-service` sends async request (or sync for MVP) to `analysis-service` with log content.
3.  **Sanitization & Processing:**
    - `analysis-service` runs `Sanitizer.clean(logData)`.
    - `analysis-service` calls Groq API with cleaned data.
4.  **Completion:**
    - `analysis-service` returns result structures.
    - `incident-service` updates DB record with generated Postmortem.
5.  **Consumption:**
    - Client fetches "COMPLETED" report.

### 5. Infrastructure (Podman)

We will use a `compose.yaml` (compatible with Podman Compose) to spin up the environment.

```yaml
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      - VITE_API_URL=http://localhost:8080

  auth-service:
    build: ./backend/auth-service
    ports: ["8081:8081"]
    environment:
      - DB_URL=...

  incident-service:
    build: ./backend/incident-service
    ports: ["8082:8082"]
    
  analysis-service:
    build: ./backend/analysis-service
    ports: ["8083:8083"]
    environment:
      - GROQ_API_KEY=${GROQ_API_KEY}
```

### 6. Persistence Strategy (Supabase)
Connection strings will point to the remote Supabase project. Local containers will connect via standard JDBC string.

- `jdbc:postgresql://db.supabase.co:5432/postgres`

### 7. Constraints & Mocking
- **Privacy Mock:** The `analysis-service` will log a warning: *"Privacy Shield Active: Masking N detected PII entities before external transmission"* to standard out, providing auditability for the MVP pitch.
