# NileTrace API Gateway

This service acts as the single entry point for all API requests to the NileTrace backend services. It routes incoming requests to the appropriate microservice based on the path.

## Overview

The API Gateway is built with Spring Cloud Gateway and provides:
- **Unified API endpoint** on port `8080`
- **Intelligent routing** to microservices
- **CORS handling** for frontend requests
- **Request/Response filtering**

## Routing Configuration

| Path Pattern        | Target Service      | Port  |
|---------------------|---------------------|-------|
| `/api/auth/**`      | Auth Service        | 8081  |
| `/api/incidents/**` | Incident Service    | 8082  |
| `/api/analyze/**`   | Analysis Service    | 8083  |

The gateway strips the `/api` prefix before forwarding requests to backend services.

## Configuration

### Port
```properties
server.port=8080
```

### CORS
Configured to allow requests from `http://localhost:3000` (frontend development server) with credentials support.

## Running the Gateway

### Using Maven
```bash
cd backend/api-gateway
mvn spring-boot:run
```

### Using the Startup Script
The gateway is automatically started when you run `start-all.bat` from the project root.

## Architecture Benefits

1. **Single Entry Point**: Frontend only needs to know about port 8080
2. **Service Discovery**: Easy to add/modify backend services without changing frontend config
3. **Security**: Can add authentication filters at gateway level
4. **Load Balancing**: Future-ready for multiple instances of services
5. **Monitoring**: Centralized logging and metrics collection point

## Health Check

Once running, verify the gateway is up:
```bash
curl http://localhost:8080/actuator/health
```

## Dependencies

- Spring Boot 3.2.0
- Spring Cloud Gateway
- Spring WebFlux (reactive web framework)
