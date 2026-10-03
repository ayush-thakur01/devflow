import { z } from 'zod'

const generateRoadmapSchema = z.object({
  goal: z.string().min(3, 'Goal must be at least 3 characters long').trim(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('beginner'),
})

const updateLearningPathSchema = z.object({
  title: z.string().trim().optional(),
  description: z.string().optional(),
  status: z.enum(['not-started', 'in-progress', 'completed']).optional(),
  progress: z.number().min(0).max(100).optional(),
  modules: z.array(
    z.object({
      _id: z.string().optional(),
      title: z.string(),
      description: z.string().optional(),
      order: z.number().optional(),
      status: z.enum(['not-started', 'in-progress', 'completed']).optional(),
      topics: z.array(
        z.object({
          _id: z.string().optional(),
          title: z.string(),
          description: z.string().optional(),
          completed: z.boolean().optional(),
          priority: z.enum(['low', 'medium', 'high']).optional(),
          estimatedMinutes: z.number().optional(),
          resources: z.array(z.string()).optional(),
          notes: z.string().optional(),
        })
      ).optional(),
    })
  ).optional(),
})

export { generateRoadmapSchema, updateLearningPathSchema }
