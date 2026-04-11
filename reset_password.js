const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'apps/api/.env') });

async function reset() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not defined');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to DB');

  const email = 'employee@epms.com';
  const newPassword = 'Employee@123';
  const passwordHash = await bcrypt.hash(newPassword, 12);

  const result = await mongoose.connection.db.collection('users').updateOne(
    { email },
    { $set: { passwordHash } }
  );

  if (result.matchedCount > 0) {
    console.log(`\n✅ SUCCESS: Password reset for ${email} to "${newPassword}"`);
  } else {
    console.log(`\n❌ ERROR: User ${email} not found`);
  }

  await mongoose.disconnect();
}

reset().catch(console.error);
