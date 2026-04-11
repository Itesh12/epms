import request from 'supertest';
import { app } from '../../../server';
import User from '../../../models/User';
import Project from '../../../models/Project';
import Task from '../../../models/Task';
import mongoose from 'mongoose';

describe('Tasks Integration Tests', () => {
  let adminToken: string;
  let organizationId: string;
  let projectId: string;
  let userId: string;

  const adminUser = {
    name: 'Task Admin',
    email: 'task@example.com',
    password: 'password123',
    orgName: 'Task Org'
  };

  beforeEach(async () => {
    // 1. Register Admin
    const regRes = await request(app)
      .post('/api/v1/auth/signup-admin')
      .send(adminUser);
    
    adminToken = regRes.body.token;
    organizationId = regRes.body.user.organizationId;
    userId = regRes.body.user.id;

    // 2. Create Project
    const project = await Project.create({
      name: 'Task Test Project',
      organizationId,
      createdBy: userId
    });
    projectId = (project._id as mongoose.Types.ObjectId).toString();
  });

  test('POST /api/v1/tasks should create a new task', async () => {
    const taskData = {
      projectId,
      title: 'Implementation Task',
      description: 'Finish testing the whole project',
      priority: 'HIGH'
    };

    const response = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(taskData);

    expect(response.status).toBe(201);
    expect(response.body.title).toBe(taskData.title);
    expect(response.body.projectId).toBe(projectId);
    
    const task = await Task.findById(response.body._id);
    expect(task).toBeTruthy();
    expect(task?.priority).toBe('HIGH');
  });

  test('GET /api/v1/tasks/project/:projectId should return project tasks', async () => {
    await Task.create({
      projectId,
      organizationId,
      title: 'Existing Task',
      createdBy: userId
    });

    const response = await request(app)
      .get(`/api/v1/tasks/project/${projectId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  test('POST /api/v1/tasks/:id/comments should add a comment', async () => {
    const task = await Task.create({
      projectId,
      organizationId,
      title: 'Commentable Task',
      createdBy: userId
    });

    const response = await request(app)
      .post(`/api/v1/tasks/${task._id}/comments`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ text: 'This is a test comment' });

    expect(response.status).toBe(200);
    expect(response.body.comments.length).toBe(1);
    expect(response.body.comments[0].text).toBe('This is a test comment');
  });

  test('POST /api/v1/tasks/:id/time should track time', async () => {
    const task = await Task.create({
      projectId,
      organizationId,
      title: 'Time Task',
      createdBy: userId
    });

    const response = await request(app)
      .post(`/api/v1/tasks/${task._id}/time`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ timeSpent: 3600 }); // 1 hour

    expect(response.status).toBe(200);
    expect(response.body.timeSpent).toBe(3600);
  });
});
