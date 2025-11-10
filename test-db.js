import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();

const testDatabase = async () => {
  try {
    console.log('🔍 Testing Database Connection...\n');

    await connectDB();
    console.log('✅ Database connected successfully\n');

    // Check if admin user exists
    const adminUser = await User.findOne({ email: 'admin@cakebaker.com' });
    if (adminUser) {
      console.log('✅ Admin user found:');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Active: ${adminUser.isActive}`);
      console.log(`   Has Password: ${!!adminUser.password}`);
    } else {
      console.log('❌ Admin user NOT found in database');
      console.log('💡 Run: npm run seed');
    }

    // Count total users
    const userCount = await User.countDocuments();
    console.log(`\n📊 Total users in database: ${userCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
};

testDatabase();
