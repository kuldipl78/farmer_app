/**
 * Test Registration Utility
 * Use this to test registration with different data formats
 */

import { authAPI } from '../services/api';

export const testRegistrationFormats = async () => {
  const testCases = [
    {
      name: 'Basic Customer Registration',
      data: {
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        role: 'customer',
        first_name: 'Test',
        last_name: 'User',
        phone: '+1234567890'
      }
    },
    {
      name: 'Customer Registration without Phone',
      data: {
        email: `test${Date.now() + 1}@example.com`,
        password: 'password123',
        role: 'customer',
        first_name: 'Test',
        last_name: 'User',
        phone: null
      }
    },
    {
      name: 'Farmer Registration',
      data: {
        email: `farmer${Date.now()}@example.com`,
        password: 'password123',
        role: 'farmer',
        first_name: 'John',
        last_name: 'Farmer',
        phone: '+1234567890'
      }
    }
  ];

  const results = [];

  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log('📝 Data:', { ...testCase.data, password: '[HIDDEN]' });
    
    try {
      const response = await authAPI.register(testCase.data);
      results.push({
        name: testCase.name,
        success: true,
        data: response.data
      });
      console.log('✅ Success:', response.data);
    } catch (error) {
      results.push({
        name: testCase.name,
        success: false,
        error: error.message,
        details: error.response?.data
      });
      console.error('❌ Failed:', error.message);
      if (error.response?.data) {
        console.error('❌ Server Response:', error.response.data);
      }
    }
  }

  return results;
};

// Test with the exact same format as your RegisterScreen
export const testExactRegistrationFormat = async () => {
  console.log('\n🧪 Testing exact RegisterScreen format...');
  
  const testData = {
    email: `testuser${Date.now()}@example.com`,
    password: 'password123',
    role: 'customer',
    first_name: 'Test',
    last_name: 'User',
    phone: '' // Empty string like in your form
  };

  console.log('📝 Test data:', { ...testData, password: '[HIDDEN]' });

  try {
    const response = await authAPI.register(testData);
    console.log('✅ Registration successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Registration failed:', error.message);
    if (error.response) {
      console.error('❌ Status:', error.response.status);
      console.error('❌ Response:', error.response.data);
    }
    return { 
      success: false, 
      error: error.message,
      status: error.response?.status,
      details: error.response?.data
    };
  }
};

export default {
  testRegistrationFormats,
  testExactRegistrationFormat
};