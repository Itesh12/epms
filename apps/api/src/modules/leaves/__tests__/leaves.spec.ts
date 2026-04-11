import request from 'supertest';
import { app } from '../../../server';
import User from '../../../models/User';
import Leave from '../../../models/Leave';

describe('Leaves Integration Tests', () => {
  let adminToken: string;
  let organizationId: string;

  const adminUser = {
    name: 'Leave Admin',
    email: 'leave@example.com',
    password: 'password123',
    orgName: 'Leave Org'
  };

  beforeEach(async () => {
    // 1. Register Admin
    const regRes = await request(app)
      .post('/api/v1/auth/signup-admin')
      .send(adminUser);
    
    adminToken = regRes.body.token;
    organizationId = regRes.body.user.organizationId;
  });

  test('POST /api/v1/leaves should create a leave request and an approval request', async () => {
    const leaveData = {
      leaveType: 'VACATION',
      startDate: '2026-05-01',
      endDate: '2026-05-05',
      reason: 'Family vacation'
    };

    const response = await request(app)
      .post('/api/v1/leaves')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(leaveData);

    expect(response.status).toBe(201);
    expect(response.body.leaveType).toBe('VACATION');
    expect(response.body).toHaveProperty('approvalRequestId');
    
    const leave = await Leave.findById(response.body._id);
    expect(leave).toBeTruthy();
    expect(leave?.status).toBe('PENDING');
  });

  test('GET /api/v1/leaves should return my leave requests', async () => {
    // Create one first
    await request(app)
      .post('/api/v1/leaves')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        leaveType: 'SICK',
        startDate: '2026-04-20',
        endDate: '2026-04-21',
        reason: 'Flu'
      });

    const response = await request(app)
      .get('/api/v1/leaves')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body[0].leaveType).toBe('SICK');
  });
});
