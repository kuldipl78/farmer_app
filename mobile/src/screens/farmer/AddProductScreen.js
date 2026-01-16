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
  Image,
  StyleSheet
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
  const [randomImageUri, setRandomImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const { token } = useAuth();

  useEffect(() => {
    loadCategories();
    // Generate a random placeholder image
    generateRandomImage();
  }, []);

  const generateRandomImage = () => {
    // Generate a random number for variety
    const randomId = Math.floor(Math.random() * 1000);
    // Use Picsum Photos for random placeholder images
    const imageUri = `https://picsum.photos/seed/${randomId}/400/300`;
    setRandomImageUri(imageUri);
  };

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

      // Use selected image or random placeholder image
      if (productImage) {
        productData.image_uri = productImage.uri;
      } else if (randomImageUri) {
        // Use random placeholder image if no image was selected
        productData.image_uri = randomImageUri;
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add New Product</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Product Image */}
          <View style={styles.imageSection}>
            <Text style={styles.label}>Product Image</Text>
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={pickImage}
            >
              {productImage ? (
                <Image
                  source={{ uri: productImage.uri }}
                  style={styles.selectedImage}
                  resizeMode="cover"
                />
              ) : randomImageUri ? (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: randomImageUri }}
                    style={styles.placeholderImage}
                    resizeMode="cover"
                  />
                  <View style={styles.imageOverlay}>
                    <Ionicons name="camera" size={32} color="white" />
                    <Text style={styles.imageOverlayText}>Tap to change image</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={48} color="#9CA3AF" />
                  <Text style={styles.imagePlaceholderText}>Tap to add image</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Product Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter product name"
              placeholderTextColor="#9CA3AF"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your product..."
              placeholderTextColor="#9CA3AF"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            {loadingCategories ? (
              <ActivityIndicator size="small" color="#16a34a" />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      formData.category_id === category.id.toString() && styles.categoryButtonActive
                    ]}
                    onPress={() => handleInputChange('category_id', category.id.toString())}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      formData.category_id === category.id.toString() && styles.categoryButtonTextActive
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Price and Unit */}
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Price per Unit *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                value={formData.price_per_unit}
                onChangeText={(value) => handleInputChange('price_per_unit', value)}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Unit Type *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {unitTypes.map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[
                      styles.unitButton,
                      formData.unit_type === unit && styles.unitButtonActive
                    ]}
                    onPress={() => handleInputChange('unit_type', unit)}
                  >
                    <Text style={[
                      styles.unitButtonText,
                      formData.unit_type === unit && styles.unitButtonTextActive
                    ]}>
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Quantity Available */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quantity Available *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter quantity"
              placeholderTextColor="#9CA3AF"
              value={formData.quantity_available}
              onChangeText={(value) => handleInputChange('quantity_available', value)}
              keyboardType="numeric"
            />
          </View>

          {/* Organic Toggle */}
          <View style={styles.organicSection}>
            <TouchableOpacity
              style={styles.organicToggle}
              onPress={() => handleInputChange('is_organic', !formData.is_organic)}
            >
              <View style={[
                styles.checkbox,
                formData.is_organic && styles.checkboxActive
              ]}>
                {formData.is_organic && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
              <Text style={styles.organicText}>This is an organic product</Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>
                Add Product
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 16,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  imageSection: {
    marginBottom: 24,
  },
  imagePicker: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  imageContainer: {
    width: 128,
    height: 128,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlayText: {
    color: 'white',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  selectedImage: {
    width: 128,
    height: 128,
    borderRadius: 8,
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#6b7280',
    marginTop: 8,
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#1f2937',
  },
  textArea: {
    height: 96,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'white',
    marginRight: 12,
  },
  categoryButtonActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'white',
    marginRight: 8,
  },
  unitButtonActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  unitButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  unitButtonTextActive: {
    color: 'white',
  },
  organicSection: {
    marginBottom: 24,
  },
  organicToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  organicText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  submitButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
