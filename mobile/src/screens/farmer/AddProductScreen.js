import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { productsAPI, categoriesAPI } from '../../services/api';

export default function AddProductScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_per_unit: '',
    unit_type: 'kg',
    quantity_available: '',
    category_id: '',
    is_organic: false
  });
  const [categories, setCategories] = useState([]);
  const [productImage, setProductImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const { token } = useAuth();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to add product images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProductImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    const { name, description, price_per_unit, quantity_available, category_id } = formData;
    
    // Comprehensive validation
    const errors = [];
    
    if (!name.trim()) errors.push('Product name is required');
    if (!description.trim()) errors.push('Product description is required');
    if (!price_per_unit) errors.push('Price is required');
    if (!quantity_available) errors.push('Quantity is required');
    if (!category_id) errors.push('Category is required');
    
    if (name.trim().length < 3) errors.push('Product name must be at least 3 characters');
    if (description.trim().length < 10) errors.push('Description must be at least 10 characters');
    
    const price = parseFloat(price_per_unit);
    const quantity = parseInt(quantity_available);
    
    if (isNaN(price) || price <= 0) errors.push('Price must be a valid number greater than 0');
    if (isNaN(quantity) || quantity < 0) errors.push('Quantity must be a valid number greater than or equal to 0');
    
    if (price > 1000) errors.push('Price seems too high. Please verify.');
    if (quantity > 10000) errors.push('Quantity seems too high. Please verify.');
    
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    setLoading(true);
    try {
      const productData = {
        ...formData,
        price_per_unit: price,
        quantity_available: quantity,
        category_id: parseInt(category_id)
      };

      // In a real app, you'd upload the image to a server first
      if (productImage) {
        productData.image_uri = productImage.uri;
      }

      await productsAPI.createProduct(productData, token);
      
      Alert.alert(
        'Success',
        'Product added successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to add product';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const unitTypes = ['kg', 'lb', 'piece', 'bunch', 'box', 'bag'];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-800 ml-4">Add New Product</Text>
          </View>
        </View>

        <View className="px-6 py-6">
          {/* Product Image */}
          <View className="mb-6">
            <Text className="text-gray-700 mb-3 font-medium">Product Image</Text>
            <TouchableOpacity
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 items-center"
              onPress={pickImage}
            >
              {productImage ? (
                <Image
                  source={{ uri: productImage.uri }}
                  className="w-32 h-32 rounded-lg mb-4"
                  resizeMode="cover"
                />
              ) : (
                <View className="items-center">
                  <Ionicons name="camera" size={48} color="#9CA3AF" />
                  <Text className="text-gray-500 mt-2">Tap to add image</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Product Name */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Product Name *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
              placeholder="Enter product name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
            />
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Description *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white h-24"
              placeholder="Describe your product..."
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Category */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Category *</Text>
            {loadingCategories ? (
              <ActivityIndicator size="small" color="#16a34a" />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    className={`mr-3 px-4 py-2 rounded-full border ${
                      formData.category_id === category.id.toString()
                        ? 'bg-primary-600 border-primary-600'
                        : 'bg-white border-gray-300'
                    }`}
                    onPress={() => handleInputChange('category_id', category.id.toString())}
                  >
                    <Text className={`font-medium ${
                      formData.category_id === category.id.toString()
                        ? 'text-white'
                        : 'text-gray-600'
                    }`}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Price and Unit */}
          <View className="flex-row space-x-4 mb-4">
            <View className="flex-1">
              <Text className="text-gray-700 mb-2 font-medium">Price per Unit *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
                placeholder="0.00"
                value={formData.price_per_unit}
                onChangeText={(value) => handleInputChange('price_per_unit', value)}
                keyboardType="decimal-pad"
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-700 mb-2 font-medium">Unit Type *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {unitTypes.map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    className={`mr-2 px-3 py-2 rounded-lg border ${
                      formData.unit_type === unit
                        ? 'bg-primary-600 border-primary-600'
                        : 'bg-white border-gray-300'
                    }`}
                    onPress={() => handleInputChange('unit_type', unit)}
                  >
                    <Text className={`text-sm ${
                      formData.unit_type === unit ? 'text-white' : 'text-gray-600'
                    }`}>
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Quantity Available */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Quantity Available *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
              placeholder="Enter quantity"
              value={formData.quantity_available}
              onChangeText={(value) => handleInputChange('quantity_available', value)}
              keyboardType="numeric"
            />
          </View>

          {/* Organic Toggle */}
          <View className="mb-6">
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => handleInputChange('is_organic', !formData.is_organic)}
            >
              <View className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
                formData.is_organic ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
              }`}>
                {formData.is_organic && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
              <Text className="text-gray-700 font-medium">This is an organic product</Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className="bg-primary-600 py-4 rounded-lg"
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-semibold text-center">
                Add Product
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}