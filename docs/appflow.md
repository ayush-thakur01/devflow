# DevFlow — Application Flow

## 1. Entry & Auth Flow

```
User → Browser → /login or /signup
  ├── Login: email + password → POST /auth/login → JWT + refresh cookie → Zustand store → /dashboard
  ├── Signup: username, email, password → POST /auth/signup → auto-login → /dashboard
  ├── OAuth (Google/GitHub) → passport strategy → callback → JWT → /dashboard
  └── No token → ProtectedRoute redirects to /login
```

**Token Refresh:**
```
401 Response → Axios interceptor → POST /auth/refresh (cookie) → new access token → retry queue
Refresh fails → clear localStorage → redirect /login
```

## 2. Navigation

```
<App>
  <BrowserRouter>
    <AppRoutes>
      /login          → LoginPage
      /signup         → SignupPage
      /dashboard      → DashboardLayout → DashboardPage
      /tasks          → DashboardLayout → TasksPage
      /notes          → DashboardLayout → NotesPage
      /roadmaps       → DashboardLayout → LearningPathsPage
      /mentor         → DashboardLayout → MentorPage
      /analytics      → DashboardLayout → AnalyticsPage
      *               → NotFoundPage
    </AppRoutes>
  </BrowserRouter>
</App>
```

**DashboardLayout** provides: sidebar nav, mobile drawer, user menu, logout.

## 3. Data Flow Pattern

```
Component mount → useState(true) loading
  → fetchData() → api.get() → Express → MongoDB → response
  → setState(data) → loading=false → render

User action → Optimistic UI update
  → api.put/patch() → server response
  → On error: revert via re-fetch
```

## 4. Feature Flows

### Tasks
```
TasksPage mount → GET /tasks → render list
Filter tabs: all | daily | weekly | monthly | goal
Status filter: all | pending | completed
Create: TaskForm (modal) → POST /tasks → optimistic add
Toggle complete: PUT /tasks/:id → optimistic toggle
Delete: confirm → optimistic remove → DELETE /tasks/:id
```

### Notes
```
NotesPage mount → GET /notes → render sidebar list
Select note → setActiveNote → render MarkdownRenderer
Edit → onChange → auto-save debounce → PUT /notes/:id
AI Summarize → POST /ai/summarize-note → display summary
Search: local filter on title + content
```

### Learning Paths
```
LearningPathsPage mount → GET /learning-paths → render list
Generate: form (goal + difficulty) → POST /learning-paths/generate
  → AI generates modules/topics → save to DB → display
Toggle topic → PUT /learning-paths/:id → recalculate progress
Delete → confirm → DELETE /learning-paths/:id (softDelete)
```

### AI Mentor
```
MentorPage mount → GET /learning-paths → populate roadmap selector
Send message → POST /ai/mentor/stream (SSE)
  → fetch() with ReadableStream reader
  → onChunk → setStreamingMessage (incremental render)
  → onDone → append to messages[]
    → MarkdownRenderer displays response
```

### Dashboard Stats
```
DashboardPage mount → GET /dashboard/stats
  → Aggregate: task counts, notes count, recent tasks, streak
  → Render StatCard grid + recent activity list
```

### Analytics
```
AnalyticsPage mount → GET /dashboard/analytics
  → Task completion timeline, category breakdown, streaks
  → Render charts and metrics
```
