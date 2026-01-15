import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Import working screens
import ProfileScreen from '../screens/ProfileScreen';
import HomeScreen from '../screens/customer/HomeScreen';
import CartScreen from '../screens/customer/CartScreen';
import OrdersScreen from '../screens/customer/OrdersScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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
          component={ProfileScreen}
          options={{ title: 'Profile' }}
        />
      </Tab.Navigator>
    );
  }

  if (isCustomer) {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Cart') {
              iconName = focused ? 'cart' : 'cart-outline';
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
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Cart" component={CartScreen} />
        <Tab.Screen name="Orders" component={OrdersScreen} />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ title: 'Profile' }}
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
});