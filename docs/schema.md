# DevFlow — Database Schema (MongoDB / Mongoose)

## User

| Field | Type | Constraints |
|-------|------|-------------|
| `_id` | ObjectId | auto |
| `username` | String | required, unique, trimmed |
| `email` | String | required, unique, lowercase, trimmed |
| `password` | String | required (stripped in `toJSON`) |
| `firstName` | String | default `''` |
| `lastName` | String | default `''` |
| `bio` | String | default `''` |
| `avatarUrl` | String | default `''` |
| `skills` | [String] | default `[]` |
| `interests` | [String] | default `[]` |
| `learningGoals` | [String] | default `[]` |
| `theme` | String | enum: `light`, `dark` — default `light` |
| `streak` | Number | default `0` |
| `lastLogin` | Date | |
| `isEmailVerified` | Boolean | default `false` |
| `emailVerificationToken` | String | |
| `emailVerificationExpires` | Date | |
| `passwordResetToken` | String | |
| `passwordResetExpires` | Date | |
| `refreshTokenHash` | String | |
| `providers.google` | String | OAuth Google ID |
| `providers.github` | String | OAuth GitHub ID |
| `createdAt` | Date | auto (timestamps) |
| `updatedAt` | Date | auto (timestamps) |

**Indexes:** `username` (unique), `email` (unique)

---

## Task

| Field | Type | Constraints |
|-------|------|-------------|
| `_id` | ObjectId | auto |
| `userId` | ObjectId | ref: User, required |
| `title` | String | required, trimmed |
| `description` | String | default `''` |
| `type` | String | enum: `daily`, `weekly`, `monthly`, `goal` — default `daily` |
| `status` | String | enum: `pending`, `in-progress`, `completed` — default `pending` |
| `priority` | String | enum: `low`, `medium`, `high` — default `medium` |
| `dueDate` | Date | |
| `labels` | [String] | default `[]` |
| `category` | String | default `'General'` |
| `completedAt` | Date | |
| `subtasks` | [Subtask] | embedded |
| `recurring` | Object | |
| `recurring.interval` | String | enum: `daily`, `weekly`, `monthly`, `none` |
| `recurring.endDate` | Date | |
| `recurring.count` | Number | |
| `metadata` | Mixed | |
| `isDeleted` | Boolean | default `false` |
| `deletedAt` | Date | |
| `createdAt` | Date | auto |
| `updatedAt` | Date | auto |

### Subtask (embedded)
| Field | Type | Constraints |
|-------|------|-------------|
| `title` | String | required, trimmed |
| `completed` | Boolean | default `false` |

**Indexes:** `{ userId: 1, status: 1, dueDate: 1 }`

---

## Note

| Field | Type | Constraints |
|-------|------|-------------|
| `_id` | ObjectId | auto |
| `userId` | ObjectId | ref: User, required |
| `title` | String | required, trimmed |
| `content` | String | default `''` (markdown) |
| `category` | String | default `'General'` |
| `tags` | [String] | default `[]` |
| `pinned` | Boolean | default `false` |
| `favorite` | Boolean | default `false` |
| `linkedTasks` | [ObjectId] | ref: Task |
| `linkedRoadmapTopics` | [LinkedTopic] | embedded |
| `linkedRoadmapTopics[].pathId` | ObjectId | ref: LearningPath |
| `linkedRoadmapTopics[].moduleTitle` | String | |
| `linkedRoadmapTopics[].topicTitle` | String | |
| `metadata` | Mixed | |
| `isDeleted` | Boolean | default `false` |
| `deletedAt` | Date | |
| `createdAt` | Date | auto |
| `updatedAt` | Date | auto |

**Indexes:** `{ userId: 1, category: 1, pinned: -1 }`

---

## LearningPath

| Field | Type | Constraints |
|-------|------|-------------|
| `_id` | ObjectId | auto |
| `userId` | ObjectId | ref: User, required |
| `title` | String | required, trimmed |
| `description` | String | default `''` |
| `goal` | String | default `''` |
| `category` | String | default `'General'` |
| `difficulty` | String | enum: `beginner`, `intermediate`, `advanced` — default `beginner` |
| `estimatedHours` | Number | default `0` |
| `progress` | Number | min `0`, max `100`, default `0` |
| `status` | String | enum: `not-started`, `in-progress`, `completed` — default `not-started` |
| `streak` | Number | default `0` |
| `modules` | [Module] | embedded |
| `resources` | [String] | default `[]` |
| `projects` | [String] | default `[]` |
| `metadata` | Mixed | |
| `isDeleted` | Boolean | default `false` |
| `deletedAt` | Date | |
| `createdAt` | Date | auto |
| `updatedAt` | Date | auto |

### Module (embedded)
| Field | Type | Constraints |
|-------|------|-------------|
| `title` | String | required, trimmed |
| `description` | String | default `''` |
| `order` | Number | default `0` |
| `difficulty` | String | enum: `beginner`, `intermediate`, `advanced` — default `beginner` |
| `status` | String | enum: `not-started`, `in-progress`, `completed` — default `not-started` |
| `estimatedHours` | Number | default `0` |
| `topics` | [Topic] | embedded |

### Topic (embedded)
| Field | Type | Constraints |
|-------|------|-------------|
| `title` | String | required, trimmed |
| `description` | String | default `''` |
| `completed` | Boolean | default `false` |
| `priority` | String | enum: `low`, `medium`, `high` — default `medium` |
| `estimatedMinutes` | Number | default `0` |
| `resources` | [String] | default `[]` |
| `notes` | String | default `''` |

**Indexes:** `{ userId: 1, status: 1 }`, `{ userId: 1, title: 1 }`

---

## Relationships

```
User (1) ──< Task (N)           — userId foreign key
User (1) ──< Note (N)           — userId foreign key
User (1) ──< LearningPath (N)   — userId foreign key
Note (N) ──< Task (N)           — linkedTasks[] array of ObjectId refs
Note (N) ──< LearningPath (N)   — linkedRoadmapTopics[].pathId ref
```
