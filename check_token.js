const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './apps/api/.env' });

const token = process.argv[2];
const secret = process.env.ACCESS_TOKEN_SECRET || 'access_secret';

if (!token) {
  console.log('Usage: node check_token.js <token>');
  process.exit(1);
}

try {
  const decoded = jwt.verify(token, secret);
  console.log('\n✅ TOKEN DECODED SUCCESSFULLY:');
  console.log(JSON.stringify(decoded, null, 2));
} catch (err) {
  console.error('\n❌ TOKEN VERIFICATION FAILED:', err.message);
}
