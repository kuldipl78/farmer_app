import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure base URL - automatically detects environment
const getBaseURL = () => {
  // For Railway deployment, update this URL after deployment
  const RAILWAY_URL = 'https://your-app.railway.app'; // Update this after Railway deployment
  
  // For local development - use your machine's current IP address
  const LOCAL_URL = 'http://10.129.3.210:8001';
  
  // You can add logic here to detect environment
  // For now, we'll use local URL for development
  // Change this to RAILWAY_URL when you deploy to production
  return LOCAL_URL;
};

const BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token to requests
api.interceptors.request.use((config) => {
  // Token will be added by individual API calls when needed
  return config;
});

// Add response interceptor to handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear stored auth data
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      // You might want to navigate to login screen here
      // For now, we'll let individual components handle it
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData) => 
    api.post('/auth/register', userData),
  
  getMe: (token) => 
    api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    }),
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