// Simple API test - run this in browser console or Node.js

const testAPI = async () => {
  try {
    console.log('🔍 Testing API health...');
    
    const response = await fetch('https://farmer-api-v2.onrender.com/health');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API Health Check PASSED:', data);
      return true;
    } else {
      console.log('❌ API Health Check FAILED:', response.status, data);
      return false;
    }
  } catch (error) {
    console.log('❌ API Health Check ERROR:', error.message);
    return false;
  }
};

const testRegistration = async () => {
  try {
    console.log('🔍 Testing registration...');
    
    const testData = {
      email: `test_${Date.now()}@example.com`,
      password: 'password123',
      role: 'customer',
      first_name: 'Test',
      last_name: 'User',
      phone: null
    };
    
    const response = await fetch('https://farmer-api-v2.onrender.com/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration Test PASSED:', data);
      return true;
    } else {
      console.log('❌ Registration Test FAILED:', response.status, data);
      return false;
    }
  } catch (error) {
    console.log('❌ Registration Test ERROR:', error.message);
    return false;
  }
};

// Run tests
(async () => {
  console.log('🚀 Starting API tests...');
  
  const healthOk = await testAPI();
  if (healthOk) {
    await testRegistration();
  }
  
  console.log('🏁 Tests completed!');
})();

// Instructions:
// 1. Copy this entire code
// 2. Open browser console (F12)
// 3. Paste and press Enter
// 4. Check the results