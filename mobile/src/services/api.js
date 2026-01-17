import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure base URL - using Render deployment
const getBaseURL = () => {
  // Production URL (Render deployment)
  const RENDER_URL = 'https://farmer-api-v2.onrender.com';
  
  // For local development (if needed)
  const LOCAL_URL = 'http://localhost:8000';
  
  // Use Render URL for production
  return RENDER_URL;
};

const BASE_URL = getBaseURL();

console.log('🌐 API Base URL:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000, // 15 second timeout (increased for better reliability)
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('📡 Request data:', config.data);
    return config;
  },
  (error) => {
    console.error('📡 Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      console.error('❌ Response status:', error.response.status);
      console.error('❌ Response data:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('❌ No response received:', error.request);
    } else {
      // Something else happened
      console.error('❌ Request setup error:', error.message);
    }
    
    if (error.response?.status === 401) {
      // Clear stored auth data
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    
    return Promise.reject(error);
  }
);

// Auth API with better error handling
export const authAPI = {
  login: async (email, password) => {
    try {
      console.log('🔐 Attempting login for:', email);
      const response = await api.post('/auth/login', { email, password });
      console.log('✅ Login successful');
      return response;
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      console.log('📝 Attempting registration for:', userData.email);
      console.log('📝 Registration data:', { 
        ...userData, 
        password: '[HIDDEN]',
        phone: userData.phone || 'null'
      });
      
      // Validate required fields
      const requiredFields = ['email', 'password', 'role', 'first_name', 'last_name'];
      for (const field of requiredFields) {
        if (!userData[field]) {
          throw new Error(`${field} is required`);
        }
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // Validate password length
      if (userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      // Ensure phone is either a string or null (not empty string)
      const registrationData = {
        ...userData,
        phone: userData.phone && userData.phone.trim() ? userData.phone.trim() : null
      };
      
      console.log('📝 Final registration data:', { 
        ...registrationData, 
        password: '[HIDDEN]' 
      });
      
      const response = await api.post('/auth/register', registrationData);
      console.log('✅ Registration successful');
      return response;
    } catch (error) {
      console.error('❌ Registration failed:', error.message);
      
      // Log detailed error information
      if (error.response) {
        console.error('❌ Response status:', error.response.status);
        console.error('❌ Response headers:', error.response.headers);
        console.error('❌ Response data:', error.response.data);
        
        // Handle specific error cases
        if (error.response.status === 500) {
          console.error('❌ Server Error - This is likely a backend issue');
          throw new Error('Server error occurred. Please try again later or contact support.');
        } else if (error.response.status === 400) {
          const errorMessage = error.response.data?.detail || 'Invalid registration data';
          throw new Error(errorMessage);
        } else if (error.response.status === 422) {
          // Validation errors
          const errorMessage = error.response.data?.detail || 'Validation error';
          throw new Error(errorMessage);
        }
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please try again.');
      }
      
      throw error;
    }
  },
  
  getMe: async (token) => {
    try {
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response;
    } catch (error) {
      console.error('❌ Get user info failed:', error.message);
      throw error;
    }
  },
};

// Products API
export const productsAPI = {
  getProducts: (params = {}, token) => 
    api.get('/products/', { 
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }),
  
  getProduct: (id, token) => 
    api.get(`/products/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }),
  
  createProduct: (productData, token) => {
    // Validate required fields
    const requiredFields = ['name', 'description', 'price_per_unit', 'unit_type', 'quantity_available', 'category_id'];
    for (const field of requiredFields) {
      if (!productData[field]) {
        throw new Error(`${field} is required`);
      }
    }
    
    // Validate data types
    if (isNaN(productData.price_per_unit) || parseFloat(productData.price_per_unit) <= 0) {
      throw new Error('Price must be a valid number greater than 0');
    }
    
    if (isNaN(productData.quantity_available) || parseInt(productData.quantity_available) < 0) {
      throw new Error('Quantity must be a valid number greater than or equal to 0');
    }
    
    return api.post('/products/', productData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  
  updateProduct: (id, productData, token) => {
    // Validate numeric fields if provided
    if (productData.price_per_unit !== undefined) {
      if (isNaN(productData.price_per_unit) || parseFloat(productData.price_per_unit) <= 0) {
        throw new Error('Price must be a valid number greater than 0');
      }
    }
    
    if (productData.quantity_available !== undefined) {
      if (isNaN(productData.quantity_available) || parseInt(productData.quantity_available) < 0) {
        throw new Error('Quantity must be a valid number greater than or equal to 0');
      }
    }
    
    return api.put(`/products/${id}`, productData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  
  deleteProduct: (id, token) => 
    api.delete(`/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getMyProducts: (token) => 
    api.get('/products/farmer/my-products', {
      headers: { Authorization: `Bearer ${token}` }
    }),
};

// Orders API
export const ordersAPI = {
  getOrders: (token) => 
    api.get('/orders/', {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getOrder: (id, token) => 
    api.get(`/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  createOrder: (orderData, token) => 
    api.post('/orders/', orderData, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  updateOrderStatus: (id, statusData, token) => 
    api.put(`/orders/${id}`, statusData, {
      headers: { Authorization: `Bearer ${token}` }
    }),
};

// Categories API
export const categoriesAPI = {
  getCategories: () => api.get('/categories/'),
};

// Profile API
export const profileAPI = {
  updateProfile: (profileData, token) => {
    // Validate required fields
    if (!profileData.first_name || !profileData.last_name) {
      throw new Error('First name and last name are required');
    }
    
    // Validate email format if provided
    if (profileData.email && !/\S+@\S+\.\S+/.test(profileData.email)) {
      throw new Error('Please enter a valid email address');
    }
    
    return api.put('/users/profile', profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
};

export default api;