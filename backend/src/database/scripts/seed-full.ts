import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

// --- CONFIGURATION ---
const MONGODB_URI = 'mongodb+srv://Kruti98:Kruti98.@cluster0.lkh2x.mongodb.net/epms_new';
const UNIVERSAL_PASSWORD = 'Welcome@123';

// --- SCHEMA DEFINITIONS ---
const OrganizationSchema = new mongoose.Schema({ name: String, slug: String, subtitle: String, primaryColor: String, secondaryColor: String, industry: String, size: String, contactEmail: String, website: String, address: String }, { timestamps: true });
const UserSchema = new mongoose.Schema({ email: String, employeeId: String, firstName: String, lastName: String, password: { type: String, select: false }, role: String, organizationId: mongoose.Schema.Types.ObjectId, designation: String, department: String, employmentType: String, joiningDate: Date, workLocation: String, reportingManager: mongoose.Schema.Types.ObjectId, techStack: String, skills: [String], certifications: [String], linkedinUrl: String, githubUrl: String, portfolioUrl: String, personalEmail: String, phoneNumber: String, dob: Date, gender: String, maritalStatus: String, bloodGroup: String, currentAddress: String, permanentAddress: String, emergencyContactName: String, emergencyContactRelation: String, emergencyContactPhone: String, isActive: Boolean, baseSalary: Number, bankDetails: Object }, { timestamps: true });
const ProjectSchema = new mongoose.Schema({ name: String, slug: String, description: String, status: String, priority: String, startDate: Date, endDate: Date, organizationId: mongoose.Schema.Types.ObjectId, owner: mongoose.Schema.Types.ObjectId, team: [mongoose.Schema.Types.ObjectId], tags: [String], budget: Number, healthStatus: String, portfolio: String }, { timestamps: true });
const TaskSchema = new mongoose.Schema({ title: String, description: String, status: String, priority: String, dueDate: Date, projectId: mongoose.Schema.Types.ObjectId, assignee: mongoose.Schema.Types.ObjectId, reporter: mongoose.Schema.Types.ObjectId, tags: [String], estimateHours: Number }, { timestamps: true });
const AttendanceSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, date: Date, checkIn: Date, checkOut: Date, status: String, workHours: Number, organizationId: mongoose.Schema.Types.ObjectId, note: String }, { timestamps: true });
const LeaveRequestSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, type: String, startDate: Date, endDate: Date, reason: String, status: String, approvedBy: mongoose.Schema.Types.ObjectId, organizationId: mongoose.Schema.Types.ObjectId }, { timestamps: true });
const PayrollSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, month: Number, year: Number, baseSalary: Number, bonuses: Number, deductions: Number, netSalary: Number, status: String, paymentDate: Date, organizationId: mongoose.Schema.Types.ObjectId }, { timestamps: true });
const AssetSchema = new mongoose.Schema({ name: String, type: String, category: String, identifier: String, status: String, assignedTo: mongoose.Schema.Types.ObjectId, organizationId: mongoose.Schema.Types.ObjectId, purchaseDate: Date, warrantyExpiry: Date, maintenanceHistory: [Object] }, { timestamps: true });
const SocialPostSchema = new mongoose.Schema({ author: mongoose.Schema.Types.ObjectId, content: String, organizationId: mongoose.Schema.Types.ObjectId, type: String, tags: [String], likes: [mongoose.Schema.Types.ObjectId] }, { timestamps: true });
const SupportTicketSchema = new mongoose.Schema({ title: String, description: String, status: String, priority: String, category: String, createdBy: mongoose.Schema.Types.ObjectId, assignedTo: mongoose.Schema.Types.ObjectId, organizationId: mongoose.Schema.Types.ObjectId }, { timestamps: true });
const WikiArticleSchema = new mongoose.Schema({ title: String, content: String, category: String, author: mongoose.Schema.Types.ObjectId, organizationId: mongoose.Schema.Types.ObjectId, tags: [String] }, { timestamps: true });
const PollSchema = new mongoose.Schema({
  question: String,
  description: String,
  options: [{ text: String, count: Number }],
  expiresAt: Date,
  status: String,
  organizationId: mongoose.Schema.Types.ObjectId,
  creatorId: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

// --- MODELS ---
const Organization = mongoose.model('Organization', OrganizationSchema);
const User = mongoose.model('User', UserSchema);
const Project = mongoose.model('Project', ProjectSchema);
const Task = mongoose.model('Task', TaskSchema);
const Attendance = mongoose.model('Attendance', AttendanceSchema);
const LeaveRequest = mongoose.model('LeaveRequest', LeaveRequestSchema);
const Payroll = mongoose.model('Payroll', PayrollSchema);
const Asset = mongoose.model('Asset', AssetSchema);
const SocialPost = mongoose.model('SocialPost', SocialPostSchema);
const SupportTicket = mongoose.model('SupportTicket', SupportTicketSchema);
const WikiArticle = mongoose.model('WikiArticle', WikiArticleSchema);
const Poll = mongoose.model('Poll', PollSchema);

// --- UTILS ---
const ORG_NAMES = ['Nexus Global', 'Astra Industries', 'Quantum Systems', 'Aurora Edtech', 'Helios Logistics', 'Zenith Solutions'];
const DEPTS = ['Engineering', 'Human Resources', 'Finance', 'Marketing', 'Operations'];
const FIRST_NAMES = ['Aarav', 'Ishani', 'Vihaan', 'Ananya', 'Arjun', 'Saanvi', 'Rohan', 'Kavya', 'Aryan', 'Ishita', 'Rahul', 'Priya', 'Amit', 'Neha', 'Sanjay', 'Divya', 'Vikram', 'Anjali', 'Karan', 'Riya'];
const LAST_NAMES = ['Sharma', 'Verma', 'Gupta', 'Malhotra', 'Kapoor', 'Mehra', 'Joshi', 'Patel', 'Reddy', 'Singh', 'Chaudhary', 'Yadav'];
const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const slugify = (text: string) => text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

async function seed() {
  console.log('🚀 Starting Full System Seed...');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const collections = ['organizations', 'users', 'projects', 'tasks', 'attendances', 'leaverequests', 'payrolls', 'assets', 'socialposts', 'supporttickets', 'wikiarticles', 'polls'];
    for (const coll of collections) {
       try { await mongoose.connection.collection(coll).deleteMany({}); } catch (e) {}
    }
    console.log('🗑️  Cleared all relevant collections');

    const hashedPassword = await bcrypt.hash(UNIVERSAL_PASSWORD, 10);
    const orgs = [];

    // Pre-generate Organizations
    for (const name of ORG_NAMES) {
      const org = await Organization.create({
        name, slug: slugify(name), subtitle: `Leadership in ${name}`,
        primaryColor: '#6366f1', secondaryColor: '#4338ca',
        industry: getRandom(['Tech', 'Edu', 'Gov']), size: '500+', contactEmail: `hi@${slugify(name)}.pro`, website: 'https://epms.pro', address: 'Global'
      });
      orgs.push(org);
    }
    console.log(`🏢 Created ${orgs.length} Organizations`);

    const adminsPerGlobal = [[0, 1, 2], [3, 4, 5]];
    for (let globalIndex = 0; globalIndex < 2; globalIndex++) {
      for (const orgIdx of adminsPerGlobal[globalIndex]) {
        const org: any = orgs[orgIdx];
        process.stdout.write(`⏳ Seeding Org: ${org.name}... `);

        // --- USERS ---
        const admin = await User.create({ email: `admin${globalIndex+1}_${org.slug}@epms.com`, firstName: 'System', lastName: 'Admin', password: hashedPassword, role: 'ADMIN', organizationId: org._id, designation: 'Admin', department: 'Management', isActive: true, baseSalary: 120000 } as any);
        const managers = [];
        for(let m=0; m<3; m++) {
          managers.push(await User.create({ email: `manager${m+1}_${org.slug}@epms.com`, firstName: getRandom(FIRST_NAMES), lastName: getRandom(LAST_NAMES), password: hashedPassword, role: 'MANAGER', organizationId: org._id, designation: 'Manager', department: getRandom(DEPTS), reportingManager: admin._id, isActive: true, baseSalary: 80000 } as any));
        }
        const employees = [];
        for(let e=0; e<20; e++) {
          const mgr = managers[e % 3];
          employees.push(await User.create({ email: `emp${e+1}_${org.slug}@epms.com`, firstName: getRandom(FIRST_NAMES), lastName: getRandom(LAST_NAMES), password: hashedPassword, role: 'EMPLOYEE', organizationId: org._id, designation: 'Associate', department: mgr.department, reportingManager: mgr._id, isActive: true, baseSalary: 45000, techStack: 'MERN', skills: ['TS', 'React'], phoneNumber: '1234567890', bankDetails: {bank: 'EPMS Bank'} } as any));
        }
        const allUsers = [admin, ...managers, ...employees];

        // --- PROJECTS & TASKS (Batched) ---
        const projects = [];
        for(let p=0; p<3; p++) {
           projects.push(await Project.create({ name: `Project ${p+1}`, slug: `p-${p+1}`, status: 'ACTIVE', priority: 'HIGH', organizationId: org._id, owner: managers[p]._id } as any));
        }
        const tasks = [];
        for(const p of projects) {
          for(let t=0; t<10; t++) {
            tasks.push({ title: `Task ${t+1}`, status: 'TODO', priority: 'MEDIUM', projectId: p._id, assignee: employees[t % 20]._id, organizationId: org._id });
          }
        }
        await Task.insertMany(tasks);

        // --- ATTENDANCE (Batched Last 30 Days) ---
        const attendanceBatch = [];
        const start = new Date(); start.setDate(start.getDate() - 30);
        for(const u of allUsers) {
          for(let i=0; i<30; i++) {
            const d = new Date(start); d.setDate(d.getDate() + i);
            if(d.getDay() === 0 || d.getDay() === 6) continue;
            attendanceBatch.push({ userId: u._id, date: d, status: 'PRESENT', workHours: 8, organizationId: org._id });
          }
        }
        await Attendance.insertMany(attendanceBatch);

        // --- OTHER MODULES (Mini-batch) ---
        await LeaveRequest.insertMany(allUsers.map(u => ({ userId: u._id, type: 'VACATION', status: 'APPROVED', organizationId: org._id, startDate: new Date(), endDate: new Date() })));
        await Payroll.insertMany(allUsers.map(u => ({ userId: u._id, month: 4, year: 2024, baseSalary: (u as any).baseSalary, netAmount: (u as any).baseSalary, status: 'PAID', organizationId: org._id })));
        await Asset.insertMany(employees.map(e => ({ name: 'Laptop', type: 'HARDWARE', category: 'Computing', status: 'ASSIGNED', assignedTo: e._id, organizationId: org._id, identifier: `SN-${e.email}` })));
        await SocialPost.insertMany([{ authorId: admin._id, content: 'Welcome!', organizationId: org._id }]);
        await SupportTicket.insertMany([{ title: 'Help', status: 'OPEN', priority: 'HIGH', createdBy: employees[0]._id, organizationId: org._id }]);
        await WikiArticle.insertMany([{ title: 'Policy', content: 'Rules...', organizationId: org._id, author: admin._id }]);
        await Poll.insertMany([{
           question: 'Should we introduce 4-day work weeks?',
           description: 'Seeking employee feedback for upcoming policy changes.',
           options: [{ text: 'Yes, absolutely', count: 15 }, { text: 'No, let stay at 5', count: 5 }],
           expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
           status: 'ACTIVE',
           organizationId: org._id,
           creatorId: admin._id
        }]);

        console.log(`✅ Done!`);
      }
    }
    console.log('\n🌟 SEEDING COMPLETE 🌟');
    process.exit(0);
  } catch (e) {
    console.error('\n❌ FAILED:', e);
    process.exit(1);
  }
}
seed();
