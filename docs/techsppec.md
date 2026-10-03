# DevFlow — Technical Specification

## 1. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser                           │
│  React SPA (Vite) → Tailwind CSS → Zustand Auth     │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP / SSE
                   ▼
┌─────────────────────────────────────────────────────┐
│              Express API (tsx watch)                 │
│  Middleware: helmet, cors, rateLimit, morgan, etc.   │
│  Routes: auth, tasks, notes, learning-paths, ai     │
│  Controllers → Services → Models (Mongoose)         │
└──────────────────┬──────────────────────────────────┘
                   │
          ┌────────┴────────┐
          ▼                  ▼
   ┌────────────┐    ┌──────────────┐
   │  MongoDB   │    │  AI Provider │
   │  (Mongoose)│    │  OpenAI/Gem  │
   └────────────┘    └──────────────┘
```

## 2. Tech Stack

### Client (`client/`)
| Layer | Technology |
|-------|-----------|
| Build | Vite 5 |
| UI | React 18, React Router 6 |
| Styling | Tailwind CSS 3, PostCSS |
| State | Zustand (localStorage persistence) |
| HTTP | Axios (interceptors, refresh queue) |
| Icons | Lucide React |
| Markdown | react-markdown |
| Lint | ESLint (Flat config) |
| TypeScript | tsconfig (strict mode) |

### Server (`server/`)
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js, tsx (TypeScript execution) |
| Framework | Express 4, express-async-errors |
| DB | Mongoose 9, MongoDB |
| Auth | JWT, bcryptjs, Passport (Google OAuth 2.0, GitHub OAuth) |
| AI | OpenAI SDK, Google Generative AI SDK |
| Email | Nodemailer, Resend SDK |
| Validation | Zod 4 |
| Logging | Winston |
| Testing | Vitest, Supertest, mongodb-memory-server |
| Lint | ESLint 10, Prettier |

## 3. API Specification

### Base URL: `/api/v1`

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | No | Create account |
| POST | `/auth/login` | No | Login |
| POST | `/auth/refresh` | Cookie | Refresh access token |
| POST | `/auth/logout` | No | Clear refresh cookie |
| GET | `/auth/verify-email` | No | Verify email (token query) |
| POST | `/auth/resend-verification` | Bearer | Resend verification email |
| POST | `/auth/forgot-password` | No | Send reset email |
| POST | `/auth/reset-password` | No | Reset password (token + new pw) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | List tasks (query: type, status, priority, category) |
| POST | `/tasks` | Create task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Soft-delete task |

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notes` | List notes (query: category, pinned, favorite, search) |
| POST | `/notes` | Create note |
| PUT | `/notes/:id` | Update note |
| DELETE | `/notes/:id` | Soft-delete note |

### Learning Paths
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/learning-paths` | List paths |
| GET | `/learning-paths/:id` | Get single path |
| POST | `/learning-paths` | Create manually |
| POST | `/learning-paths/generate` | AI-generate from goal + difficulty |
| PUT | `/learning-paths/:id` | Update (modules, topics, progress) |
| DELETE | `/learning-paths/:id` | Soft-delete |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/mentor` | Non-streaming mentor Q&A |
| POST | `/ai/mentor/stream` | SSE streaming mentor chat |
| POST | `/ai/summarize-note` | Summarize note content |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Aggregate stats (counts, streak, recent) |
| GET | `/dashboard/analytics` | Task trends, category breakdown |

## 4. SSE Protocol (AI Mentor Stream)

**Request:** `POST /api/v1/ai/mentor/stream`
```
{
  "question": "string",
  "history": [{ "role": "user"|"assistant", "content": "string" }],
  "roadmapId": "ObjectId (optional)"
}
```

**Response:** `text/event-stream`
```
data: {"content":"Hello"}
data: {"content":"! I'm"}
data: {"content":" your AI mentor."}
data: [DONE]
```

**Error:**
```
data: {"error":"Rate limit exceeded"}
```

**Client-side:** `fetch()` with `ReadableStream.getReader()` + line buffer.

## 5. Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Validation error",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

**Error codes:** 400 (validation), 401 (unauthorized), 403 (forbidden), 404 (not found), 429 (rate limit), 500 (server error).

## 6. Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment mode |
| `PORT` | No | `5000` | Server port |
| `MONGODB_URI` | **Yes** | — | MongoDB connection string |
| `JWT_SECRET` | **Yes** (min 10) | — | Signing key for access tokens |
| `FRONTEND_URL` | No | `http://localhost:5173` | CORS origin |
| `AI_PROVIDER` | No | `openai` | `openai` / `gemini` / `ollama` / `local` |
| `OPENAI_API_KEY` | Conditional | — | Required if AI_PROVIDER=openai |
| `GEMINI_API_KEY` | Conditional | — | Required if AI_PROVIDER=gemini |
| `SMTP_*` | No | — | SMTP or Resend for email |

## 7. Project Structure

```
client/src/
├── main.jsx                    # Entry
├── App.jsx                     # Router wrapper
├── styles/global.css           # Tailwind + dark theme
├── store/authStore.js          # Zustand
├── services/api.js             # Axios + SSE helper
├── layouts/DashboardLayout.jsx
├── routes/AppRoutes.jsx, ProtectedRoute.jsx
├── pages/ (Login, Signup, Dashboard, Tasks, Notes,
│           LearningPaths, Mentor, Analytics, NotFound)
└── components/ (TaskForm, RoadmapViewer, MarkdownRenderer)

server/
├── server.ts                   # Entry
├── src/
│   ├── app.js                  # Express setup
│   ├── config/ (db, env, passport)
│   ├── models/ (User, Task, Note, LearningPath)
│   ├── controllers/
│   ├── routes/
│   ├── services/ (auth, user, email, ai, ai/*provider)
│   ├── middleware/ (auth, error, rateLimit, response,
│   │               requestId, notFound, validate)
│   ├── validators/ (auth, task, note, learningPath, user)
│   └── utils/ (logger, ApiError)
```

## 8. Performance & Limits

- **Rate limit:** 120 requests / 15 min per IP
- **Access token expiry:** 15 minutes
- **Refresh token:** Opaque 64 bytes, single-use rotation
- **MongoDB indexes:** Compound on userId + frequent query fields
- **SSE:** No keepalive — client reconnects on error
- **AI timeout:** 30s default per provider call
