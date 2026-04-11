import request from 'supertest';
import { app } from '../../../server';
import User from '../../../models/User';
import Notification from '../../../models/Notification';

describe('Notifications Integration Tests', () => {
  let adminToken: string;
  let organizationId: string;
  let userId: string;

  const adminUser = {
    name: 'Notify Admin',
    email: 'notify@example.com',
    password: 'password123',
    orgName: 'Notify Org'
  };

  beforeEach(async () => {
    // 1. Register Admin
    const regRes = await request(app)
      .post('/api/v1/auth/signup-admin')
      .send(adminUser);
    
    adminToken = regRes.body.token;
    organizationId = regRes.body.user.organizationId;
    userId = regRes.body.user.id;
  });

  test('GET /api/v1/notifications should return user nominations', async () => {
    // Create a notification manually
    await Notification.create({
      organizationId,
      userId,
      title: 'Welcome!',
      message: 'Thanks for joining.',
      type: 'INFO'
    });

    const response = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].title).toBe('Welcome!');
  });

  test('PATCH /api/v1/notifications/read/:id should mark notification as read', async () => {
    const notify = await Notification.create({
      organizationId,
      userId,
      title: 'Unread Notification',
      message: 'Please read me',
      type: 'INFO'
    });

    const response = await request(app)
      .patch(`/api/v1/notifications/read/${notify._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Notification marked as read');
    
    const updated = await Notification.findById(notify._id);
    expect(updated?.isRead).toBe(true);
  });

  test('PATCH /api/v1/notifications/read-all should mark all as read', async () => {
    await Notification.create([
      { organizationId, userId, title: 'Note 1', message: 'M1' },
      { organizationId, userId, title: 'Note 2', message: 'M2' }
    ]);

    const response = await request(app)
      .patch('/api/v1/notifications/read-all')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('All notifications marked as read');

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });
    expect(unreadCount).toBe(0);
  });
});
