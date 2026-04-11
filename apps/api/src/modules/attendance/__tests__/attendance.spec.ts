import request from 'supertest';
import { app } from '../../../server';
import User from '../../../models/User';
import Attendance from '../../../models/Attendance';
import { format } from 'date-fns';

describe('Attendance Integration Tests', () => {
  let adminToken: string;
  let organizationId: string;
  const today = format(new Date(), 'yyyy-MM-dd');

  const adminUser = {
    name: 'Attend Admin',
    email: 'attend@example.com',
    password: 'password123',
    orgName: 'Attend Org'
  };

  beforeEach(async () => {
    // 1. Register Admin
    const regRes = await request(app)
      .post('/api/v1/auth/signup-admin')
      .send(adminUser);
    
    adminToken = regRes.body.token;
    organizationId = regRes.body.user.organizationId;
  });

  test('POST /api/v1/attendance/check-in should start a work session', async () => {
    const response = await request(app)
      .post('/api/v1/attendance/check-in')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('PRESENT');
    expect(response.body.activities[0].type).toBe('WORK');
  });

  test('GET /api/v1/attendance/status should return current status', async () => {
    await request(app)
      .post('/api/v1/attendance/check-in')
      .set('Authorization', `Bearer ${adminToken}`);

    const response = await request(app)
      .get('/api/v1/attendance/status')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('PRESENT');
  });

  test('POST /api/v1/attendance/toggle-break should fail if under 1 minute', async () => {
    await request(app)
      .post('/api/v1/attendance/check-in')
      .set('Authorization', `Bearer ${adminToken}`);

    const response = await request(app)
      .post('/api/v1/attendance/toggle-break')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('at least 1 minute');
  });

  test('GET /api/v1/attendance/dashboard-metrics should return metrics', async () => {
    const response = await request(app)
      .get('/api/v1/attendance/dashboard-metrics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('workHours');
    expect(response.body).toHaveProperty('efficiency');
  });
});
