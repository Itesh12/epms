import request from 'supertest';
import { app } from '../../../server';
import User from '../../../models/User';
import Attendance from '../../../models/Attendance';
import Task from '../../../models/Task';
import Project from '../../../models/Project';

describe('Analytics Integration Tests', () => {
  let adminToken: string;
  let organizationId: string;
  let userId: string;

  const adminUser = {
    name: 'Analytic Admin',
    email: 'analytic@example.com',
    password: 'password123',
    orgName: 'Analytic Org'
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

  test('GET /api/v1/analytics/attendance should return attendance stats', async () => {
    // Add some mock attendance
    await Attendance.create({
      userId,
      organizationId,
      date: '2026-04-11',
      totalWorkMinutes: 480,
      status: 'PRESENT'
    });

    const response = await request(app)
      .get('/api/v1/analytics/attendance')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('totalPresent');
    expect(response.body.totalPresent).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/v1/analytics/productivity should return task distribution', async () => {
    // Add some mock data
    const project = await Project.create({ name: 'P1', organizationId, createdBy: userId });
    await Task.create({
      projectId: project._id,
      organizationId,
      title: 'T1',
      status: 'DONE',
      timeSpent: 3600,
      createdBy: userId,
      assigneeId: userId
    });

    const response = await request(app)
      .get('/api/v1/analytics/productivity')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('overallScore');
    expect(response.body.tasksCompleted).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/v1/analytics/projects should return performance metrics', async () => {
    const project = await Project.create({ name: 'Project Performance', organizationId, createdBy: userId });
    
    const response = await request(app)
      .get('/api/v1/analytics/projects')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((p: any) => p.projectName === 'Project Performance')).toBe(true);
  });

  test('GET /api/v1/analytics/insights should provide system insights', async () => {
    // Insights might be empty if rules aren't met, but we check if it returns as expected
    const response = await request(app)
      .get('/api/v1/analytics/insights')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
