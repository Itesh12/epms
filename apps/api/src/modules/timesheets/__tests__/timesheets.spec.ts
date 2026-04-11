import request from 'supertest';
import { app } from '../../../server';
import User from '../../../models/User';
import Timesheet from '../../../models/Timesheet';
import Project from '../../../models/Project';

describe('Timesheet Integration Tests', () => {
  let adminToken: string;
  let organizationId: string;
  let userId: string;
  let projectId: string;

  const adminUser = {
    name: 'Sheet Admin',
    email: 'sheet@example.com',
    password: 'password123',
    orgName: 'Sheet Org'
  };

  beforeEach(async () => {
    // 1. Register Admin
    const regRes = await request(app)
      .post('/api/v1/auth/signup-admin')
      .send(adminUser);
    
    adminToken = regRes.body.token;
    organizationId = regRes.body.user.organizationId;
    userId = regRes.body.user.id;

    // 2. Create a project to log hours against
    const project = await Project.create({
      name: 'Sheet Project',
      organizationId,
      createdBy: userId
    });
    projectId = (project._id).toString();
  });

  test('GET /api/v1/timesheets should auto-create a draft timesheet for current week', async () => {
    const response = await request(app)
      .get('/api/v1/timesheets')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('DRAFT');
    expect(response.body.organizationId).toBe(organizationId);
    
    const timesheet = await Timesheet.findById(response.body._id);
    expect(timesheet).toBeTruthy();
  });

  test('PATCH /api/v1/timesheets/:id/entries should save logged hours', async () => {
    const getRes = await request(app)
      .get('/api/v1/timesheets')
      .set('Authorization', `Bearer ${adminToken}`);
    
    const timesheetId = getRes.body._id;

    const entries = [
      {
        projectId,
        date: new Date(),
        hoursLogged: 4,
        description: 'Frontend development'
      },
      {
        projectId,
        date: new Date(),
        hoursLogged: 4,
        description: 'Bug fixing'
      }
    ];

    const response = await request(app)
      .patch(`/api/v1/timesheets/${timesheetId}/entries`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ entries });

    expect(response.status).toBe(200);
    expect(response.body.totalHours).toBe(8);
    expect(response.body.entries.length).toBe(2);
  });

  test('POST /api/v1/timesheets/:id/submit should submit timesheet for approval', async () => {
    const getRes = await request(app)
      .get('/api/v1/timesheets')
      .set('Authorization', `Bearer ${adminToken}`);
    
    const timesheetId = getRes.body._id;

    const response = await request(app)
      .post(`/api/v1/timesheets/${timesheetId}/submit`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('SUBMITTED');
    expect(response.body).toHaveProperty('approvalRequestId');
  });
});
