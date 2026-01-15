import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function AnalyticsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const { user } = useAuth();

  // Mock analytics data
  const [analyticsData, setAnalyticsData] = useState({
    totalSales: 2450.75,
    totalOrders: 34,
    totalProducts: 12,
    avgOrderValue: 72.08,
    topProducts: [
      { name: 'Organic Tomatoes', sales: 450.50, orders: 8 },
      { name: 'Fresh Lettuce', sales: 320.25, orders: 12 },
      { name: 'Bell Peppers', sales: 280.00, orders: 6 },
    ],
    salesTrend: [
      { day: 'Mon', sales: 320 },
      { day: 'Tue', sales: 450 },
      { day: 'Wed', sales: 280 },
      { day: 'Thu', sales: 380 },
      { day: 'Fri', sales: 520 },
      { day: 'Sat', sales: 680 },
      { day: 'Sun', sales: 420 },
    ]
  });

  useEffect(() => {
    // Simulate loading analytics data
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, [timeRange]);

  const timeRanges = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'quarter', label: 'This Quarter' },
    { key: 'year', label: 'This Year' }
  ];

  const StatCard = ({ title, value, icon, color, change }) => (
    <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <View className={`w-10 h-10 ${color} rounded-full items-center justify-center`}>
          <Ionicons name={icon} size={20} color="white" />
        </View>
        {change && (
          <View className={`px-2 py-1 rounded-full ${change > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
            <Text className={`text-xs font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}%
            </Text>
          </View>
        )}
      </View>
      <Text className="text-2xl font-bold text-gray-800">{value}</Text>
      <Text className="text-gray-600 text-sm">{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16a34a" />
          <Text className="mt-4 text-gray-600">Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#374151" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-gray-800 ml-4">Analytics</Text>
            </View>
            <TouchableOpacity className="p-2">
              <Ionicons name="download-outline" size={24} color="#16a34a" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6 py-6">
          {/* Time Range Selector */}
          <View className="mb-6">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {timeRanges.map((range) => (
                <TouchableOpacity
                  key={range.key}
                  className={`mr-3 px-4 py-2 rounded-full ${
                    timeRange === range.key
                      ? 'bg-primary-600'
                      : 'bg-white border border-gray-300'
                  }`}
                  onPress={() => setTimeRange(range.key)}
                >
                  <Text className={`font-medium ${
                    timeRange === range.key ? 'text-white' : 'text-gray-600'
                  }`}>
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Key Metrics */}
          <View className="flex-row flex-wrap justify-between mb-6">
            <View className="w-[48%]">
              <StatCard
                title="Total Sales"
                value={`$${analyticsData.totalSales.toFixed(2)}`}
                icon="cash"
                color="bg-green-500"
                change={12.5}
              />
            </View>
            <View className="w-[48%]">
              <StatCard
                title="Total Orders"
                value={analyticsData.totalOrders}
                icon="receipt"
                color="bg-blue-500"
                change={8.3}
              />
            </View>
            <View className="w-[48%]">
              <StatCard
                title="Active Products"
                value={analyticsData.totalProducts}
                icon="leaf"
                color="bg-primary-500"
                change={-2.1}
              />
            </View>
            <View className="w-[48%]">
              <StatCard
                title="Avg Order Value"
                value={`$${analyticsData.avgOrderValue.toFixed(2)}`}
                icon="trending-up"
                color="bg-purple-500"
                change={15.7}
              />
            </View>
          </View>

          {/* Sales Trend Chart */}
          <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Sales Trend</Text>
            <View className="flex-row items-end justify-between h-32">
              {analyticsData.salesTrend.map((item, index) => {
                const maxSales = Math.max(...analyticsData.salesTrend.map(d => d.sales));
                const height = (item.sales / maxSales) * 100;
                return (
                  <View key={index} className="items-center flex-1">
                    <View
                      className="bg-primary-500 rounded-t w-6 mb-2"
                      style={{ height: `${height}%` }}
                    />
                    <Text className="text-xs text-gray-600">{item.day}</Text>
                    <Text className="text-xs font-medium text-gray-800">${item.sales}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Top Products */}
          <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Top Products</Text>
            {analyticsData.topProducts.map((product, index) => (
              <View key={index} className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <View className="flex-1">
                  <Text className="font-medium text-gray-800">{product.name}</Text>
                  <Text className="text-sm text-gray-600">{product.orders} orders</Text>
                </View>
                <Text className="font-bold text-primary-600">${product.sales.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</Text>
            <View className="space-y-3">
              <TouchableOpacity className="flex-row items-center p-3 bg-gray-50 rounded-lg">
                <Ionicons name="document-text" size={20} color="#16a34a" />
                <Text className="ml-3 font-medium text-gray-800">Generate Report</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center p-3 bg-gray-50 rounded-lg">
                <Ionicons name="share" size={20} color="#16a34a" />
                <Text className="ml-3 font-medium text-gray-800">Share Analytics</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center p-3 bg-gray-50 rounded-lg">
                <Ionicons name="settings" size={20} color="#16a34a" />
                <Text className="ml-3 font-medium text-gray-800">Analytics Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}