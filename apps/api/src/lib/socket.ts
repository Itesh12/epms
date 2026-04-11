import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

let io: SocketServer;

// userId -> socketId
const onlineUsers = new Map<string, string>();
// socketId -> userId
const socketToUser = new Map<string, string>();

export const initSocket = (server: HttpServer) => {
  io = new SocketServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true
    }
  });

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      (socket as any).user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user;
    const userId = user.userId;
    const organizationId = user.organizationId;

    console.log(`🔌 User connected: ${userId} (${socket.id})`);

    // Add to presence maps
    onlineUsers.set(userId, socket.id);
    socketToUser.set(socket.id, userId);

    // Join organization and individual rooms
    socket.join(organizationId);
    socket.join(`user:${userId}`);

    // Broadcast presence update to organization
    io.to(organizationId).emit('presence-update', {
      userId,
      status: 'ONLINE'
    });

    socket.on('join-org', (orgId: string) => {
      // In case they want to join another org (if multi-org supported)
      socket.join(orgId);
    });

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${userId} (${socket.id})`);
      
      onlineUsers.delete(userId);
      socketToUser.delete(socket.id);

      // Broadcast offline status
      io.to(organizationId).emit('presence-update', {
        userId,
        status: 'OFFLINE',
        lastActive: new Date().toISOString()
      });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};
