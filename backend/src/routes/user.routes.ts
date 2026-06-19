import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { authenticate, AuthRequest, authorizeAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateUserSchema, userIdParamSchema } from '../schemas/user.schema';
import { listUsers, getUserById, updateUser, deactivateUser, activateUser, hardDeleteUser, uploadUserProfile } from '../services/user.service';

const router = Router();

const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.use(authenticate);

router.get('/users', authorizeAdmin, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { users, total } = await listUsers({
      department: req.query.department as string,
      isActive: req.query.active as string,
      search: req.query.search as string,
    }, page, limit);
    res.json({ data: { users }, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

// GET /api/users/active - returns only active users (for assignment)
router.get('/users/active', async (req, res, next) => {
  try {
    const { users, total } = await listUsers({ isActive: 'true' }, 1, 100);
    res.json({ data: { users }, pagination: { page: 1, limit: 100, total, pages: 1 } });
  } catch (err) { next(err); }
});

router.get('/users/:id', validate(userIdParamSchema, 'params'), async (req: AuthRequest, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    res.json({ data: { user } });
  } catch (err) { next(err); }
});

router.put('/users/:id', validate(userIdParamSchema, 'params'), validate(updateUserSchema), authorizeAdmin, async (req, res, next) => {
  try {
    const user = await updateUser(req.params.id, req.body);
    res.json({ data: { user } });
  } catch (err) { next(err); }
});

router.delete('/users/:id', validate(userIdParamSchema, 'params'), authorizeAdmin, async (req, res, next) => {
  try {
    if (req.query.hard === 'true') {
      await hardDeleteUser(req.params.id);
      res.json({ data: { message: 'User permanently deleted' } });
    } else {
      await deactivateUser(req.params.id);
      res.json({ data: { message: 'User deactivated' } });
    }
  } catch (err) { next(err); }
});

router.post('/users/:id/photo', validate(userIdParamSchema, 'params'), upload.single('photo'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'No file uploaded' } });
    const ext = path.extname(req.file.originalname);
    const newName = `${uuid()}${ext}`;
    const newPath = path.join(__dirname, '../../uploads', newName);
    fs.renameSync(req.file.path, newPath);
    await uploadUserProfile(req.params.id, `/uploads/${newName}`);
    res.json({ data: { profilePhoto: `/uploads/${newName}` } });
  } catch (err) { next(err); }
});

export default router;
