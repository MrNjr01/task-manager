import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTaskSchema, updateTaskSchema, assignTaskSchema } from '../schemas/task.schema';
import { listTasks, getTask, createTask, updateTask, deleteTask, addAssignees, removeAssignee, redelegateTask, updateTaskStatus, getSubtasks } from '../services/task.service';

const router = Router();
router.use(authenticate);

router.get('/tasks', async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { tasks, total } = await listTasks(req.user!.userId, req.user!.role, req.query, page, limit);
    res.json({ data: { tasks }, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

router.post('/tasks', validate(createTaskSchema), async (req: AuthRequest, res, next) => {
  try {
    const task = await createTask(req.body, req.user!.userId);
    res.status(201).json({ data: { task } });
  } catch (err) { next(err); }
});

router.get('/tasks/:id', async (req: AuthRequest, res, next) => {
  try {
    const task = await getTask(req.params.id, req.user!.userId, req.user!.role);
    if (!task) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' } });
    res.json({ data: { task } });
  } catch (err) { next(err); }
});

router.put('/tasks/:id', validate(updateTaskSchema), async (req: AuthRequest, res, next) => {
  try {
    const task = await getTask(req.params.id, req.user!.userId, req.user!.role);
    if (!task) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' } });
    const updated = await updateTask(req.params.id, req.body);
    res.json({ data: { task: updated } });
  } catch (err) { next(err); }
});

router.delete('/tasks/:id', async (req: AuthRequest, res, next) => {
  try {
    const task = await getTask(req.params.id, req.user!.userId, req.user!.role);
    if (!task) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' } });
    if (task.createdBy !== req.user!.userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Only creator or admin can delete' } });
    }
    await deleteTask(req.params.id);
    res.json({ data: { message: 'Task deleted' } });
  } catch (err) { next(err); }
});

router.patch('/tasks/:id/status', async (req: AuthRequest, res, next) => {
  try {
    const { status } = req.body;
    if (!status || !['todo', 'in_progress', 'review', 'done'].includes(status)) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Valid status required' } });
    }
    const task = await updateTaskStatus(req.params.id, status);
    res.json({ data: { task } });
  } catch (err) { next(err); }
});

router.post('/tasks/:id/assign', validate(assignTaskSchema), async (req: AuthRequest, res, next) => {
  try {
    await addAssignees(req.params.id, req.body.userIds, req.user!.userId);
    const task = await getTask(req.params.id, req.user!.userId, req.user!.role);
    res.json({ data: { task } });
  } catch (err) { next(err); }
});

router.delete('/tasks/:id/assign/:userId', async (req: AuthRequest, res, next) => {
  try {
    await removeAssignee(req.params.id, req.params.userId);
    res.json({ data: { message: 'Assignee removed' } });
  } catch (err: any) {
    if (err.message === 'Cannot remove last assignee') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Cannot remove last assignee' } });
    }
    next(err);
  }
});

router.post('/tasks/:id/redelegate', async (req: AuthRequest, res, next) => {
  try {
    const { fromUserId, toUserId } = req.body;
    if (!fromUserId || !toUserId) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'fromUserId and toUserId required' } });
    }
    const task = await redelegateTask(req.params.id, fromUserId, toUserId, req.user!.userId);
    res.json({ data: { task } });
  } catch (err) { next(err); }
});

router.get('/tasks/:id/subtasks', async (req: AuthRequest, res, next) => {
  try {
    const subtasks = await getSubtasks(req.params.id, req.user!.userId, req.user!.role);
    res.json({ data: { subtasks } });
  } catch (err) { next(err); }
});

export default router;
