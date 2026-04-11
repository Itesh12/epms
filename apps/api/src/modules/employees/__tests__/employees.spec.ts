import request from 'supertest';
import { app } from '../../../server';
import User from '../../../models/User';
import Organization from '../../../models/Organization';

describe('Employee Integration Tests', () => {
  let adminToken: string;
  let employeeToken: string;
  let adminId: string;
  let employeeId: string;
  let organizationId: string;

  const adminUser = {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    orgName: 'Test Org'
  };

  const employeeUser = {
    name: 'Employee User',
    email: 'employee@example.com',
    password: 'password123'
  };

  beforeEach(async () => {
    // 1. Register Admin
    const regRes = await request(app)
      .post('/api/v1/auth/signup-admin')
      .send(adminUser);
    
    if (regRes.status !== 201) {
      console.log('Registration failed in Employees Test:', regRes.status, regRes.body);
    }
    
    adminToken = regRes.body.token;
    adminId = regRes.body.user.id;
    organizationId = regRes.body.user.organizationId;

    // 2. Create an Employee manually
    const employee = await User.create({
      name: employeeUser.name,
      email: employeeUser.email,
      passwordHash: 'hashedpassword',
      role: 'EMPLOYEE',
      organizationId,
      status: 'ACTIVE'
    });
    employeeId = employee._id.toString();
  });

  test('GET /api/v1/employees/me should return current user profile', async () => {
    const response = await request(app)
      .get('/api/v1/employees/me')
      .set('Authorization', `Bearer ${adminToken}`);

    if (response.status !== 200) {
      console.log('GET /me failed:', response.status, response.body);
    }

    expect(response.status).toBe(200);
    expect(response.body.email).toBe(adminUser.email);
  });

  test('GET /api/v1/employees should return all employees for Admin', async () => {
    const response = await request(app)
      .get('/api/v1/employees')
      .set('Authorization', `Bearer ${adminToken}`);

    if (response.status !== 200) {
      console.log('GET /employees failed:', response.status, response.body);
    }

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1); // At least the admin
  });

  test('GET /api/v1/employees/:id should return specific employee details', async () => {
    const response = await request(app)
      .get(`/api/v1/employees/${employeeId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe(employeeUser.name);
  });

  test('PATCH /api/v1/employees/:id should update employee status', async () => {
    const response = await request(app)
      .patch(`/api/v1/employees/${employeeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'ON_LEAVE' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ON_LEAVE');
  });

  test('DELETE /api/v1/employees/:id should delete employee by Admin', async () => {
    const response = await request(app)
      .delete(`/api/v1/employees/${employeeId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    
    const deletedUser = await User.findById(employeeId);
    expect(deletedUser).toBeNull();
  });
});
