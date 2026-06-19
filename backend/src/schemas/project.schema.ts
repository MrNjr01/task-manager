import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(5000).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(['active', 'archived']).optional(),
});
