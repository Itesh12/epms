import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import morgan from 'morgan';
import logger from './lib/logger';
import { errorHandler } from './middleware/error';
import { connectDB } from './config/db';

import authRoutes from './modules/auth/auth.routes';
import employeeRoutes from './modules/employees/employee.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import projectsRoutes from './modules/projects/projects.routes';
import tasksRoutes from './modules/tasks/tasks.routes';
import workflowsRoutes from './modules/workflows/workflows.routes';
import timesheetsRoutes from './modules/timesheets/timesheets.routes';
import leavesRoutes from './modules/leaves/leaves.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import { initSocket } from './lib/socket';
import { apiRateLimiter } from './middleware/rateLimit';


dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io
initSocket(httpServer);

// Connect to Database
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

app.use(apiRateLimiter);
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// HTTP Request Logging
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));


app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root API v1 routes
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/employees', employeeRoutes);
apiRouter.use('/attendance', attendanceRoutes);
apiRouter.use('/projects', projectsRoutes);
apiRouter.use('/tasks', tasksRoutes);
apiRouter.use('/workflows', workflowsRoutes);
apiRouter.use('/timesheets', timesheetsRoutes);
apiRouter.use('/leaves', leavesRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/notifications', notificationsRoutes);

app.use('/api/v1', apiRouter);

// Global Error Handler (must be last)
app.use(errorHandler);


if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}


export { app, httpServer };

