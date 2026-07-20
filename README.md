<div align="center">
  <br />
  <h1>DevFlow</h1>
  <p>
    <strong>An AI-powered learning & productivity workspace for developers and students.</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/status-active_development-0284c7?style=flat-square" alt="Status" />
    <img src="https://img.shields.io/badge/frontend-React_19-61dafb?style=flat-square" alt="React" />
    <img src="https://img.shields.io/badge/backend-Express_4-000000?style=flat-square" alt="Express" />
    <img src="https://img.shields.io/badge/database-MongoDB-47a248?style=flat-square" alt="MongoDB" />
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="License" />
  </p>
</div>

---

## Project Status

**Active Development** -- This project is currently in active development. Features are being added and refined. See the roadmap below for planned work.

---

## Overview

DevFlow is a full-stack productivity platform that combines task management, markdown note-taking, AI-generated learning roadmaps, and an AI mentor chat into a single workspace. It helps developers and students organize their learning journey, track progress, and get personalized guidance -- all in one place.

---

## Features

### ✅ Implemented

- **User Authentication** -- Signup, login, JWT-based authentication with persistent sessions via Zustand + localStorage.
- **Task Management** -- Full CRUD for tasks with types (daily, weekly, monthly, goal), priorities, due dates, subtasks, recurring schedules, and search/filter capabilities.
- **Notes (Markdown)** -- Create, edit, delete, and organize notes with Markdown editing and live preview. Supports categories, tags, pinning, favorites, and full-text search.
- **AI-Generated Learning Roadmaps** -- Generate structured, multi-module learning paths from a goal description and difficulty level. Powered by OpenAI (GPT-4o-mini) or Google Gemini with a mock fallback when no API key is configured.
- **AI Mentor Chat** -- Conversational AI mentor aware of the user's active roadmap and progress. Supports server-sent event (SSE) streaming for real-time responses.
- **AI Note Summarization** -- Summarize note content using AI.
- **Dashboard** -- Aggregated view of task completion stats, learning streak, roadmap progress, and recent activity.
- **Analytics** -- Visual charts (bar, line, heatmap) showing task completion trends, learning path progress, and weekly/monthly activity.
- **OAuth Readiness** -- Passport.js strategies configured for Google and GitHub OAuth (requires client ID/secret to activate).
- **Email Notifications** -- Password reset and email verification via Resend API.
- **Responsive Design** -- Mobile-responsive sidebar with drawer navigation.
- **Security** -- Helmet headers, CORS, rate limiting (120 req/15min), bcrypt password hashing, Zod request validation.

### 🚧 In Progress

- None currently flagged as in-progress; all modules are implemented at a functional baseline.

### 📌 Planned

- Formal unit/integration test suite (Jest + Supertest)
- E2E tests (Playwright / Cypress)
- CI/CD pipeline (GitHub Actions)
- Pagination for tasks and notes
- Collaborative note editing
- Mobile app (React Native)

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| Vite 8 | Build tool & dev server |
| Tailwind CSS 3 | Utility-first styling |
| React Router 6 | Client-side routing |
| Zustand | State management (persisted) |
| Axios | HTTP client |
| Recharts | Charts & analytics |
| React Markdown | Markdown rendering |
| Lucide React | Icon library |

### Backend

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express 4 | Web framework |
| Mongoose 9 | MongoDB ODM |
| Zod 4 | Schema validation |
| JSON Web Token | Authentication |
| Passport.js | OAuth strategies |
| Winston | Logging |
| Morgan | HTTP request logging |

### Database

- **MongoDB** -- Primary database with Mongoose ODM
- **mongodb-memory-server** -- In-memory MongoDB fallback for local development when no external MongoDB is available

### Authentication

- JWT access tokens (15min expiry) + refresh tokens (7-day rotation)
- bcryptjs (12 salt rounds) for password hashing
- Google OAuth 2.0 (via passport-google-oauth20)
- GitHub OAuth (via passport-github2)

### AI Integration

- **OpenAI** (GPT-4o-mini) for roadmap generation, mentor chat, and note summarization
- **Google Gemini** (gemini-2.0-flash) as an alternative AI provider
- Extensible provider pattern via abstract base class with mock fallback for development

### Development Tools

- ESLint + Prettier for code quality
- Nodemon for server hot-reload
- Docker Compose for local MongoDB
- Render (backend deployment) + Vercel (frontend deployment) configs included

---

## Project Architecture
devflow/ ├── client/ # React frontend (Vite) │ ├── public/ │ ├── src/ │ │ ├── components/ │ │ │ ├── ui/ # Reusable primitives (ErrorBoundary, Toast) │ │ │ ├── MarkdownRenderer.jsx │ │ │ ├── RoadmapViewer.jsx │ │ │ └── TaskForm.jsx │ │ ├── hooks/ # Custom React hooks │ │ │ ├── useApiCall.js │ │ │ └── useOptimisticUpdate.js │ │ ├── layouts/ │ │ │ └── DashboardLayout.jsx # Sidebar + mobile drawer │ │ ├── pages/ # Route-level page components │ │ │ ├── AnalyticsPage.jsx │ │ │ ├── DashboardPage.jsx │ │ │ ├── ForgotPasswordPage.jsx │ │ │ ├── LearningPathsPage.jsx │ │ │ ├── LoginPage.jsx │ │ │ ├── MentorPage.jsx │ │ │ ├── NotesPage.jsx │ │ │ ├── NotFoundPage.jsx │ │ │ ├── ResetPasswordPage.jsx │ │ │ ├── SignupPage.jsx │ │ │ ├── TasksPage.jsx │ │ │ └── VerifyEmailPage.jsx │ │ ├── routes/ │ │ │ ├── AppRoutes.jsx # All route definitions │ │ │ └── ProtectedRoute.jsx # Auth guard │ │ ├── services/ │ │ │ └── api.js # Axios instance + SSE streaming │ │ ├── store/ │ │ │ ├── authStore.js # Zustand auth (persisted) │ │ │ └── toastStore.js # Toast notification state │ │ ├── styles/ │ │ │ └── global.css # Tailwind directives + theme │ │ ├── App.jsx │ │ └── main.jsx │ ├── index.html │ ├── vite.config.js │ ├── tailwind.config.js │ ├── postcss.config.js │ ├── vercel.json │ └── .env.example │ ├── server/ # Express backend │ ├── src/ │ │ ├── config/ │ │ │ ├── db.js # MongoDB connector + in-memory fallback │ │ │ ├── env.js # Zod-validated environment config │ │ │ └── passport.js # OAuth strategy setup │ │ ├── controllers/ │ │ │ ├── ai.controller.js │ │ │ ├── auth.controller.js │ │ │ ├── dashboard.controller.js │ │ │ ├── learningPath.controller.js │ │ │ ├── note.controller.js │ │ │ ├── task.controller.js │ │ │ └── user.controller.js │ │ ├── middleware/ │ │ │ ├── auth.middleware.js │ │ │ ├── error.middleware.js │ │ │ ├── notFound.middleware.js │ │ │ ├── rateLimit.middleware.js │ │ │ ├── requestId.middleware.js │ │ │ ├── response.middleware.js │ │ │ └── validate.middleware.js │ │ ├── models/ │ │ │ ├── LearningPath.js │ │ │ ├── Note.js │ │ │ ├── Task.js │ │ │ └── User.js │ │ ├── routes/ │ │ │ ├── ai.routes.js │ │ │ ├── auth.routes.js │ │ │ ├── dashboard.routes.js │ │ │ ├── learningPath.routes.js │ │ │ ├── note.routes.js │ │ │ ├── task.routes.js │ │ │ └── user.routes.js │ │ ├── services/ │ │ │ ├── ai/ # AI provider implementations │ │ │ │ ├── aiProvider.js # Abstract base + mocks │ │ │ │ ├── openai.provider.js # OpenAI implementation │ │ │ │ └── gemini.provider.js # Google Gemini implementation │ │ │ ├── ai.service.js # Provider orchestrator │ │ │ ├── auth.service.js │ │ │ ├── email.service.js # Resend email integration │ │ │ └── user.service.js │ │ ├── utils/ │ │ │ ├── ApiError.js # Custom error class │ │ │ ├── logger.js # Winston logger │ │ │ └── token.js # JWT + refresh token helpers │ │ └── validators/ │ │ ├── auth.validator.js │ │ ├── learningPath.validator.js │ │ ├── note.validator.js │ │ ├── task.validator.js │ │ └── user.validator.js │ ├── server.js # Entry point │ ├── .env.example │ └── package.json │ ├── docker-compose.yml # Local MongoDB container ├── render.yaml # Render deployment config ├── package.json # Root scripts (monorepo) └── README.md


---

## Screens

| Route | Page | Description |
|-------|------|-------------|
| `/login` | LoginPage | Email/password authentication |
| `/signup` | SignupPage | User registration |
| `/verify-email` | VerifyEmailPage | Email verification handler |
| `/forgot-password` | ForgotPasswordPage | Password reset request |
| `/reset-password` | ResetPasswordPage | Password reset with token |
| `/dashboard` | DashboardPage | Stats overview, quick actions, activity feed |
| `/tasks` | TasksPage | Task CRUD with filters and modal form |
| `/notes` | NotesPage | Split-pane markdown editor with sidebar |
| `/roadmaps` | LearningPathsPage | AI roadmap generator and path list |
| `/mentor` | MentorPage | AI mentor chat with SSE streaming |
| `/analytics` | AnalyticsPage | Charts, heatmaps, and learning metrics |
| `*` | NotFoundPage | 404 handler |

---

## Backend Architecture

### API Structure

All endpoints are prefixed with `/api/v1`. The Express app follows a layered architecture:
Routes → Validators → Controllers → Services → Models (MongoDB) ↓ Middleware (auth, rate-limit, error handling, response formatting)


### Controllers

Handle HTTP request/response lifecycle. Each controller delegates business logic to service layers.

- **auth.controller.js** -- Signup, login, token refresh, logout, email verification, password reset, OAuth callbacks
- **task.controller.js** -- Task CRUD with query filtering
- **note.controller.js** -- Note CRUD with search and category filtering
- **learningPath.controller.js** -- Learning path CRUD + AI-powered roadmap generation
- **ai.controller.js** -- Mentor chat (standard + SSE streaming), note summarization
- **dashboard.controller.js** -- Aggregated stats and analytics queries
- **user.controller.js** -- Profile updates

### Services

- **auth.service.js** -- User creation, authentication, token management, OAuth user resolution
- **user.service.js** -- Profile update logic
- **ai.service.js** -- AI provider routing (OpenAI / Gemini / mock)
- **email.service.js** -- Email dispatch via Resend API
- **ai/openai.provider.js** -- OpenAI GPT-4o-mini integration with mock fallback
- **ai/gemini.provider.js** -- Google Gemini integration with mock fallback
- **ai/aiProvider.js** -- Abstract base class with built-in mock generators

### Models

- **User** -- Username, email, hashed password, profile fields, OAuth provider links, email verification, password reset tokens, refresh token hash, streak tracking
- **Task** -- Title, description, type (daily/weekly/monthly/goal), status, priority, due date, category, subtasks, recurring config, soft delete support
- **Note** -- Title, content (Markdown), category, tags, pinned, favorite, soft delete support
- **LearningPath** -- Title, description, goal, difficulty, estimated hours, progress (0-100), status, nested modules with topics (with completion tracking), resources, projects, soft delete support

### Middleware

| Middleware | Purpose |
|------------|---------|
| `auth.middleware` | JWT Bearer token verification |
| `error.middleware` | Global error handler with status codes |
| `notFound.middleware` | 404 route handler |
| `rateLimit.middleware` | 120 requests per 15 minutes per IP |
| `requestId.middleware` | UUID request tracking (X-Request-Id header) |
| `response.middleware` | `res.success()` helper for consistent JSON responses |
| `validate.middleware` | Zod schema validation for request bodies |

### Validation

All request schemas are defined with **Zod** and enforced by the `validate` middleware. Schemas cover:

- Signup, login, forgot password, reset password
- Task creation & update
- Note creation & update
- Learning path generation & update
- Profile update

### Authentication Flow

1. User submits credentials (or OAuth provider)
2. Server validates with Zod, authenticates via `auth.service`
3. JWT access token (15min) + refresh token (7-day) generated
4. Refresh token hashed and stored on user document
5. Access token returned in response body; refresh token set as httpOnly cookie
6. Frontend stores access token in Zustand (persisted to localStorage)
7. Axios interceptor attaches `Authorization: Bearer` header
8. Auth middleware verifies JWT on every protected request
9. `/auth/refresh` rotates tokens transparently

### Error Handling

- Custom `ApiError` class with `statusCode`, `message`, and optional `errors` field
- Global error middleware catches all errors (including async via `express-async-errors`)
- Consistent JSON response format: `{ success: false, message, errors, requestId }`

---

## Current Progress

| Module | Status | Notes |
|--------|--------|-------|
| Authentication (JWT) | ✅ Complete | Signup, login, refresh, logout, protected routes |
| Email Verification | ✅ Complete | Token-based with Resend integration |
| Password Reset | ✅ Complete | Token-based with expiry |
| OAuth (Google/GitHub) | ✅ Complete | Passport strategies configured; requires client credentials |
| Task Management | ✅ Complete | Full CRUD with filtering, subtasks, recurring |
| Notes (Markdown) | ✅ Complete | Full CRUD with categories, search, pin, favorite |
| AI Roadmap Generation | ✅ Complete | OpenAI / Gemini / mock; saves structured paths |
| AI Mentor Chat | ✅ Complete | Streaming SSE; roadmap-aware context |
| AI Note Summarization | ✅ Complete | OpenAI / Gemini / mock |
| Dashboard Stats | ✅ Complete | Aggregated task, note, roadmap, streak data |
| Analytics & Charts | ✅ Complete | Recharts bar/line/heatmap visualizations |
| Responsive UI | ✅ Complete | Mobile drawer navigation |
| Security (Helmet, CORS, Rate Limit) | ✅ Complete | Production-ready middleware stack |
| Input Validation (Zod) | ✅ Complete | All endpoints validated |
| In-Memory DB Fallback | ✅ Complete | mongodb-memory-server for dev |
| Docker Compose | ✅ Complete | Local MongoDB container |
| Deployment Configs | ✅ Complete | Render + Vercel configs |
| Test Suite | 📌 Planned | Jest + Supertest |
| CI/CD Pipeline | 📌 Planned | GitHub Actions |

---

## Installation

### Prerequisites

- **Node.js** v20+ and npm
- **MongoDB** (optional -- in-memory fallback available for development)
- **Docker Desktop** (optional -- for running MongoDB in a container)

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd devflow

# Install all dependencies (root, client, server)
npm run install:all
Backend Configuration
cd server
cp .env.example .env
# Edit .env with your values (see Environment Variables section)
Frontend Configuration
cd client
cp .env.example .env
# Edit .env if needed
Start MongoDB (Optional)
docker compose up -d mongo
If you skip this step, the server automatically starts an in-memory MongoDB instance.

Run Locally
# From the root directory -- starts both client and server concurrently
npm run dev

# Or start individually:
npm run dev:server   # Backend at http://localhost:5000
npm run dev:client   # Frontend at http://localhost:5173
Environment Variables
Server (server/.env)
# Node Environment
NODE_ENV=development

# Server
PORT=5000

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/devflow

# JWT
JWT_SECRET=change_this_to_a_long_random_string

# CORS
FRONTEND_URL=http://localhost:5173

# Logging
LOG_LEVEL=info

# AI Provider (openai | gemini | claude | ollama | local)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.0-flash

# Email (Resend)
RESEND_API_KEY=re_...

# SMTP Fallback (optional -- used if Resend not configured)
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@devflow.app

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
Client (client/.env)
VITE_API_URL=http://localhost:5000/api/v1
API Overview
All endpoints are prefixed with /api/v1. Responses follow the format:

{ "success": true, "message": "...", "data": { ... } }
Authentication
Method	Endpoint	Purpose	Auth
POST	/auth/signup	Register a new user	No
POST	/auth/login	Log in with email/password	No
POST	/auth/refresh	Refresh access token	Cookie
POST	/auth/logout	Log out and clear refresh token	No
GET	/auth/me	Get current user profile	Bearer
GET	/auth/verify-email	Verify email with token	No
POST	/auth/resend-verification	Resend verification email	Bearer
POST	/auth/forgot-password	Request password reset	No
POST	/auth/reset-password	Reset password with token	No
GET	/auth/google	Google OAuth login	No
GET	/auth/google/callback	Google OAuth callback	No
GET	/auth/github	GitHub OAuth login	No
GET	/auth/github/callback	GitHub OAuth callback	No
Users
Method	Endpoint	Purpose	Auth
PUT	/users/profile	Update user profile	Bearer
Tasks
Method	Endpoint	Purpose	Auth
GET	/tasks	List tasks (filterable)	Bearer
POST	/tasks	Create a task	Bearer
PUT	/tasks/:id	Update a task	Bearer
DELETE	/tasks/:id	Soft-delete a task	Bearer
Notes
Method	Endpoint	Purpose	Auth
GET	/notes	List notes (filterable)	Bearer
POST	/notes	Create a note	Bearer
PUT	/notes/:id	Update a note	Bearer
DELETE	/notes/:id	Soft-delete a note	Bearer
Learning Paths
Method	Endpoint	Purpose	Auth
GET	/learning-paths	List learning paths	Bearer
GET	/learning-paths/:id	Get a single path	Bearer
POST	/learning-paths	Create a path manually	Bearer
POST	/learning-paths/generate	AI-generate a roadmap	Bearer
PUT	/learning-paths/:id	Update path (topic progress)	Bearer
DELETE	/learning-paths/:id	Soft-delete a path	Bearer
AI
Method	Endpoint	Purpose	Auth
POST	/ai/mentor	Ask AI mentor (non-streaming)	Bearer
POST	/ai/mentor/stream	Ask AI mentor (SSE stream)	Bearer
POST	/ai/summarize-note	Summarize note content	Bearer
Dashboard
Method	Endpoint	Purpose	Auth
GET	/dashboard/stats	Dashboard statistics	Bearer
GET	/dashboard/analytics	Analytics data	Bearer
Health
Method	Endpoint	Purpose	Auth
GET	/health	Health check	No
Roadmap
User authentication with JWT + refresh token rotation
OAuth integration (Google, GitHub)
Email verification & password reset
Task CRUD with subtasks, recurring, priorities
Markdown notes with categories, pin, favorite, search
AI-powered learning roadmap generation
AI mentor chat with SSE streaming and roadmap context
AI note summarization
Dashboard with aggregated stats
Analytics with bar, line, and heatmap charts
Responsive sidebar navigation
Input validation (Zod)
Rate limiting, Helmet, CORS security
In-memory MongoDB fallback for local development
Docker Compose for MongoDB
Deployment configs (Render + Vercel)
Unit and integration tests (Jest + Supertest)
End-to-end tests (Playwright / Cypress)
CI/CD pipeline (GitHub Actions)
Task and note pagination
Collaborative note editing
Future Improvements
Based on the current architecture, realistic next steps include:

Test Suite -- Add Jest + Supertest for API endpoints and React Testing Library for components.
Pagination -- Implement cursor-based or offset pagination for tasks and notes.
WebSocket Presence -- Add real-time collaboration indicators for shared workspaces.
File Attachments -- Allow image/file uploads to notes and tasks.
Mobile App -- Build a React Native companion app reusing the API.
Spaced Repetition -- Integrate flashcards or review scheduling into learning paths.
Team/Shared Workspaces -- Multi-user collaboration on roadmaps and tasks.
Browser Push Notifications -- Reminders for due tasks and learning streaks.
Public Roadmap Sharing -- Share learning paths as public profile pages.
Dark/Light Theme Toggle -- Full theme support (the User model already has a theme field).
Contributing
Contributions are welcome. Please follow these guidelines:

Fork the repository and create a feature branch.
Install dependencies: npm run install:all
Make your changes, ensuring existing lint rules pass: npm run lint (runs in both client/ and server/)
Format code: npm run format (runs Prettier)
Open a pull request with a clear description of the change.
Code Style
ESLint + Prettier configurations are included for both client/ and server/
Follow the existing patterns for controllers, services, and components
Keep secret keys out of source control
License
MIT

Built with React, Express, MongoDB, and OpenAI/Gemini.
