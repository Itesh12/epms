const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'apps/api/.env') });

async function reset() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
  console.log('Connected to DB');

  const user = await mongoose.connection.db.collection('users').findOne({ name: /Pam Beesly/i });
  if (!user) {
    console.log('User Pam Beesly not found');
    process.exit(1);
  }

  const today = '2026-04-11';
  const result = await mongoose.connection.db.collection('attendances').deleteOne({ 
    userId: user._id, 
    date: today 
  });

  if (result.deletedCount > 0) {
    console.log(`\n✅ SUCCESSFULLY DELETED today's attendance record for Pam Beesly.`);
    console.log(`Please REFRESH your browser and start a fresh shift.`);
  } else {
    console.log(`\n❌ No record found for today for Pam Beesly.`);
  }

  await mongoose.disconnect();
}

reset().catch(console.error);
