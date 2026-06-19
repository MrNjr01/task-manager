import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  designation: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  role: z.enum(['admin', 'member']).optional(),
  isActive: z.boolean().optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
});
