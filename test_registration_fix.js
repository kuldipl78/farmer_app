// Test registration with proper password length
// Run this in browser console to test the API

const testRegistration = async () => {
  try {
    console.log('🧪 Testing registration with proper password...');
    
    const testData = {
      email: `test_${Date.now()}@example.com`,
      password: 'password123', // 11 characters - well within 72 byte limit
      role: 'customer',
      first_name: 'Test',
      last_name: 'User',
      phone: '9879879870'
    };
    
    console.log('📝 Test data:', { ...testData, password: '[HIDDEN]' });
    
    const response = await fetch('https://farmer-api-v2.onrender.com/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration SUCCESS:', data);
      return { success: true, data };
    } else {
      console.log('❌ Registration FAILED:', response.status, data);
      return { success: false, status: response.status, error: data };
    }
  } catch (error) {
    console.log('❌ Registration ERROR:', error.message);
    return { success: false, error: error.message };
  }
};

// Test with long password (should fail with better error)
const testLongPassword = async () => {
  try {
    console.log('🧪 Testing registration with long password...');
    
    const longPassword = 'a'.repeat(80); // 80 characters - exceeds 72 byte limit
    
    const testData = {
      email: `test_long_${Date.now()}@example.com`,
      password: longPassword,
      role: 'customer',
      first_name: 'Test',
      last_name: 'User',
      phone: '9879879870'
    };
    
    console.log('📝 Test data with long password (80 chars)');
    
    const response = await fetch('https://farmer-api-v2.onrender.com/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('❌ UNEXPECTED: Long password should have failed');
      return { success: false, error: 'Long password should have been rejected' };
    } else {
      console.log('✅ EXPECTED: Long password rejected:', response.status, data);
      return { success: true, status: response.status, error: data };
    }
  } catch (error) {
    console.log('❌ Test ERROR:', error.message);
    return { success: false, error: error.message };
  }
};

// Run both tests
(async () => {
  console.log('🚀 Starting registration tests...');
  
  console.log('\n--- Test 1: Normal Registration ---');
  const normalTest = await testRegistration();
  
  console.log('\n--- Test 2: Long Password Test ---');
  const longTest = await testLongPassword();
  
  console.log('\n📊 Test Results:');
  console.log('Normal registration:', normalTest.success ? '✅ PASS' : '❌ FAIL');
  console.log('Long password rejection:', longTest.success ? '✅ PASS' : '❌ FAIL');
  
  console.log('\n🏁 Tests completed!');
})();

// Instructions:
// 1. Wait 2-3 minutes for backend deployment
// 2. Copy this entire code
// 3. Open browser console (F12)
// 4. Paste and press Enter
// 5. Check the results