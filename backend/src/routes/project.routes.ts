import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createProjectSchema, updateProjectSchema } from '../schemas/project.schema';
import { listProjects, getProject, createProject, updateProject, archiveProject } from '../services/project.service';

const router = Router();
router.use(authenticate);

router.get('/projects', async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { projects, total } = await listProjects(req.user!.userId, req.user!.role, page, limit);
    res.json({ data: { projects }, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

router.post('/projects', validate(createProjectSchema), async (req: AuthRequest, res, next) => {
  try {
    const project = await createProject(req.body, req.user!.userId);
    res.status(201).json({ data: { project } });
  } catch (err) { next(err); }
});

router.get('/projects/:id', async (req: AuthRequest, res, next) => {
  try {
    const project = await getProject(req.params.id, req.user!.userId, req.user!.role);
    if (!project) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
    res.json({ data: { project } });
  } catch (err) { next(err); }
});

router.put('/projects/:id', validate(updateProjectSchema), async (req: AuthRequest, res, next) => {
  try {
    const project = await getProject(req.params.id, req.user!.userId, req.user!.role);
    if (!project) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
    if (project.createdBy !== req.user!.userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Only creator or admin can edit' } });
    }
    const updated = await updateProject(req.params.id, req.body);
    res.json({ data: { project: updated } });
  } catch (err) { next(err); }
});

router.delete('/projects/:id', async (req: AuthRequest, res, next) => {
  try {
    const project = await getProject(req.params.id, req.user!.userId, req.user!.role);
    if (!project) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
    if (project.createdBy !== req.user!.userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Only creator or admin can archive' } });
    }
    await archiveProject(req.params.id);
    res.json({ data: { message: 'Project archived' } });
  } catch (err) { next(err); }
});

export default router;
