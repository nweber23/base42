import { Router, Request, Response } from 'express';
import { api42Service } from '../services/42api';
import { getCache } from '../services/cache';

const router = Router();

router.get('/active', async (req: Request, res: Response) => {
  const campusParam = (req.query.campus as string | undefined)?.toLowerCase() || 'heilbronn';
  let campusId: number | null = null;

  try {
    // Resolve campus ID dynamically (avoids wrong hardcoded IDs)
    campusId = await api42Service.resolveCampusId(campusParam);
    const result = await api42Service.getActivePeers(campusId);
    return res.json(result);
  } catch (error: any) {
    // Fallback to last cached dataset
    try {
      if (!campusId) {
        // Try to resolve again for cache key only; ignore errors
        campusId = await api42Service.resolveCampusId(campusParam).catch(() => null);
      }
      const cacheKey = campusId ? `peers:active:${campusId}` : '';
      const cached = campusId
        ? await getCache<{ count: number; peers: Array<{ login: string; host: string; begin_at: string }> }>(cacheKey)
        : null;
      if (cached) {
        return res.json({
          ...cached,
          stale: true,
        });
      }
    } catch (_) {
      // ignore cache fallback errors
    }
    return res.status(503).json({ error: 'Failed to fetch active peers' });
  }
});

export default router;