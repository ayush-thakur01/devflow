import { z } from 'zod'

const linkedTopicSchema = z.object({
  pathId: z.string(),
  moduleTitle: z.string(),
  topicTitle: z.string(),
})

const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  content: z.string().optional().default(''),
  category: z.string().optional().default('General'),
  tags: z.array(z.string()).optional().default([]),
  pinned: z.boolean().optional().default(false),
  favorite: z.boolean().optional().default(false),
  linkedTasks: z.array(z.string()).optional().default([]),
  linkedRoadmapTopics: z.array(linkedTopicSchema).optional().default([]),
})

const updateNoteSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').trim().optional(),
  content: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  pinned: z.boolean().optional(),
  favorite: z.boolean().optional(),
  linkedTasks: z.array(z.string()).optional(),
  linkedRoadmapTopics: z.array(linkedTopicSchema).optional(),
})

export { createNoteSchema, updateNoteSchema }
