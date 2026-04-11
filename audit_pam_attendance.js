const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'apps/api/.env') });

async function audit() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
  console.log('Connected to DB');

  const user = await mongoose.connection.db.collection('users').findOne({ name: /Pam Beesly/i });
  if (!user) {
    console.log('User Pam Beesly not found');
    process.exit(1);
  }

  console.log(`\nUser: ${user.name} (${user._id})`);
  console.log('Organization:', user.organizationId);

  const today = '2026-04-11';
  const attendance = await mongoose.connection.db.collection('attendances').find({ 
    userId: user._id,
    date: today
  }).toArray();

  if (attendance.length === 0) {
    console.log(`\nNo attendance record found for ${today}`);
  } else {
    console.log(`\nFound ${attendance.length} records for ${today}:`);
    attendance.forEach((doc, i) => {
      console.log(`\nRecord ${i + 1}:`);
      console.log('ID:', doc._id);
      console.log('Status:', doc.status);
      console.log('OrganizationId:', doc.organizationId);
      console.log('Check-In:', doc.checkInTime);
      console.log('Check-Out:', doc.checkOutTime);
      console.log('Activities:', JSON.stringify(doc.activities, null, 2));
    });
  }

  await mongoose.disconnect();
}

audit().catch(console.error);
