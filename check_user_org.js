const mongoose = require('mongoose');
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

  const emails = ['admin@epms.com', 'hr@epms.com', 'manager@epms.com', 'employee@epms.com'];

  for (const email of emails) {
    const user = await mongoose.connection.db.collection('users').findOne({ email });
    if (user) {
      console.log(`\nUser: ${email}`);
      console.log('Role:', user.role);
      console.log('organizationId:', user.organizationId);
      console.log('Available keys in User doc:', Object.keys(user));
      
      if (user.organizationId) {
        const org = await mongoose.connection.db.collection('organizations').findOne({ _id: user.organizationId });
        console.log('Linked Org:', org ? org.name : '❌ NOT FOUND IN ORGS COLLECTION');
      }
    } else {
      console.log(`\nUser not found: ${email}`);
    }
  }

  await mongoose.disconnect();
}

verify().catch(console.error);
