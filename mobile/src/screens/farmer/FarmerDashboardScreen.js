import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { productsAPI, ordersAPI } from '../../services/api';

export default function FarmerDashboardScreen({ navigation }) {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    activeProducts: 0,
    pendingOrders: 0,
    totalSales: 0,
    reviews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Refresh data when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadDashboardData();
    });
    
    return unsubscribe;
  }, [navigation, token]);

  const loadDashboardData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch products and orders in parallel
      const [productsResponse, ordersResponse] = await Promise.all([
        productsAPI.getMyProducts(token).catch(() => ({ data: [] })),
        ordersAPI.getOrders(token).catch(() => ({ data: [] }))
      ]);

      const products = Array.isArray(productsResponse.data) ? productsResponse.data : [];
      const orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];

      // Calculate active products (products with quantity > 0)
      const activeProducts = products.filter(p => p.quantity_available > 0).length;

      // Calculate pending orders
      const pendingOrders = orders.filter(o => 
        o.status?.toLowerCase() === 'pending'
      ).length;

      // Calculate total sales (sum of delivered/completed orders)
      const totalSales = orders
        .filter(o => {
          const status = o.status?.toLowerCase();
          return status === 'delivered' || status === 'completed' || status === 'confirmed';
        })
        .reduce((sum, order) => {
          const amount = parseFloat(order.total_amount) || 0;
          return sum + amount;
        }, 0);

      // Reviews count (placeholder - can be updated when reviews API is available)
      const reviews = 0;

      setStats({
        activeProducts,
        pendingOrders,
        totalSales,
        reviews,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    { 
      title: 'Active Products', 
      value: loading ? '...' : stats.activeProducts.toString(), 
      icon: 'leaf', 
      color: '#22c55e' 
    },
    { 
      title: 'Pending Orders', 
      value: loading ? '...' : stats.pendingOrders.toString(), 
      icon: 'time', 
      color: '#eab308' 
    },
    { 
      title: 'Total Sales', 
      value: loading ? '...' : `$${stats.totalSales.toFixed(2)}`, 
      icon: 'cash', 
      color: '#3b82f6' 
    },
    { 
      title: 'Reviews', 
      value: loading ? '...' : stats.reviews.toString(), 
      icon: 'star', 
      color: '#a855f7' 
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Welcome back, {user?.first_name}!
          </Text>
          <Text style={styles.headerSubtitle}>
            Manage your farm and connect with customers
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            {statsData.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={styles.statContent}>
                  <View style={styles.statInfo}>
                    {loading ? (
                      <ActivityIndicator size="small" color="#1f2937" />
                    ) : (
                      <Text style={styles.statValue}>{stat.value}</Text>
                    )}
                    <Text style={styles.statTitle}>{stat.title}</Text>
                  </View>
                  <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                    <Ionicons name={stat.icon} size={24} color="white" />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsCard}>
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('AddProduct')}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="add" size={20} color="#16a34a" />
              </View>
              <Text style={styles.actionText}>Add New Product</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionItem, styles.actionItemBorder]}
              onPress={() => navigation.navigate('Analytics')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#dbeafe' }]}>
                <Ionicons name="analytics" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.actionText}>View Analytics</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="storefront" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.actionText}>Update Farm Profile</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityContent}>
              <Ionicons name="time-outline" size={48} color="#9CA3AF" />
              <Text style={styles.activityText}>
                No recent activity
              </Text>
              <Text style={styles.activitySubtext}>
                Your recent orders and updates will appear here
              </Text>
            </View>
          </View>
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
    backgroundColor: '#16a34a',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  headerSubtitle: {
    color: '#dcfce7',
    fontSize: 14,
    marginTop: 4,
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginTop: -12,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statTitle: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionsCard: {
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
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  actionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#dcfce7',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  activityContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activityContent: {
    alignItems: 'center',
  },
  activityText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
  },
  activitySubtext: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
});
