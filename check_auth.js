const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'apps/api/.env') });

async function verify() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not defined');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to DB');

  const email = 'employee@epms.com';
  const password = 'Employee@123';

  // Use raw collection access to avoid model loading issues
  const user = await mongoose.connection.db.collection('users').findOne({ email });

  if (!user) {
    console.log(`\n❌ User NOT FOUND: ${email}`);
    const all = await mongoose.connection.db.collection('users').find({}, { projection: { email: 1 } }).toArray();
    console.log('Available emails:', all.map(u => u.email));
  } else {
    console.log(`\n✅ User FOUND: ${email}`);
    console.log('Role:', user.role);
    console.log('Status:', user.status);
    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    console.log(`Password Match ("${password}"):`, isMatch ? '✅ YES' : '❌ NO');
  }

  await mongoose.disconnect();
}

verify().catch(console.error);
