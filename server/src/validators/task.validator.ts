import { z } from 'zod'

const subtaskSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(1, 'Subtask title is required'),
  completed: z.boolean().optional().default(false),
})

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().optional().default(''),
  type: z.enum(['daily', 'weekly', 'monthly', 'goal']).optional().default('daily'),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  dueDate: z.string().datetime({ precision: 3, offset: true }).or(z.string().date()).optional().nullable(),
  labels: z.array(z.string()).optional().default([]),
  category: z.string().optional().default('General'),
  subtasks: z.array(subtaskSchema).optional().default([]),
  recurring: z.object({
    interval: z.enum(['daily', 'weekly', 'monthly', 'none']).optional().default('none'),
    endDate: z.string().datetime().optional().nullable(),
    count: z.number().int().positive().optional().nullable(),
  }).optional().default({ interval: 'none' }),
})

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').trim().optional(),
  description: z.string().optional(),
  type: z.enum(['daily', 'weekly', 'monthly', 'goal']).optional(),
  status: z.enum(['pending', 'in-progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().datetime({ precision: 3, offset: true }).or(z.string().date()).optional().nullable(),
  labels: z.array(z.string()).optional(),
  category: z.string().optional(),
  subtasks: z.array(subtaskSchema).optional(),
  recurring: z.object({
    interval: z.enum(['daily', 'weekly', 'monthly', 'none']).optional(),
    endDate: z.string().datetime().optional().nullable(),
    count: z.number().int().positive().optional().nullable(),
  }).optional(),
})

export { createTaskSchema, updateTaskSchema }
