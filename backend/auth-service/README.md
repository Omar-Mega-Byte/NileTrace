# Auth Service

Authentication microservice for NileTrace platform.

## Features

- User Registration (Signup)
- User Login with JWT
- Token Validation
- Get Current User Info
- Logout (client-side token removal)

## Tech Stack

- Java 21
- Spring Boot 3.4.1
- Spring Security
- JWT (JJWT 0.12.5)
- H2 Database (development)
- PostgreSQL/Supabase (production)

## API Endpoints

### POST `/api/auth/signup`
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "type": "Bearer",
  "userId": 1,
  "email": "user@example.com",
  "fullName": "John Doe"
}
```

### POST `/api/auth/login`
Login with existing credentials.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as signup

### GET `/api/auth/validate`
Validate JWT token (used by other services).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Token is valid"
}
```

### GET `/api/auth/me`
Get current user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe"
}
```

### POST `/api/auth/logout`
Logout (stateless - client removes token).

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

## Running Locally

### Prerequisites
- Java 21
- Maven 3.9+

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

The service will start on `http://localhost:8081`

## Docker

### Build Image
```bash
podman build -t niletrace-auth-service .
```

### Run Container
```bash
podman run -p 8081:8081 niletrace-auth-service
```

## Configuration

### H2 Database (Default)
H2 console available at: `http://localhost:8081/h2-console`
- JDBC URL: `jdbc:h2:mem:authdb`
- Username: `sa`
- Password: (empty)

### Supabase (Production)
Update `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://db.xxxxx.supabase.co:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
```

### JWT Configuration
```properties
jwt.secret=YOUR_SECRET_KEY_HERE
jwt.expiration=86400000  # 24 hours in milliseconds
```

## Security Notes

- Passwords are hashed using BCrypt
- JWT tokens use symmetric encryption (HMAC-SHA256)
- CORS enabled for frontend origins
- Stateless authentication (no server-side sessions)
