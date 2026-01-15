import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { productsAPI, categoriesAPI } from '../../services/api';

export default function HomeScreen() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const { token, user } = useAuth();
  const { addToCart, getItemQuantity } = useCart();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        productsAPI.getProducts({}, token),
        categoriesAPI.getCategories()
      ]);
      
      setProducts(productsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    Alert.alert(
      'Added to Cart',
      `${product.name} has been added to your cart`,
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome back, {user?.first_name}!
        </Text>
        <Text style={styles.subtitleText}>
          Fresh produce from local farmers
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <View style={styles.searchInput}>
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchTextInput}
              placeholder="Search for products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.categoryButton, !selectedCategory && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.categoryButtonText, !selectedCategory && styles.categoryButtonTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryButton, selectedCategory === category.id && styles.categoryButtonActive]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={[styles.categoryButtonText, selectedCategory === category.id && styles.categoryButtonTextActive]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products Grid */}
      <View style={styles.productsContainer}>
        <Text style={styles.sectionTitle}>
          Fresh Products ({filteredProducts.length})
        </Text>
        
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="leaf-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>
              No products found matching your criteria
            </Text>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {filteredProducts.map(product => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
              >
                {/* Product Image */}
                <View style={styles.productImageContainer}>
                  {product.image_uri ? (
                    <Image 
                      source={{ uri: product.image_uri }} 
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="leaf" size={40} color="#9CA3AF" />
                  )}
                  {product.is_organic && (
                    <View style={styles.organicBadge}>
                      <Text style={styles.organicBadgeText}>Organic</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.productInfo}>
                  <View style={styles.productHeader}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {product.name}
                    </Text>
                  </View>
                  
                  <Text style={styles.productDescription} numberOfLines={2}>
                    {product.description}
                  </Text>
                  
                  <View style={styles.productFooter}>
                    <View style={styles.priceContainer}>
                      <Text style={styles.price}>
                        ${product.price_per_unit}/{product.unit_type}
                      </Text>
                      <Text style={styles.availability}>
                        {product.quantity_available} available
                      </Text>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => handleAddToCart(product)}
                    >
                      <Ionicons name="add" size={16} color="white" />
                      {getItemQuantity(product.id) > 0 && (
                        <View style={styles.cartBadge}>
                          <Text style={styles.cartBadgeText}>
                            {getItemQuantity(product.id)}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  welcomeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  subtitleText: {
    color: '#bbf7d0',
    fontSize: 14,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginTop: -12,
    marginBottom: 16,
  },
  searchBar: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchTextInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  categoryButton: {
    marginRight: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  categoryButtonActive: {
    backgroundColor: '#16a34a',
  },
  categoryButtonText: {
    fontWeight: '500',
    color: '#6b7280',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  productsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  productImageContainer: {
    height: 128,
    backgroundColor: '#f3f4f6',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  organicBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  organicBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  productInfo: {
    padding: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  productDescription: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 12,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    color: '#16a34a',
    fontWeight: 'bold',
    fontSize: 18,
  },
  availability: {
    color: '#6b7280',
    fontSize: 12,
  },
  addButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});