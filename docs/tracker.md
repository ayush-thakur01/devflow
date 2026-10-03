# DevFlow — Tracker

## Implementation Status

### Phase 1: Foundation (Complete)
- [x] Express app scaffold with middleware stack
- [x] MongoDB connection with Mongoose
- [x] Zod environment validation
- [x] User model + auth service (signup, login, refresh, logout)
- [x] JWT access + opaque refresh token rotation
- [x] OAuth Google + GitHub (Passport strategies)
- [x] Email service (Nodemailer + Resend + Ethereal fallback)
- [x] Rate limiting, Helmet, CORS, compression
- [x] Winston logger with request IDs
- [x] Global error handler + 404 handler
- [x] Zod request validation middleware
- [x] Custom response helper (`res.success()`)

### Phase 2: Core Features (Complete)
- [x] Task CRUD with soft delete, recurring, subtasks
- [x] Note CRUD with markdown editor, search, pin/favorite
- [x] Learning Path CRUD with module/topic tree
- [x] AI provider abstraction (OpenAI + Gemini + Mock)
- [x] AI roadmap generation from goal/difficulty
- [x] AI note summarization
- [x] AI mentor chat with SSE streaming
- [x] Dashboard stats aggregation
- [x] Analytics endpoint

### Phase 3: Frontend (Complete)
- [x] Login / Signup pages
- [x] ProtectedRoute auth guard
- [x] DashboardLayout with responsive sidebar
- [x] DashboardPage with stats cards + activity feed
- [x] TasksPage with CRUD, filters, optimistic updates
- [x] NotesPage with split-pane editor, search, AI summarize
- [x] LearningPathsPage with generation + topic toggle
- [x] MentorPage with SSE chat + markdown rendering
- [x] AnalyticsPage with metrics display
- [x] NotFoundPage
- [x] Zustand auth store with localStorage persistence
- [x] Axios interceptor for token refresh with request queue

### Phase 4: Polish & Technical Debt (Pending)

**High Priority:**
- [ ] Extract duplicated token helpers into `utils/token.js`
- [ ] Remove duplicate `GET /users/profile` route + controller
- [ ] Fix dashboard controller dead code (unused `totalCompleted`)

**Medium Priority:**
- [ ] Extract shared hooks: `useApiCall`, `useOptimisticUpdate`
- [ ] Fix learningPath controller to use model `softDelete()` method

**Low Priority:**
- [ ] Add ErrorBoundary component
- [ ] Remove unused imports (NotesPage, TasksPage)
- [ ] Remove root `package.json` `lucide-react` dependency
- [ ] Consolidate `getToken()` in api.ts interceptor

### Phase 5: Future Features (Not Started)
- [ ] Email verification flow (UI + resend)
- [ ] Password reset flow (UI)
- [ ] Note linking to tasks/roadmaps from UI
- [ ] Recurring task auto-generation
- [ ] Task drag-and-drop reordering
- [ ] Learning path sharing / community roadmaps
- [ ] Dark/light theme toggle (model exists, no UI)
- [ ] Export notes to PDF/Markdown
- [ ] Mobile app (React Native)

## Known Issues

| Issue | Severity | Status |
|-------|----------|--------|
| Duplicated token helpers in passport.js + auth.controller.js | High | To Do |
| Duplicated GET profile endpoint | High | To Do |
| No shared hooks for loading/error/optimistic patterns | Medium | To Do |
| Dashboard controller dead code | Medium | To Do |
| Inconsistent soft delete in learningPath controller | Medium | To Do |
| No ErrorBoundary | Low | To Do |
| Unused imports in NotesPage, TasksPage | Low | To Do |
| Root package.json has orphaned dependency | Low | To Do |
