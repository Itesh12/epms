import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const tenantMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.orgId) {
    return res.status(400).json({ message: 'Organization ID missing from context' });
  }
  
  // Scoping queries using organizationId is now easier as we've validated the presence
  next();
};
