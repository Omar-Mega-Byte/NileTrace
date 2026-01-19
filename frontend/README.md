# NileTrace Frontend

A production-ready React frontend for NileTrace - an AI-powered Incident Postmortem SaaS platform.

## Tech Stack

- **React 18** with Vite for fast development and builds
- **TypeScript** for type safety
- **Tailwind CSS** for styling with dark/light mode support
- **React Router** for navigation
- **Axios** for API calls
- **JWT Authentication** with token persistence

## Features

- 🔐 **Authentication** - Login, signup, and session management
- 📊 **Dashboard** - Overview of all incidents with status tracking
- 📝 **Incident Management** - Create and track incidents
- 🤖 **AI Analysis** - Automatic postmortem generation with real-time polling
- 📄 **Postmortem Reports** - Markdown rendering with copy/export options
- 🌙 **Dark Mode** - System-aware theme switching
- 📱 **Responsive** - Mobile-friendly design

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `/api` |

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components (Button, Input, Card, etc.)
│   ├── layout/          # Layout components (Sidebar, Header)
│   ├── routing/         # Route guards (ProtectedRoute, PublicRoute)
│   ├── incidents/       # Incident-specific components
│   └── postmortem/      # Postmortem report viewer
├── contexts/            # React contexts (Auth, Theme)
├── hooks/               # Custom hooks (useAnalysisPolling, useAsync)
├── lib/                 # Utility functions
├── pages/               # Page components
│   ├── auth/            # Login, Signup
│   ├── dashboard/       # Dashboard
│   └── incidents/       # Incident details, Create incident
├── services/            # API service layer
├── types/               # TypeScript types
└── App.tsx              # Root component with routing
```

## API Endpoints

The frontend integrates with the following backend endpoints:

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/validate` - Token validation

### Incidents
- `POST /api/incidents` - Create incident
- `GET /api/incidents` - List incidents
- `GET /api/incidents/{id}` - Get incident details

### Analysis
- `POST /api/analyze` - Start analysis job
- `GET /api/analyze/{jobId}` - Get job status

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Design Principles

- **Minimal & Professional** - Clean UI suitable for incident response
- **Accessible** - Keyboard navigation and screen reader support
- **Fast** - Optimized bundle size and lazy loading
- **Responsive** - Works on desktop, tablet, and mobile

## Production Build

```bash
npm run build
```

The build output will be in the `dist` directory, ready to be served by any static file server.

## License

MIT
