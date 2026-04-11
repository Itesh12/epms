import { Request, Response, NextFunction } from 'express';
import AuditLog from '../models/AuditLog';
import logger from '../lib/logger';

export const auditLog = (action: string, resource: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // We capture the original end/json/send to log AFTER the request finishes successfully
    const originalResJson = res.json;

    res.json = function (body) {
      // Only log successful actions (2xx) or specifically handled cases
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = (req as any).user?.id || body?.user?.id;
        
        AuditLog.create({
          userId,
          action,
          resource,
          details: {
            method: req.method,
            url: req.originalUrl,
            params: req.params,
            statusCode: res.statusCode,
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        }).catch(err => logger.error('Audit log failed', err));
      }

      return originalResJson.call(this, body);
    };

    next();
  };
};

export const logCustomAction = async (data: {
    userId?: string;
    action: string;
    resource: string;
    details?: any;
    req?: Request;
}) => {
    try {
        await AuditLog.create({
            userId: data.userId,
            action: data.action,
            resource: data.resource,
            details: data.details,
            ipAddress: data.req?.ip,
            userAgent: data.req?.get('User-Agent'),
        });
    } catch (error) {
        logger.error('Manual audit log failed', error);
    }
};
