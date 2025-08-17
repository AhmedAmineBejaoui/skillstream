import { Request, Response, NextFunction } from 'express';

// AUDIT:Tech Stack -> simple caching

const CACHE_TTL = 60 * 1000;
const cache: Record<string, { expiry: number; data: any }> = {};

export function cacheMiddleware(req: Request, res: Response, next: NextFunction) {
  const key = req.method + req.originalUrl + JSON.stringify(req.query);
  const now = Date.now();
  const cached = cache[key];
  if (cached && cached.expiry > now) {
    return res.json(cached.data);
  }
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    cache[key] = { data: body, expiry: now + CACHE_TTL };
    return originalJson(body);
  };
  next();
}
