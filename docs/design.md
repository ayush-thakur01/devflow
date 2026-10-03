# DevFlow — Design Decisions

## 1. Architecture

- **Monorepo** with `client/` (React SPA) and `server/` (Express API)
- No shared packages — each directory has its own `package.json`
- RESTful API with SSE for AI streaming (no WebSocket needed)

## 2. Frontend

### Framework & Tooling
| Choice | Rationale |
|--------|-----------|
| React 18 + Vite | Fast dev server, ESM-native bundling |
| React Router v6 | Standard SPA routing with layout routes |
| Tailwind CSS | Utility-first, rapid prototyping, dark theme via class |
| Zustand | Minimal boilerplate auth state, localStorage persistence |
| Axios | Interceptors for token injection + refresh queue |
| Lucide React | Lightweight icon set, tree-shakeable |

### State Management
- **Global**: Zustand store for auth only (token + user)
- **Local**: All server data in component `useState` — no React Query/SWR
- **Optimistic updates**: Immediate UI mutation + error revert via re-fetch

### Streaming
- `fetch()` with `ReadableStream` reader for SSE — no EventSource (POST required)
- Custom `streamFromApi` helper in `api.ts`
- Line-by-line SSE parsing with buffer for partial frames

## 3. Backend

### Framework & Tooling
| Choice | Rationale |
|--------|-----------|
| Express 4 | Mature, minimal, extensive middleware |
| Mongoose 9 | MongoDB ODM with schema validation, middleware |
| Zod | Runtime env validation + request body validation |
| Passport | OAuth strategies (Google, GitHub) |
| JWT (jsonwebtoken) | Stateless access tokens (15m expiry) |
| crypto.randomBytes | Refresh tokens (opaque, hashed in DB) |
| Winston | Structured JSON logging |
| Nodemailer / Resend | Transactional email with Ethereal fallback |

### Middleware Stack (order matters)
```
requestId → passport → helmet → json/urlencoded → compression
→ cookieParser → cors → rateLimit → morgan → responseHelper → routes
→ notFound → errorHandler
```

### AI Providers
- **OpenAI**: `gpt-4o-mini` via streaming chat completions
- **Gemini**: `gemini-2.0-flash` via Google AI SDK
- **Mock fallback**: hardcoded responses when no API key configured
- Provider selected by `AI_PROVIDER` env var

## 4. Database (MongoDB)

- Soft delete pattern (`isDeleted` + `deletedAt`) on all entities
- `toJSON()` on User strips sensitive fields
- Compound indexes on `userId + status` for common queries
- `timestamps: true` on all schemas

## 5. Security

- Access tokens: 15m, stored in Zustand (localStorage)
- Refresh tokens: opaque 64-byte random, SHA-256 hashed in DB
- Rate limiting: 120 requests per 15 min per IP
- Helmet security headers
- CORS restricted to `FRONTEND_URL`
- Passwords hashed with bcryptjs (12 rounds)
- Zod validation on all inputs

## 6. Error Handling

- Custom `ApiError` class with `statusCode` and `isOperational`
- `express-async-errors` catches async rejections
- Global error middleware returns `{ success: false, error: { message } }`
- Unhandled promise rejections logged via Winston

## 7. Testing Strategy

- Vitest for unit + integration tests
- mongodb-memory-server for in-memory DB in tests
- Supertest for HTTP integration tests
- No dedicated E2E tests (MVP phase)

## 8. Key Technical Debt Items

| Issue | Plan |
|-------|------|
| No shared hooks (loading/error/optimistic) | Extract `useApiCall`, `useOptimisticUpdate` |
| Duplicated token helpers | Consolidate into `utils/token.js` |
| Duplicated profile endpoint | Remove `GET /users/profile` |
| No Error Boundary | Add `ErrorBoundary` component |
| Root `lucide-react` dep | Remove unused dependency |
