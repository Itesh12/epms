import request from 'supertest';
import { app } from '../../../server';
import User from '../../../models/User';

describe('Auth Integration Tests', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    orgName: 'Test Org'
  };

  test('Signup and Login Flow', async () => {
    // 1. Register Admin
    const regRes = await request(app)
      .post('/api/v1/auth/signup-admin')
      .send(testUser);

    expect(regRes.status).toBe(201);
    expect(regRes.body.user.email).toBe(testUser.email);

    // 2. Login
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
    expect(loginRes.body.user.email).toBe(testUser.email);

    // 3. Login with wrong password
    const failRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword'
      });

    expect(failRes.status).toBe(401);
  });
});
