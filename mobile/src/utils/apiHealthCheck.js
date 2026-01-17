/**
 * API Health Check Utility
 * Use this to test if the backend API is working
 */

const API_BASE_URL = 'https://farmer-api-v2.onrender.com';

export const checkApiHealth = async () => {
  const results = {
    baseUrl: API_BASE_URL,
    timestamp: new Date().toISOString(),
    tests: []
  };

  // Test 1: Basic connectivity
  try {
    console.log('🔍 Testing basic connectivity...');
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      timeout: 10000,
    });

    if (response.ok) {
      const data = await response.json();
      results.tests.push({
        name: 'Health Check',
        success: true,
        status: response.status,
        data: data
      });
      console.log('✅ Health check passed:', data);
    } else {
      results.tests.push({
        name: 'Health Check',
        success: false,
        status: response.status,
        error: `HTTP ${response.status}: ${response.statusText}`
      });
      console.log('❌ Health check failed:', response.status);
    }
  } catch (error) {
    results.tests.push({
      name: 'Health Check',
      success: false,
      error: error.message
    });
    console.log('❌ Health check error:', error.message);
  }

  // Test 2: Root endpoint
  try {
    console.log('🔍 Testing root endpoint...');
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      timeout: 10000,
    });

    if (response.ok) {
      const data = await response.json();
      results.tests.push({
        name: 'Root Endpoint',
        success: true,
        status: response.status,
        data: data
      });
      console.log('✅ Root endpoint passed:', data);
    } else {
      results.tests.push({
        name: 'Root Endpoint',
        success: false,
        status: response.status,
        error: `HTTP ${response.status}: ${response.statusText}`
      });
      console.log('❌ Root endpoint failed:', response.status);
    }
  } catch (error) {
    results.tests.push({
      name: 'Root Endpoint',
      success: false,
      error: error.message
    });
    console.log('❌ Root endpoint error:', error.message);
  }

  // Test 3: Categories endpoint (should work without auth)
  try {
    console.log('🔍 Testing categories endpoint...');
    const response = await fetch(`${API_BASE_URL}/categories/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      timeout: 10000,
    });

    if (response.ok) {
      const data = await response.json();
      results.tests.push({
        name: 'Categories Endpoint',
        success: true,
        status: response.status,
        data: data
      });
      console.log('✅ Categories endpoint passed:', data);
    } else {
      results.tests.push({
        name: 'Categories Endpoint',
        success: false,
        status: response.status,
        error: `HTTP ${response.status}: ${response.statusText}`
      });
      console.log('❌ Categories endpoint failed:', response.status);
    }
  } catch (error) {
    results.tests.push({
      name: 'Categories Endpoint',
      success: false,
      error: error.message
    });
    console.log('❌ Categories endpoint error:', error.message);
  }

  // Calculate summary
  const totalTests = results.tests.length;
  const passedTests = results.tests.filter(test => test.success).length;
  results.summary = {
    total: totalTests,
    passed: passedTests,
    failed: totalTests - passedTests,
    success: passedTests === totalTests
  };

  console.log(`📊 API Health Check Results: ${passedTests}/${totalTests} tests passed`);
  
  return results;
};

export const testRegistrationEndpoint = async (testData) => {
  console.log('🔍 Testing registration endpoint...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testData),
      timeout: 15000,
    });

    const responseData = await response.json();

    if (response.ok) {
      console.log('✅ Registration test passed:', responseData);
      return {
        success: true,
        status: response.status,
        data: responseData
      };
    } else {
      console.log('❌ Registration test failed:', response.status, responseData);
      return {
        success: false,
        status: response.status,
        error: responseData
      };
    }
  } catch (error) {
    console.log('❌ Registration test error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  checkApiHealth,
  testRegistrationEndpoint
};