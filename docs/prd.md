# DevFlow — Product Requirements Document

## 1. Product Overview

**DevFlow** is a developer productivity platform that combines task management, note-taking, AI-generated learning roadmaps, and an AI mentorship chat into a single dashboard. It targets self-taught developers and bootcamp students who need structured learning paths and daily task tracking.

## 2. Goals

- Provide a unified workspace for tasks, notes, and learning paths
- Leverage AI (OpenAI/Gemini) to generate personalized roadmaps
- Offer an interactive AI mentor for contextual Q&A on roadmaps
- Track learning streaks, task completion, and productivity analytics

## 3. User Personas

| Persona | Needs |
|---------|-------|
| **Self-taught developer** | Structured curriculum, progress tracking, daily tasks |
| **Bootcamp student** | Note-taking, AI explanations, roadmap generation |
| **Hobbyist coder** | Lightweight task management, mentor for quick answers |

## 4. Features (MVP)

### 4.1 Authentication
- Email/password signup and login
- JWT access + refresh token rotation
- OAuth via Google and GitHub
- Email verification and password reset

### 4.2 Dashboard
- Aggregate stats: task counts, notes count, learning streak
- Quick action buttons (create task, note, generate roadmap)
- Recent activity feed

### 4.3 Tasks
- CRUD with types: daily, weekly, monthly, goal
- Status: pending, in-progress, completed
- Priority levels, due dates, subtasks, labels, categories
- Soft delete with restore capability
- Recurring task support (daily/weekly/monthly)

### 4.4 Notes
- Split-pane markdown editor (edit + preview)
- Categories, tags, pinning, favoriting
- AI-powered summarization
- Link tasks and roadmap topics to notes
- Full-text search by title and content
- Soft delete

### 4.5 Learning Paths
- AI-generated roadmaps from a goal + difficulty input
- Module/topic tree with progress tracking
- Manual creation and editing
- Topic completion toggling with auto-progress recalculation
- Resources and project links per topic

### 4.6 AI Mentor
- SSE-streamed chat using selected roadmap as context
- Supports OpenAI GPT-4o-mini and Google Gemini 2.0 Flash
- Markdown rendering for responses

### 4.7 Analytics
- Task completion trends
- Category distribution
- Streak history and productivity metrics

## 5. Non-Goals (v1)

- Real-time collaboration
- Mobile native apps (responsive web only)
- Offline-first support
- Third-party calendar integration

## 6. Success Metrics

- DAU / MAU (daily/monthly active users)
- Learning paths generated per user
- Task completion rate
- AI mentor messages per session
