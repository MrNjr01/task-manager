import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginSchema, createUserSchema } from '../schemas/auth.schema';
import { authenticateUser, generateToken, createUser } from '../services/auth.service';
import { prisma } from '../prisma/client';

const router = Router();

router.post('/auth/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authenticateUser(email, password);
    if (!user) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }
    const token = generateToken(user.id, user.role);
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });
    res.json({ data: { user: { id: user.id, email: user.email, name: user.name, role: user.role } } });
  } catch (err) { next(err); }
});

router.post('/auth/register', validate(createUserSchema), authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Admin access required' } });
    }
    const { email, password, name, designation, department, role } = req.body;
    const user = await createUser(email, password, name, designation, department, role);
    res.status(201).json({ data: { user: { id: user.id, email: user.email, name: user.name, role: user.role } } });
  } catch (err) { next(err); }
});

router.post('/auth/logout', (_req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ data: { message: 'Logged out' } });
});

router.get('/auth/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, name: true, designation: true, department: true, profilePhoto: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    });
    if (!user) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    res.json({ data: { user } });
  } catch (err) { next(err); }
});

export default router;
