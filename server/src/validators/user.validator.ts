import { z } from 'zod'

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url('Avatar URL must be valid').optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  learningGoals: z.array(z.string()).optional(),
  theme: z.enum(['light', 'dark']).optional(),
})

export { updateProfileSchema }
