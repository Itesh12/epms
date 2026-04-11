import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';
import Organization from '../models/Organization';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/epms');
    console.log('🌱 Seeding database with rich enterprise data...');

    await User.deleteMany({});
    await Organization.deleteMany({});

    const passwordHash = await bcrypt.hash('Admin@123', 12);

    // 1. Create Organization
    const org = await Organization.create({
      name: 'Enterprise Hub',
      slug: 'enterprise-hub',
    });

    // 2. Create Users with Detailed Profiles
    const users = [
      {
        email: 'admin@epms.com',
        name: 'Sarah Connor',
        passwordHash,
        role: 'ADMIN',
        organizationId: org._id,
        employeeId: 'EHUB-001',
        jobTitle: 'Chief Strategy Officer',
        department: 'Executive',
        status: 'ACTIVE',
        phone: '+1 (555) 0101',
        skills: ['Leadership', 'Strategic Planning'],
      },
      {
        email: 'hr@epms.com',
        name: 'Michael Scott',
        passwordHash,
        role: 'HR',
        organizationId: org._id,
        employeeId: 'EHUB-002',
        jobTitle: 'HR Director',
        department: 'Human Resources',
        status: 'ACTIVE',
        phone: '+1 (555) 0202',
        skills: ['Conflict Resolution', 'Talent Acquisition'],
      },
      {
        email: 'manager@epms.com',
        name: 'Jim Halpert',
        passwordHash,
        role: 'MANAGER',
        organizationId: org._id,
        employeeId: 'EHUB-003',
        jobTitle: 'Sales Manager',
        department: 'Sales',
        status: 'ACTIVE',
        phone: '+1 (555) 0303',
        skills: ['Team Management', 'B2B Sales'],
      },
      {
        email: 'employee@epms.com',
        name: 'Pam Beesly',
        passwordHash,
        role: 'EMPLOYEE',
        organizationId: org._id,
        employeeId: 'EHUB-004',
        jobTitle: 'Lead Designer',
        department: 'Marketing',
        status: 'ACTIVE',
        phone: '+1 (555) 0404',
        skills: ['UI/UX', 'Figma', 'Illustration'],
      }
    ];

    await User.insertMany(users);

    console.log('✅ Seeding complete!');
    console.log(`
      ---------------------------------
      Organization: Enterprise Hub
      Available Roles: ADMIN, HR, MANAGER, EMPLOYEE
      Passwords: all use 'Admin@123'
      ---------------------------------
    `);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
