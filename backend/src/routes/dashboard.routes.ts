import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getMyKpis, getDelegatedKpis } from '../services/dashboard.service';

const router = Router();
router.use(authenticate);

router.get('/dashboard', async (req: AuthRequest, res, next) => {
  try {
    const kpis = await getMyKpis(req.user!.userId);
    res.json({ data: kpis });
  } catch (err) { next(err); }
});

router.get('/dashboard/delegated', async (req: AuthRequest, res, next) => {
  try {
    const kpis = await getDelegatedKpis(req.user!.userId);
    res.json({ data: kpis });
  } catch (err) { next(err); }
});

export default router;
