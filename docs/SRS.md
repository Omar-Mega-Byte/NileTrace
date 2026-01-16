# Software Requirements Specification (SRS)
## Project: NileTrace (MVP)

### 1. Introduction
**NileTrace** is an AI-powered Incident Postmortem Platform designed to transform production incidents into structured, blameless postmortems. It automates the analysis of logs and incident timelines to generate root cause analyses, impact summaries, and prevention checklists.

### 2. Scope
The MVP (Minimum Viable Product) targets a 48-hour build timeframe, focusing on core functionality: incident data ingestion, AI analysis using Groq (Llama-3.1-70b), and report generation.

### 3. Functional Requirements

#### 3.1 Authentication
- **User Signup:** Users can create an account using email and password.
- **User Login:** Users can authenticate to access the platform.
- **Session Management:** Secure session handling (JWT) for API access.

#### 3.2 Incident Management
- **Create Incident:**
    - **Manual Metadata:** Users must input "Incident Start Time", "Severity Level" (SEV1-SEV5), and a "Description".
    - **Log Ingestion:**
        - **Text Paste:** A direct text area for pasting raw log snippets.
        - **File Upload:** Support for uploading `.log`, `.txt`, and `.json` files.
- **Incident History:** Users can view a list of their past incident reports.

#### 3.3 AI Analysis Engine
- **Processing:** The system will process ingested logs and metadata.
- **Privacy Layer (PII Redaction):** Before sending data to the LLM, the system essentially sanitizes inputs.
    - *Constraint:* For the MVP, a regex-based scrubber will mask patterns resembling Emails, IP Addresses, and Credit Card numbers to demonstrate privacy compliance.
- **Generation:** Utilizes **Groq API (Llama-3.1-70b-versatile)** to generate:
    - Root Cause Analysis (RCA)
    - Impact Summary
    - Action Items
    - Prevention Checklist

#### 3.4 Reporting & Export
- **View Postmortem:** structured display of the AI-generated content.
- **PDF Export:** Ability to download the final postmortem report as a formatted PDF file.
- **Persistence:** All generated reports are saved to the database (Supabase) for future retrieval.

### 4. Non-Functional Requirements

#### 4.1 Privacy & Security
- **Data Privacy:** Explicit commitment to minimizing PII exposure. The application must scrub sensitive data before transmission to 3rd party AI APIs.
- **Credibility Statement:** "NileTrace employs a strict pre-flight sanitization layer to ensure no personally identifiable information (PII) or secrets (API keys) leave your infrastructure boundaries."

#### 4.2 Architecture
- **Microservices:** Deployed on **Podman** containers.
- **Storage:** **Supabase** (PostgreSQL) for structured data and potential blob storage for log files.

#### 4.3 Performance
- **Response Time:** AI Generation should appear responsive (leveraging Groq's low-latency inference).
- **Scalability:** Microservices architecture allows independent scaling of analysis and ingestion layers.

### 5. User Flow
1.  User logs in.
2.  User clicks "New Postmortem".
3.  User enters Incident Severity, Date, and Description.
4.  User uploads a `server.log` file OR pastes error stack traces.
5.  System scrubs PII -> Sends to Groq -> Receives Analysis.
6.  User reviews the generated Postmortem.
7.  User clicks "Download PDF" or saves for later.

### 6. External Interfaces
- **Groq API:** For LLM inference.
- **Supabase:** For Database (PostgreSQL).
