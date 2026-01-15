import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// Import working screens
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import HomeScreen from '../screens/customer/HomeScreen';
import CartScreen from '../screens/customer/CartScreen';
import OrdersScreen from '../screens/customer/OrdersScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Profile Stack Navigator
function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ 
          title: 'Edit Profile',
          headerStyle: { backgroundColor: '#16a34a' },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}

// Temporary placeholder screens for farmer
function FarmerDashboardScreen() {
  return (
    <View style={styles.placeholder}>
      <Ionicons name="analytics" size={60} color="#16a34a" />
      <Text style={styles.placeholderTitle}>Dashboard</Text>
      <Text style={styles.placeholderText}>Farmer dashboard and analytics</Text>
    </View>
  );
}

function FarmerProductsScreen() {
  return (
    <View style={styles.placeholder}>
      <Ionicons name="leaf" size={60} color="#16a34a" />
      <Text style={styles.placeholderTitle}>My Products</Text>
      <Text style={styles.placeholderText}>Manage your products</Text>
    </View>
  );
}

export default function MainNavigator() {
  const { isFarmer, isCustomer } = useAuth();
  const cart = useCart(); // CartProvider wraps the app, so this is safe

  if (isFarmer) {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Dashboard') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Products') {
              iconName = focused ? 'leaf' : 'leaf-outline';
            } else if (route.name === 'Orders') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#16a34a',
          tabBarInactiveTintColor: 'gray',
          headerStyle: {
            backgroundColor: '#16a34a',
          },
          headerTintColor: '#fff',
        })}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={FarmerDashboardScreen}
          options={{ title: 'Dashboard' }}
        />
        <Tab.Screen 
          name="Products" 
          component={FarmerProductsScreen}
          options={{ title: 'My Products' }}
        />
        <Tab.Screen 
          name="Orders" 
          component={OrdersScreen}
          options={{ title: 'Orders' }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileStack}
          options={{ title: 'Profile', headerShown: false }}
        />
      </Tab.Navigator>
    );
  }

  if (isCustomer) {
    const CartIconWithBadge = ({ focused, color, size }) => {
      const itemCount = cart?.itemCount || 0;
      return (
        <View style={styles.iconContainer}>
          <Ionicons name={focused ? 'cart' : 'cart-outline'} size={size} color={color} />
          {itemCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {itemCount > 99 ? '99+' : itemCount}
              </Text>
            </View>
          )}
        </View>
      );
    };

    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            } else if (route.name === 'Cart') {
              return <CartIconWithBadge focused={focused} color={color} size={size} />;
            } else if (route.name === 'Orders') {
              iconName = focused ? 'list' : 'list-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#16a34a',
          tabBarInactiveTintColor: 'gray',
          headerStyle: {
            backgroundColor: '#16a34a',
          },
          headerTintColor: '#fff',
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Cart" component={CartScreen} />
        <Tab.Screen name="Orders" component={OrdersScreen} />
        <Tab.Screen 
          name="Profile" 
          component={ProfileStack}
          options={{ title: 'Profile', headerShown: false }}
        />
      </Tab.Navigator>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});