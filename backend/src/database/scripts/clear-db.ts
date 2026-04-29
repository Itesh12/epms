import mongoose from 'mongoose';

// Fallback to the same URI used in seed-full.ts if env is not set
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Kruti98:Kruti98.@cluster0.lkh2x.mongodb.net/epms_new';

async function clearDB() {
  console.log('🚀 Connecting to MongoDB to clear database...');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`✅ Connected to MongoDB.`);
    
    // Drop the entire database
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
      console.log('🗑️  Successfully dropped the entire database!');
    } else {
      console.log('⚠️ Could not find database to drop.');
    }
    
    await mongoose.disconnect();
    console.log('✅ Disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to clear database:', error);
    process.exit(1);
  }
}

clearDB();
