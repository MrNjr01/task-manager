import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  description: z.string().max(5000).optional(),
  projectId: z.string().uuid().optional(),
  parentTaskId: z.string().uuid().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']).optional().default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  startDate: z.string().datetime({ message: 'Start date must be ISO 8601' }),
  dueDate: z.string().datetime({ message: 'Due date must be ISO 8601' }),
  depType: z.enum(['none', 'sequential', 'parallel']).optional().default('none'),
  orderIndex: z.number().int().optional().default(0),
  assigneeIds: z.array(z.string().uuid()).min(1, 'At least one assignee is required'),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  depType: z.enum(['none', 'sequential', 'parallel']).optional(),
  orderIndex: z.number().int().optional(),
});

export const assignTaskSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1, 'At least one user ID required'),
});
