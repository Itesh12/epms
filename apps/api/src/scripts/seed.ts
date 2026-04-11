import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';
import Organization from '../models/Organization';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/epms';
    await mongoose.connect(uri);
    console.log('🌱 Connected to database. Seeding started...');

    await User.deleteMany({});
    await Organization.deleteMany({});

    const passwordHash = await bcrypt.hash('Admin@123', 12);

    // 1. Create a dummy admin first to satisfy Organization requirement
    const tempAdmin = await User.create({
        email: 'admin@epms.com',
        name: 'Super Admin',
        passwordHash,
        role: 'ADMIN',
    });

    // 2. Create Organization linked to this admin
    const org = await Organization.create({
      name: 'Enterprise Hub',
      slug: 'enterprise-hub',
      adminId: tempAdmin._id
    });

    // 3. Update Admin with Org ID
    tempAdmin.organizationId = org._id as mongoose.Types.ObjectId;
    tempAdmin.employeeId = 'EHUB-001';
    tempAdmin.jobTitle = 'Chief Strategy Officer';
    tempAdmin.department = 'Executive';
    await tempAdmin.save();

    // 4. Create other roles with Detailed Profiles
    const otherUsers = [
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

    await User.insertMany(otherUsers);

    console.log('✅ Seeding complete!');
    console.log(`
      ---------------------------------
      Organization: Enterprise Hub
      Available Roles & Emails:
      - ADMIN: admin@epms.com
      - HR: hr@epms.com
      - MANAGER: manager@epms.com
      - EMPLOYEE: employee@epms.com
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
