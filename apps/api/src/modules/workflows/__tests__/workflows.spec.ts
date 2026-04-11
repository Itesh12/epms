import request from 'supertest';
import { app } from '../../../server';
import User from '../../../models/User';
import ApprovalFlow from '../../../models/ApprovalFlow';
import ApprovalRequest from '../../../models/ApprovalRequest';

describe('Workflow Integration Tests', () => {
  let adminToken: string;
  let organizationId: string;
  let userId: string;

  const adminUser = {
    name: 'Workflow Admin',
    email: 'workflow@example.com',
    password: 'password123',
    orgName: 'Workflow Org'
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

  test('POST /api/v1/workflows/flows should create a new approval flow', async () => {
    const flowData = {
      name: 'Standard Leave Flow',
      targetType: 'LEAVE',
      steps: [
        { stepOrder: 1, requiredRole: 'MANAGER' },
        { stepOrder: 2, requiredRole: 'HR' }
      ]
    };

    const response = await request(app)
      .post('/api/v1/workflows/flows')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(flowData);

    expect(response.status).toBe(201);
    expect(response.body.name).toBe(flowData.name);
    expect(response.body.steps.length).toBe(2);
    
    const flow = await ApprovalFlow.findById(response.body._id);
    expect(flow).toBeTruthy();
  });

  test('POST /api/v1/workflows/action/:id should approve a request', async () => {
    // Create a dummy request
    const flow = await ApprovalFlow.create({
      organizationId,
      name: 'Simple Flow',
      targetType: 'LEAVE',
      steps: [{ stepOrder: 1, requiredRole: 'ADMIN' }]
    });

    const approvalRequest = await ApprovalRequest.create({
      organizationId,
      targetId: new (require('mongoose').Types.ObjectId)(),
      targetType: 'LEAVE',
      flowId: flow._id,
      requesterId: userId,
      currentStepOrder: 1,
      status: 'PENDING'
    });

    const response = await request(app)
      .post(`/api/v1/workflows/action/${approvalRequest._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ action: 'APPROVE', comment: 'Looks good' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('APPROVED');
    expect(response.body.history.length).toBe(1);
    expect(response.body.history[0].comment).toBe('Looks good');
  });
});
