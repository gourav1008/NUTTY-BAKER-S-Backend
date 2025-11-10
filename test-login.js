import axios from 'axios';

const testLogin = async () => {
  console.log('🧪 Testing Admin Login Endpoint...\n');

  const credentials = {
    email: 'admin@cakebaker.com',
    password: 'admin123'
  };

  try {
    console.log('📤 Sending login request...');
    console.log(`   Email: ${credentials.email}`);
    console.log(`   Password: ${credentials.password}\n`);

    const response = await axios.post('http://localhost:5000/api/auth/login', credentials);

    console.log('✅ Login Successful!\n');
    console.log('📥 Response:');
    console.log(`   Status: ${response.status}`);
    console.log(`   User: ${response.data.data.name}`);
    console.log(`   Email: ${response.data.data.email}`);
    console.log(`   Role: ${response.data.data.role}`);
    console.log(`   Token: ${response.data.data.token.substring(0, 50)}...\n`);

    console.log('🎉 Admin login is working correctly!');
    console.log('💡 You can now login at: http://localhost:5173/admin/login\n');

  } catch (error) {
    console.log('❌ Login Failed!\n');
    
    if (error.response) {
      console.log('📥 Error Response:');
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data.message}`);
      console.log(`   Data:`, error.response.data);
    } else if (error.request) {
      console.log('❌ No response from server');
      console.log('💡 Make sure backend is running: npm run dev');
    } else {
      console.log('❌ Error:', error.message);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Run: npm run diagnose');
    console.log('   2. Run: npm run seed');
    console.log('   3. Make sure backend is running\n');
  }
};

testLogin();
