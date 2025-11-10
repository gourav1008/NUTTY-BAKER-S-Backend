import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const diagnoseAuth = async () => {
  try {
    console.log('🔍 Starting Authentication Diagnostics...\n');

    // Check environment variables
    console.log('1️⃣ Checking Environment Variables:');
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'}`);
    console.log(`   JWT_EXPIRE: ${process.env.JWT_EXPIRE || '7d (default)'}`);
    console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Set' : '❌ Missing'}`);
    console.log(`   ADMIN_EMAIL: ${process.env.ADMIN_EMAIL || 'admin@cakebaker.com (default)'}`);
    console.log(`   ADMIN_PASSWORD: ${process.env.ADMIN_PASSWORD ? '✅ Set' : 'admin123 (default)'}\n');

    // Connect to database
    console.log('2️⃣ Connecting to Database...');
    await connectDB();
    console.log('   ✅ Database connected\n');

    // Check if admin user exists
    console.log('3️⃣ Checking Admin User:');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@cakebaker.com';
    const adminUser = await User.findOne({ email: adminEmail }).select('+password');
    
    if (!adminUser) {
      console.log(`   ❌ Admin user not found with email: ${adminEmail}`);
      console.log('   💡 Run: npm run seed\n');
      process.exit(1);
    }
    
    console.log(`   ✅ Admin user found: ${adminUser.email}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Active: ${adminUser.isActive}`);
    console.log(`   Password Hash: ${adminUser.password.substring(0, 20)}...\n`);

    // Test password comparison
    console.log('4️⃣ Testing Password Authentication:');
    const testPassword = process.env.ADMIN_PASSWORD || 'admin123';
    console.log(`   Testing password: ${testPassword}`);
    
    const isMatch = await adminUser.comparePassword(testPassword);
    
    if (isMatch) {
      console.log('   ✅ Password verification successful!\n');
    } else {
      console.log('   ❌ Password verification failed!');
      console.log('   💡 Password in database does not match expected password\n');
      
      // Offer to reset password
      console.log('5️⃣ Resetting Admin Password...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testPassword, salt);
      
      await User.updateOne(
        { email: adminEmail },
        { password: hashedPassword }
      );
      
      console.log(`   ✅ Password reset to: ${testPassword}\n`);
    }

    // Test token generation
    console.log('6️⃣ Testing JWT Token Generation:');
    if (!process.env.JWT_SECRET) {
      console.log('   ❌ JWT_SECRET is missing!');
      console.log('   💡 Add JWT_SECRET to your .env file\n');
      process.exit(1);
    }
    
    console.log('   ✅ JWT_SECRET is configured\n');

    // Summary
    console.log('✨ Diagnostics Complete!\n');
    console.log('📝 Login Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log('\n🚀 Try logging in at: http://localhost:5173/admin/login\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Diagnostic Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

diagnoseAuth();
