import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI } from '../../services/api';

export default function CartScreen({ navigation }) {
  const { 
    cartItems, 
    removeFromCart, 
    incrementQuantity, 
    decrementQuantity,
    subtotal,
    tax,
    deliveryFee,
    total,
    itemCount,
    clearCart
  } = useCart();
  
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');

  const handleRemoveItem = (productId, productName) => {
    Alert.alert(
      'Remove Item',
      `Remove ${productName} from cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeFromCart(productId)
        }
      ]
    );
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    
    Alert.alert(
      'Clear Cart',
      'Remove all items from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => clearCart()
        }
      ]
    );
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    if (!deliveryAddress.trim()) {
      Alert.alert('Error', 'Please enter a delivery address');
      return;
    }

    Alert.alert(
      'Confirm Order',
      `Total: $${total.toFixed(2)}\n\nProceed with checkout?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            try {
              // Prepare order items
              const orderItems = cartItems.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
              }));

              // Create order
              const orderData = {
                items: orderItems,
                delivery_address: deliveryAddress.trim(),
                notes: notes.trim() || null,
              };

              const response = await ordersAPI.createOrder(orderData, token);
              
              // Get order ID from response
              const orderId = response.data?.id || response.data?.id || 'N/A';
              
              // Clear cart after successful order
              clearCart();
              setDeliveryAddress('');
              setNotes('');

              Alert.alert(
                'Order Placed!',
                `Your order #${orderId} has been placed successfully!`,
                [
                  {
                    text: 'View Orders',
                    onPress: () => {
                      // Small delay to ensure order is saved
                      setTimeout(() => {
                        navigation.navigate('Orders');
                      }, 500);
                    }
                  },
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate('Home')
                  }
                ]
              );
            } catch (error) {
              const errorMessage = error.response?.data?.detail || error.message || 'Failed to place order';
              Alert.alert('Error', errorMessage);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContent}>
          <Ionicons name="cart-outline" size={80} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>
            Your cart is empty
          </Text>
          <Text style={styles.emptySubtitle}>
            Add some fresh products from local farmers to get started
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header with Clear Cart */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </Text>
          <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear Cart</Text>
          </TouchableOpacity>
        </View>

        {/* Cart Items */}
        <View style={styles.itemsContainer}>
          {cartItems.map((item) => {
            const itemTotal = item.price_per_unit * item.quantity;
            return (
              <View key={item.id} style={styles.cartItem}>
                {/* Product Image */}
                <View style={styles.itemImageContainer}>
                  {item.image_uri ? (
                    <Image 
                      source={{ uri: item.image_uri }} 
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.itemImagePlaceholder}>
                      <Ionicons name="leaf" size={32} color="#9CA3AF" />
                    </View>
                  )}
                </View>

                {/* Product Info */}
                <View style={styles.itemInfo}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => handleRemoveItem(item.id, item.name)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close" size={20} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.itemDescription} numberOfLines={1}>
                    {item.description}
                  </Text>

                  <View style={styles.itemDetails}>
                    <Text style={styles.itemPrice}>
                      ${item.price_per_unit.toFixed(2)}/{item.unit_type}
                    </Text>
                    {item.is_organic && (
                      <View style={styles.organicTag}>
                        <Text style={styles.organicTagText}>Organic</Text>
                      </View>
                    )}
                  </View>

                  {/* Quantity Controls */}
                  <View style={styles.quantityContainer}>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => decrementQuantity(item.id)}
                      >
                        <Ionicons name="remove" size={18} color="#16a34a" />
                      </TouchableOpacity>
                      
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => incrementQuantity(item.id)}
                      >
                        <Ionicons name="add" size={18} color="#16a34a" />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.itemTotal}>
                      ${itemTotal.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Delivery Information */}
        <View style={styles.deliveryContainer}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Delivery Address *</Text>
            <TextInput
              style={styles.textInput}
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              placeholder="Enter your delivery address"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any special instructions?"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Checkout Button */}
        <TouchableOpacity 
          style={[styles.checkoutButton, loading && styles.checkoutButtonDisabled]}
          onPress={handleCheckout}
          disabled={loading || cartItems.length === 0}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>
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
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#6b7280',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  clearButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
  },
  itemsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    marginRight: 12,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#16a34a',
    marginRight: 8,
  },
  organicTag: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  organicTagText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
  },
  quantityButton: {
    padding: 6,
    backgroundColor: '#f9fafb',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    paddingHorizontal: 16,
    minWidth: 40,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  summaryContainer: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 24,
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  deliveryContainer: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
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
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: 'white',
    textAlignVertical: 'top',
  },
  checkoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutButtonDisabled: {
    opacity: 0.6,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});
