import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { productsAPI } from '../../services/api';

export default function FarmerProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token, logout } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getMyProducts(token);
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
      
      if (error.response?.status === 401) {
        Alert.alert(
          'Session Expired', 
          'Your session has expired. You will be logged out automatically.',
          [{ 
            text: 'OK', 
            onPress: () => logout()
          }]
        );
      } else {
        Alert.alert('Error', 'Failed to load products');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const handleDeleteProduct = async (productId) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await productsAPI.deleteProduct(productId, token);
              setProducts(products.filter(p => p.id !== productId));
              Alert.alert('Success', 'Product deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          }
        }
      ]
    );
  };

  const renderProduct = ({ item }) => (
    <View className="bg-white mx-4 mb-4 rounded-lg shadow-sm border border-gray-200">
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>
            <Text className="text-gray-600 mt-1">{item.description}</Text>
          </View>
          <View className="flex-row">
            <TouchableOpacity
              className="p-2"
              onPress={() => navigation.navigate('AddProduct', { product: item, isEdit: true })}
            >
              <Ionicons name="pencil" size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity
              className="p-2"
              onPress={() => handleDeleteProduct(item.id)}
            >
              <Ionicons name="trash" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Text className="text-xl font-bold text-primary-600">
              ${item.price_per_unit}
            </Text>
            <Text className="text-gray-600 ml-1">/{item.unit_type}</Text>
          </View>
          
          <View className="flex-row items-center">
            <View className={`px-2 py-1 rounded-full ${
              item.quantity_available > 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <Text className={`text-xs font-medium ${
                item.quantity_available > 0 ? 'text-green-800' : 'text-red-800'
              }`}>
                {item.quantity_available > 0 ? 'In Stock' : 'Out of Stock'}
              </Text>
            </View>
            {item.is_organic && (
              <View className="bg-green-100 px-2 py-1 rounded-full ml-2">
                <Text className="text-xs font-medium text-green-800">Organic</Text>
              </View>
            )}
          </View>
        </View>

        <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-200">
          <Text className="text-gray-600">
            Quantity: {item.quantity_available} {item.unit_type}
          </Text>
          <Text className="text-gray-600">
            Category: {item.category?.name}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16a34a" />
          <Text className="text-gray-600 mt-4">Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-800">My Products</Text>
          <TouchableOpacity
            className="bg-primary-600 px-4 py-2 rounded-lg"
            onPress={() => navigation.navigate('AddProduct')}
          >
            <View className="flex-row items-center">
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Add Product</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {products.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="leaf-outline" size={80} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-800 mt-4 mb-2">
            No products yet
          </Text>
          <Text className="text-gray-600 text-center mb-8">
            Start by adding your first product to showcase your fresh produce
          </Text>
          
          <TouchableOpacity
            className="bg-primary-600 px-6 py-3 rounded-lg"
            onPress={() => navigation.navigate('AddProduct')}
          >
            <View className="flex-row items-center">
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Add Product</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingVertical: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}