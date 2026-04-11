import request from 'supertest';
import { app } from '../../../server';
import User from '../../../models/User';
import Project from '../../../models/Project';

describe('Projects Integration Tests', () => {
  let adminToken: string;
  let organizationId: string;

  const adminUser = {
    name: 'Project Admin',
    email: 'project@example.com',
    password: 'password123',
    orgName: 'Project Org'
  };

  beforeEach(async () => {
    // 1. Register Admin
    const regRes = await request(app)
      .post('/api/v1/auth/signup-admin')
      .send(adminUser);
    
    adminToken = regRes.body.token;
    organizationId = regRes.body.user.organizationId;
  });

  test('POST /api/v1/projects should create a new project', async () => {
    const projectData = {
      name: 'Test Project',
      description: 'A test project description'
    };

    const response = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(projectData);

    expect(response.status).toBe(201);
    expect(response.body.name).toBe(projectData.name);
    expect(response.body.organizationId).toBe(organizationId);
    
    const project = await Project.findById(response.body._id);
    expect(project).toBeTruthy();
  });

  test('GET /api/v1/projects should return all projects in the org', async () => {
    // Create one first
    await Project.create({
      name: 'Existing Project',
      organizationId,
      createdBy: (await User.findOne({ email: adminUser.email }))?._id
    });

    const response = await request(app)
      .get('/api/v1/projects')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body[0].name).toBe('Existing Project');
  });

  test('PATCH /api/v1/projects/:id should update project status', async () => {
    const project = await Project.create({
      name: 'Updatable Project',
      organizationId,
      createdBy: (await User.findOne({ email: adminUser.email }))?._id
    });

    const response = await request(app)
      .patch(`/api/v1/projects/${project._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'COMPLETED' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('COMPLETED');
  });
});
