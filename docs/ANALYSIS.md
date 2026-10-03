# DevFlow - Complete Codebase Analysis

## STEP 1: Dead Code Analysis

### Client-Side Dead Code

| Item | Location | Reason Unused | Safe to Remove? |
|------|----------|---------------|-----------------|
| `useRef` import | `NotesPage.jsx:1` | Imported but never called in component | Yes |
| `Square` icon import | `TasksPage.jsx:2` | Imported from lucide-react, never used in JSX | Yes |
| Root `package.json` lucide-react dep | `package.json:5` | Root package has no code; only client/server have their own deps | Yes |

### Server-Side Dead Code

| Item | Location | Reason Unused | Safe to Remove? |
|------|----------|---------------|-----------------|
| `getProfile` in user.controller.js | `user.controller.js:4-6` | Exact duplicate of `auth.controller.js` `getProfile` | Yes |
| `GET /users/profile` route | `user.routes.js:9` | Exact duplicate of `GET /auth/me` route | Yes |
| `totalCompleted` variable | `dashboard.controller.js:193` | Assigned but never read; `completedTasks` const (line 177) is used instead | Yes |
| `completedTasks()` function | `dashboard.controller.js:194-196` | Duplicates `completedTasks` const at line 177; assigned result is unused | Yes |
| Duplicated `createAccessToken` | `passport.js:8` & `auth.controller.js:20-22` | Same logic in two files | Consolidate |
| Duplicated `createRefreshToken` | `passport.js:9` & `auth.controller.js:24-26` | Same logic in two files | Consolidate |
| Duplicated `hashToken` | `passport.js:10` & `auth.controller.js:28-30` | Same logic in two files | Consolidate |
| `LearningPath.deleteLearningPath` | `learningPath.controller.js:164-167` | Manually sets isDeleted/deletedAt instead of using model's `softDelete()` method (inconsistent) | Yes, use softDelete() |

### Duplicate Logic (Not Dead But Redundant)

| Pattern | Files | Issue |
|---------|-------|-------|
| Token creation helpers | `auth.controller.js`, `passport.js` | 3 identical functions duplicated |
| Optimistic UI update + fallback re-fetch | `TasksPage.jsx`, `NotesPage.jsx`, `LearningPathsPage.jsx` | Same pattern repeated in every page with no shared hook |
| Error state management | All page components | Same `useState('')` + `setError()` pattern repeated |
| Loading state management | All page components | Same `useState(true)` + `setLoading()` pattern repeated |

---

## STEP 2: API Layer Analysis

### Complete API Endpoint Map

| Endpoint | Method | Request Body | Response | Auth | Called From | Feature |
|----------|--------|-------------|----------|------|-------------|---------|
| `/api/v1/health` | GET | - | `{ uptime, environment }` | No | - | Health Check |
| `/api/v1/auth/signup` | POST | `{ username, email, password, firstName?, lastName? }` | `{ user, accessToken }` | No | `SignupPage.jsx` | Registration |
| `/api/v1/auth/login` | POST | `{ email, password }` | `{ user, token }` | No | `LoginPage.jsx` | Login |
| `/api/v1/auth/refresh` | POST | cookie: refreshToken | `{ user, accessToken }` | Cookie | Auto (interceptor) | Token Refresh |
| `/api/v1/auth/logout` | POST | - | null | No | `DashboardLayout.jsx` | Logout |
| `/api/v1/auth/me` | GET | - | `{ user }` | Bearer | Not used (duplicated) | Get Profile |
| `/api/v1/auth/verify-email` | GET | query: token | null | No | - | Email Verify |
| `/api/v1/auth/resend-verification` | POST | - | null | Bearer | - | Resend Verify |
| `/api/v1/auth/forgot-password` | POST | `{ email }` | null | No | - | Forgot Password |
| `/api/v1/auth/reset-password` | POST | `{ token, password }` | null | No | - | Reset Password |
| `/api/v1/users/profile` | GET | - | `{ user }` | Bearer | Not used (duplicate) | Get Profile |
| `/api/v1/users/profile` | PUT | `{ firstName?, lastName?, ... }` | `{ user }` | Bearer | Not used | Update Profile |
| `/api/v1/tasks` | GET | query: type, status, priority, category | `{ tasks }` | Bearer | `TasksPage.jsx` | List Tasks |
| `/api/v1/tasks` | POST | `{ title, description, type, ... }` | `{ task }` | Bearer | `TasksPage.jsx` | Create Task |
| `/api/v1/tasks/:id` | PUT | `{ title?, status?, ... }` | `{ task }` | Bearer | `TasksPage.jsx` | Update Task |
| `/api/v1/tasks/:id` | DELETE | - | null | Bearer | `TasksPage.jsx` | Delete Task |
| `/api/v1/notes` | GET | query: category, pinned, favorite, search | `{ notes }` | Bearer | `NotesPage.jsx` | List Notes |
| `/api/v1/notes` | POST | `{ title, content, category, tags }` | `{ note }` | Bearer | `NotesPage.jsx` | Create Note |
| `/api/v1/notes/:id` | PUT | `{ title?, content?, ... }` | `{ note }` | Bearer | `NotesPage.jsx` | Update Note |
| `/api/v1/notes/:id` | DELETE | - | null | Bearer | `NotesPage.jsx` | Delete Note |
| `/api/v1/learning-paths` | GET | - | `{ learningPaths }` | Bearer | `LearningPathsPage.jsx`, `MentorPage.jsx` | List Paths |
| `/api/v1/learning-paths/:id` | GET | - | `{ learningPath }` | Bearer | Not used from frontend | Get Path |
| `/api/v1/learning-paths` | POST | `{ title, description, ... }` | `{ learningPath }` | Bearer | Not used from frontend | Create Path |
| `/api/v1/learning-paths/generate` | POST | `{ goal, difficulty }` | `{ learningPath }` | Bearer | `LearningPathsPage.jsx` | AI Generate |
| `/api/v1/learning-paths/:id` | PUT | `{ modules? }` | `{ learningPath }` | Bearer | `LearningPathsPage.jsx` | Update Path |
| `/api/v1/learning-paths/:id` | DELETE | - | null | Bearer | `LearningPathsPage.jsx` | Delete Path |
| `/api/v1/ai/mentor` | POST | `{ question, history?, roadmapId? }` | `{ answer }` | Bearer | Not used (stream used instead) | AI Mentor |
| `/api/v1/ai/mentor/stream` | POST | `{ question, history?, roadmapId? }` | SSE stream | Bearer | `MentorPage.jsx` | AI Mentor Stream |
| `/api/v1/ai/summarize-note` | POST | `{ content }` | `{ summary }` | Bearer | `NotesPage.jsx` | AI Summarize |
| `/api/v1/dashboard/stats` | GET | - | `{ stats }` | Bearer | `DashboardPage.jsx` | Dashboard Stats |
| `/api/v1/dashboard/analytics` | GET | - | `{ analytics }` | Bearer | `AnalyticsPage.jsx` | Analytics |

### Frontend API Calls Map

| Page | Calls | Endpoints |
|------|-------|-----------|
| `LoginPage.jsx` | 1 | POST `/auth/login` |
| `SignupPage.jsx` | 1 | POST `/auth/signup` |
| `DashboardPage.jsx` | 1 | GET `/dashboard/stats` |
| `TasksPage.jsx` | 4 | GET/POST/PUT/DELETE `/tasks` |
| `NotesPage.jsx` | 5 | GET/POST/PUT/DELETE `/notes`, POST `/ai/summarize-note` |
| `LearningPathsPage.jsx` | 4 | GET/POST/PUT/DELETE `/learning-paths`, POST `/learning-paths/generate` |
| `MentorPage.jsx` | 2 | GET `/learning-paths`, POST `/ai/mentor/stream` |
| `AnalyticsPage.jsx` | 1 | GET `/dashboard/analytics` |
| `DashboardLayout.jsx` | 1 | POST `/auth/logout` |

---

## STEP 3: Feature Activity Diagrams

### Authentication Flow
```
User → LoginPage/SignupPage → handleSubmit() → api.post('/auth/login') → Express Router → validate() middleware → AuthController.login() → authService.authenticateUser() → bcrypt.compare() → User.findOne() → MongoDB → createAccessToken() + createRefreshToken() → setRefreshToken() → User.findByIdAndUpdate() → cookie (refreshToken) + { user, token } → Frontend → Zustand.setCredentials() → localStorage → navigate('/dashboard')
```

### Task CRUD Flow
```
User → TasksPage → fetchTasks() → api.get('/tasks') → Express Router → authMiddleware → TaskController.getTasks() → Task.find({ userId }) → MongoDB → Response → setTasks() → Render

User → TaskForm → handleSubmit() → api.post('/tasks') → validate(createTaskSchema) → TaskController.createTask() → new Task().save() → MongoDB → Response → Optimistic UI update

User → Checkbox → handleToggleComplete() → Optimistic UI → api.put('/tasks/:id') → TaskController.updateTask() → Object.assign(task, body) → task.save() → MongoDB → On error: revert via fetchTasks()

User → Delete → handleDeleteTask() → Optimistic UI → api.delete('/tasks/:id') → TaskController.deleteTask() → task.softDelete() → MongoDB → On error: revert via fetchTasks()
```

### Note CRUD Flow
```
User → NotesPage → fetchNotes() → api.get('/notes') → Express Router → authMiddleware → NoteController.getNotes() → Note.find({ userId }) → MongoDB → Response → setNotes() → setActiveNote() → Render

User → Editor → handleSaveNote() → api.put('/notes/:id') → NoteController.updateNote() → Object.assign(note, body) → note.save() → MongoDB

User → AI Summarize → handleSummarize() → api.post('/ai/summarize-note') → AIController.summarizeNote() → aiService.summarizeNote() → provider.summarizeNote() → OpenAI/Gemini → Response → setSummary() → Render
```

### Learning Path Flow
```
User → LearningPathsPage → fetchRoadmaps() → api.get('/learning-paths') → LearningPathController.getLearningPaths() → LearningPath.find() → MongoDB

User → Generate Form → handleGenerate() → api.post('/learning-paths/generate') → LearningPathController.generateRoadmap() → aiService.generateRoadmap() → provider.generateRoadmap() → OpenAI/Gemini → Mock fallback → new LearningPath().save() → MongoDB → setSelectedRoadmap()

User → Topic Toggle → handleToggleTopic() → Optimistic UI → api.put('/learning-paths/:id') → LearningPathController.updateLearningPath() → Recalculate progress → path.save() → MongoDB
```

### AI Mentor Chat Flow
```
User → MentorPage → handleSendMessage() → streamFromApi('/ai/mentor/stream', body, onChunk, onDone, onError) → fetch() with SSE → AIController.askMentorStream() → buildContext() (fetches LearningPath) → aiService.askMentorQuestionStream() → provider.askMentorQuestionStream() → OpenAI stream / Mock stream → SSE chunks → onChunk() → setStreamingMessage() → onDone() → setMessages() → Render
```

### Dashboard Stats Flow
```
User → DashboardPage → fetchDashboardStats() → api.get('/dashboard/stats') → DashboardController.getDashboardStats() → Multiple MongoDB queries (Task.countDocuments, Note.countDocuments, LearningPath.findOne, Task.find) → Aggregate stats → Response → setStats() → Render
```

---

## STEP 4: Component Tree

### App Shell
```
<App>
  <BrowserRouter>
    <AppRoutes>
      <Routes>
        /login → <LoginPage />
        /signup → <SignupPage />
        /dashboard → <ProtectedRoute> → <DashboardLayout> → <DashboardPage />
        /tasks → <ProtectedRoute> → <DashboardLayout> → <TasksPage>
          <TaskForm /> (modal)
        /notes → <ProtectedRoute> → <DashboardLayout> → <NotesPage>
          <MarkdownRenderer />
        /roadmaps → <ProtectedRoute> → <DashboardLayout> → <LearningPathsPage>
          <RoadmapViewer /> (conditional)
        /mentor → <ProtectedRoute> → <DashboardLayout> → <MentorPage>
          <MarkdownRenderer />
        /analytics → <ProtectedRoute> → <DashboardLayout> → <AnalyticsPage>
          <StatCard /> (reused 4x)
        * → <NotFoundPage />
      </Routes>
    </AppRoutes>
  </BrowserRouter>
</App>
```

### DashboardLayout
```
<DashboardLayout>
  <aside> (desktop sidebar)
    <SidebarContent>
      Logo + Brand
      <nav> → navItems.map → <Link> per item
      User Info Card
      <button> Logout
  </aside>
  <header> (mobile only)
    Logo + Hamburger Toggle
  </header>
  {mobileOpen && (
    <div> Overlay + <aside> <SidebarContent /> </aside>
  )}
  <main> → {children}
</DashboardLayout>
```

---

## STEP 5: Folder Documentation

### Client Structure
```
client/src/
├── main.jsx              # Entry point, renders <App /> into DOM
├── App.jsx               # BrowserRouter wrapper
├── styles/
│   └── global.css        # Tailwind directives + dark theme base styles
├── store/
│   └── authStore.js      # Zustand auth state (token, user) with localStorage persistence
├── services/
│   └── api.js            # Axios instance + auth interceptor + SSE streaming helper
├── layouts/
│   └── DashboardLayout.jsx  # Sidebar + mobile drawer + page content wrapper
├── routes/
│   ├── AppRoutes.jsx     # All route definitions
│   └── ProtectedRoute.jsx   # Auth guard (redirects to /login if no token)
├── pages/
│   ├── LoginPage.jsx         # Email/password login form
│   ├── SignupPage.jsx        # Registration form
│   ├── DashboardPage.jsx     # Stats overview + quick actions + activity feed
│   ├── TasksPage.jsx         # Task CRUD with filters
│   ├── NotesPage.jsx         # Split-pane markdown editor
│   ├── LearningPathsPage.jsx # AI roadmap generator + list
│   ├── MentorPage.jsx        # AI mentorship chat with SSE streaming
│   ├── AnalyticsPage.jsx     # Charts and analytics
│   └── NotFoundPage.jsx      # 404 page
└── components/
    ├── TaskForm.jsx          # Modal form for task create/edit
    ├── RoadmapViewer.jsx     # Roadmap detail view with progress tracking
    └── MarkdownRenderer.jsx  # ReactMarkdown wrapper
```

### Server Structure
```
server/
├── server.js                # Entry: loads env, connects DB, starts Express
├── src/
│   ├── app.js               # Express app: middleware stack + route mounting
│   ├── config/
│   │   ├── db.js            # MongoDB connection with in-memory fallback
│   │   ├── env.js           # Zod-validated environment variables
│   │   └── passport.js      # Google + GitHub OAuth strategy setup
│   ├── models/
│   │   ├── User.js          # User schema (auth, profile, OAuth)
│   │   ├── Task.js          # Task schema with subtasks, recurring, soft delete
│   │   ├── Note.js          # Note schema with tags, pin, favorite, soft delete
│   │   └── LearningPath.js  # Learning path schema with nested modules/topics
│   ├── controllers/
│   │   ├── auth.controller.js          # Signup, login, refresh, logout, OAuth, email verify, password reset
│   │   ├── user.controller.js          # Profile get/update
│   │   ├── task.controller.js          # Task CRUD
│   │   ├── note.controller.js          # Note CRUD
│   │   ├── learningPath.controller.js  # Learning path CRUD + AI generation
│   │   ├── ai.controller.js            # AI mentor + summarize endpoints
│   │   └── dashboard.controller.js     # Stats + analytics aggregation
│   ├── routes/
│   │   ├── auth.routes.js              # Auth endpoints
│   │   ├── user.routes.js              # User profile endpoints
│   │   ├── task.routes.js              # Task CRUD endpoints
│   │   ├── note.routes.js              # Note CRUD endpoints
│   │   ├── learningPath.routes.js      # Learning path endpoints
│   │   ├── ai.routes.js                # AI endpoints
│   │   └── dashboard.routes.js         # Dashboard endpoints
│   ├── services/
│   │   ├── auth.service.js             # User creation, auth, token management
│   │   ├── user.service.js             # Profile updates
│   │   ├── email.service.js            # Nodemailer with Ethereal fallback
│   │   ├── ai.service.js               # AI provider orchestrator
│   │   └── ai/
│   │       ├── aiProvider.js           # Abstract base class + mock generators
│   │       ├── openai.provider.js      # OpenAI GPT-4o-mini implementation
│   │       └── gemini.provider.js      # Google Gemini implementation
│   ├── middleware/
│   │   ├── auth.middleware.js          # JWT Bearer token verification
│   │   ├── error.middleware.js         # Global error handler
│   │   ├── rateLimit.middleware.js     # 120 req/15min IP limiter
│   │   ├── response.middleware.js      # res.success() helper
│   │   ├── requestId.middleware.js     # UUID request tracking
│   │   ├── notFound.middleware.js      # 404 handler
│   │   └── validate.middleware.js      # Zod schema validation
│   ├── validators/
│   │   ├── auth.validator.js           # signup, login, forgot/reset password schemas
│   │   ├── task.validator.js           # create/update task schemas
│   │   ├── note.validator.js           # create/update note schemas
│   │   ├── learningPath.validator.js   # generate roadmap, update path schemas
│   │   └── user.validator.js           # update profile schema
│   └── utils/
│       ├── logger.js                   # Winston logger
│       └── ApiError.js                 # Custom error class with statusCode
```

---

## STEP 6: Function Call Graphs

### Authentication
```
LoginPage.handleSubmit()
  → api.post('/auth/login', form)
    → Express: POST /api/v1/auth/login
      → validate(loginSchema)
      → authController.login()
        → authService.authenticateUser({ email, password })
          → User.findOne({ email }).select('+password')
          → bcrypt.compare(password, user.password)
        → createAccessToken(user._id) → jwt.sign()
        → createRefreshToken() → crypto.randomBytes()
        → authService.setRefreshToken(userId, hash) → User.findByIdAndUpdate()
        → user.save() (lastLogin)
        → sendTokenResponse() → res.cookie() + res.success()
  → response.data.data → { user, token }
  → useAuthStore.setCredentials(user, token)
  → navigate('/dashboard')
```

### Task Toggle Complete
```
TasksPage.handleToggleComplete(task)
  → Optimistic UI update: setTasks(prev => prev.map(...))
  → api.put(`/tasks/${task._id}`, { status: updatedStatus })
    → Express: PUT /api/v1/tasks/:id
      → validate(updateTaskSchema)
      → taskController.updateTask()
        → Task.findOne({ _id, userId, isDeleted: false })
        → Object.assign(task, req.body)
        → Subtask completion logic
        → task.save()
  → On error: fetchTasks() (revert)
```

### AI Mentor Streaming
```
MentorPage.handleSendMessage(text)
  → setMessages(prev => [...prev, userMsg])
  → streamFromApi('/ai/mentor/stream', body, onChunk, onDone, onError)
    → fetch(`${baseURL}/ai/mentor/stream`, { method: 'POST', headers, body })
      → Express: POST /api/v1/ai/mentor/stream
        → aiController.askMentorStream()
          → buildContext(req, roadmapId) → LearningPath.findOne()
          → res.setHeader('Content-Type', 'text/event-stream')
          → aiService.askMentorQuestionStream(question, context)
            → provider.askMentorQuestionStream()
              → OpenAI: client.chat.completions.create({ stream: true })
              → for await (chunk of stream) → yield content
    → onChunk(chunk) → setStreamingMessage(prev + chunk)
    → onDone() → setMessages(prev => [...prev, assistantMsg])
```

---

## STEP 7: State Flow

### Global State (Zustand)
```
useAuthStore (persisted to localStorage under 'devflow-auth')
  ├── token: string | null
  ├── user: User | null
  ├── setCredentials(user, token) → sets both
  └── logout() → clears both
```

### Component State (Local useState)

**LoginPage/SignupPage:**
- `form` - form field values
- `error` - error message string
- `loading` - boolean

**DashboardPage:**
- `stats` - fetched dashboard statistics object
- `loading` - boolean
- `error` - error message string

**TasksPage:**
- `tasks` - array of task objects
- `loading` / `error` - standard loading states
- `activeTab` - filter: 'all' | 'daily' | 'weekly' | 'monthly' | 'goal'
- `statusFilter` - filter: 'all' | 'pending' | 'completed'
- `isModalOpen` / `editingTask` - modal state

**NotesPage:**
- `notes` - array of note objects
- `activeNote` - currently selected note
- `loading` / `error` - standard states
- `search` - search query string
- `selectedCategory` - category filter
- `editorMode` - 'edit' | 'preview'
- `summarizing` / `summary` - AI summarize state

**LearningPathsPage:**
- `roadmaps` - array of learning path objects
- `selectedRoadmap` - currently viewed roadmap
- `loading` / `generating` / `error` - states
- `goal` / `difficulty` - generation form inputs

**MentorPage:**
- `messages` - chat history array
- `input` - current input text
- `loading` - boolean
- `error` - error message
- `streamingMessage` - current SSE streaming content
- `activeRoadmap` - roadmap context for AI

**AnalyticsPage:**
- `analytics` - fetched analytics data
- `loading` - boolean

### Data Flow Summary
```
User Action → Component setState → API call → Express → MongoDB → Response → setState → Re-render
```
No external state management (Redux, Context, TanStack Query) is used. All server state is managed locally in each component via useState.

---

## STEP 8: Dependency Analysis

### Issues Found

1. **Duplicated Token Helpers (auth.controller.js + passport.js)**
   - `createAccessToken`, `createRefreshToken`, `hashToken` exist in both files
   - **Fix**: Extract to `utils/token.js`

2. **Duplicated Profile Endpoint**
   - `GET /auth/me` and `GET /users/profile` do the same thing
   - **Fix**: Remove `GET /users/profile` and `user.controller.js` `getProfile`

3. **No Shared Custom Hooks**
   - Every page reimplements `useState(true)` for loading, `useState('')` for error
   - Every page reimplements optimistic update + error revert pattern
   - **Fix**: Extract `useAsyncOperation` hook and `useOptimisticUpdate` hook

4. **Dashboard Controller Bug**
   - `getAnalytics()` has unused `totalCompleted` variable and redundant `completedTasks()` function declaration
   - **Fix**: Remove dead code

5. **Inconsistent Soft Delete**
   - `LearningPath.deleteLearningPath` manually sets `isDeleted`/`deletedAt` instead of using `softDelete()`
   - **Fix**: Use model's `softDelete()` method

6. **API Client `getToken()` Duplication**
   - `services/api.js` has both an interceptor (reads localStorage) and a standalone `getToken()` function (also reads localStorage)
   - **Fix**: Extract shared `getToken()` and reuse in interceptor

7. **No Error Boundary**
   - No React Error Boundary exists for graceful error handling
   - **Fix**: Add ErrorBoundary component

8. **Root package.json**
   - Has `lucide-react` dependency with no scripts or code
   - **Fix**: Remove unused dependency

---

## STEP 9: Proposed Folder Structure

### Current → Proposed Changes

```
client/src/
├── main.jsx                    (keep)
├── App.jsx                     (keep)
├── styles/global.css           (keep)
├── store/
│   └── authStore.js            (keep)
├── services/
│   └── api.js                  (keep, minor cleanup)
├── hooks/                      (NEW)
│   ├── useApiCall.js           (NEW: shared loading/error/data pattern)
│   └── useOptimisticUpdate.js  (NEW: shared optimistic update pattern)
├── components/
│   ├── ui/                     (NEW: reusable UI primitives)
│   │   └── ErrorBoundary.jsx   (NEW)
│   ├── TaskForm.jsx            (keep)
│   ├── RoadmapViewer.jsx       (keep)
│   └── MarkdownRenderer.jsx    (keep)
├── layouts/
│   └── DashboardLayout.jsx     (keep)
├── routes/
│   ├── AppRoutes.jsx           (keep)
│   └── ProtectedRoute.jsx      (keep)
└── pages/
    ├── LoginPage.jsx           (keep)
    ├── SignupPage.jsx          (keep)
    ├── DashboardPage.jsx       (keep)
    ├── TasksPage.jsx           (keep)
    ├── NotesPage.jsx           (keep)
    ├── LearningPathsPage.jsx   (keep)
    ├── MentorPage.jsx          (keep)
    ├── AnalyticsPage.jsx       (keep)
    └── NotFoundPage.jsx        (keep)

server/src/
├── app.js                      (keep)
├── config/                     (keep as-is)
├── models/                     (keep as-is)
├── controllers/                (keep, minor cleanup)
├── routes/                     (keep, remove user.routes duplication)
├── services/                   (keep as-is)
├── middleware/                  (keep as-is)
├── validators/                 (keep as-is)
└── utils/
    ├── logger.js               (keep)
    ├── ApiError.js              (keep)
    └── token.js                (NEW: consolidated token helpers)
```

### Summary of Changes
- Extract `utils/token.js` for shared token helpers (server)
- Remove `GET /users/profile` route and controller method (server)
- Remove dead code from `dashboard.controller.js` (server)
- Fix `learningPath.controller.js` to use `softDelete()` (server)
- Add `hooks/useApiCall.js` and `hooks/useOptimisticUpdate.js` (client)
- Add `components/ui/ErrorBoundary.jsx` (client)
- Remove unused imports from pages (client)
- Remove root `lucide-react` dependency

---

## STEP 10: Technical Debt

| Priority | Issue | Location | Impact |
|----------|-------|----------|--------|
| High | Duplicated token helpers across files | `auth.controller.js`, `passport.js` | Maintenance burden, bug risk |
| High | Duplicated profile endpoints | `auth.routes.js`, `user.routes.js` | Dead code, confusion |
| Medium | No custom hooks for repeated patterns | All page components | Code duplication |
| Medium | Dashboard controller dead code | `dashboard.controller.js` | Confusing, unused computation |
| Medium | Inconsistent soft delete usage | `learningPath.controller.js` | Pattern inconsistency |
| Low | Missing Error Boundary | Client app | Uncaught errors crash UI |
| Low | Unused imports in pages | `NotesPage.jsx`, `TasksPage.jsx` | Minor clutter |
| Low | Root package.json unused dep | Root `package.json` | Unused dependency |
