/**
 * API Connectivity Test Utility
 * Use this to test if your API is reachable
 */

import axios from 'axios';

const API_BASE_URL = 'https://farmer-api-v2.onrender.com';

export const testApiConnectivity = async () => {
  console.log('🧪 Testing API connectivity...');
  
  try {
    // Test 1: Basic health check
    console.log('📡 Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 15000, // 15 seconds timeout
    });
    console.log('✅ Health check successful:', healthResponse.data);
    
    // Test 2: Test categories endpoint (no auth required)
    console.log('📡 Testing categories endpoint...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/categories/`, {
      timeout: 15000,
    });
    console.log('✅ Categories endpoint successful:', categoriesResponse.data);
    
    // Test 3: Test registration endpoint structure
    console.log('📡 Testing registration endpoint availability...');
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        // Invalid data to test endpoint availability
        test: 'test'
      }, {
        timeout: 15000,
      });
    } catch (error) {
      if (error.response && error.response.status === 422) {
        console.log('✅ Registration endpoint is available (validation error expected)');
      } else {
        throw error;
      }
    }
    
    return {
      success: true,
      message: 'All API endpoints are reachable'
    };
    
  } catch (error) {
    console.error('❌ API connectivity test failed:', error);
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return {
        success: false,
        message: 'Cannot reach the API server. Check your internet connection.',
        error: 'Network connectivity issue'
      };
    } else if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        message: 'API request timed out. The server might be slow.',
        error: 'Timeout error'
      };
    } else {
      return {
        success: false,
        message: `API test failed: ${error.message}`,
        error: error.message
      };
    }
  }
};

// Test registration with proper data
export const testRegistration = async () => {
  console.log('🧪 Testing registration with valid data...');
  
  try {
    const testUserData = {
      email: `test${Date.now()}@example.com`, // Unique email
      password: 'testpassword123',
      role: 'customer',
      first_name: 'Test',
      last_name: 'User',
      phone: '+1234567890'
    };
    
    const response = await axios.post(`${API_BASE_URL}/auth/register`, testUserData, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Registration test successful:', response.data);
    return {
      success: true,
      data: response.data
    };
    
  } catch (error) {
    console.error('❌ Registration test failed:', error);
    
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
      return {
        success: false,
        message: error.response.data.detail || 'Registration failed',
        status: error.response.status
      };
    } else {
      return {
        success: false,
        message: error.message,
        error: 'Network or request error'
      };
    }
  }
};

export default {
  testApiConnectivity,
  testRegistration
};