import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function FarmerDashboardScreen({ navigation }) {
  const { user } = useAuth();

  const stats = [
    { title: 'Active Products', value: '0', icon: 'leaf', color: 'bg-green-500' },
    { title: 'Pending Orders', value: '0', icon: 'time', color: 'bg-yellow-500' },
    { title: 'Total Sales', value: '$0', icon: 'cash', color: 'bg-blue-500' },
    { title: 'Reviews', value: '0', icon: 'star', color: 'bg-purple-500' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-primary-600 px-6 pt-4 pb-6">
          <Text className="text-white text-lg font-medium">
            Welcome back, {user?.first_name}!
          </Text>
          <Text className="text-primary-100 text-sm mt-1">
            Manage your farm and connect with customers
          </Text>
        </View>

        {/* Stats Grid */}
        <View className="px-6 -mt-3 mb-6">
          <View className="flex-row flex-wrap justify-between">
            {stats.map((stat, index) => (
              <View key={index} className="w-[48%] bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-2xl font-bold text-gray-800">{stat.value}</Text>
                    <Text className="text-gray-600 text-sm mt-1">{stat.title}</Text>
                  </View>
                  <View className={`w-12 h-12 ${stat.color} rounded-full items-center justify-center`}>
                    <Ionicons name={stat.icon} size={24} color="white" />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</Text>
          <View className="bg-white rounded-lg shadow-sm border border-gray-200">
            <TouchableOpacity 
              className="flex-row items-center px-4 py-4 border-b border-gray-100"
              onPress={() => navigation.navigate('AddProduct')}
            >
              <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center">
                <Ionicons name="add" size={20} color="#16a34a" />
              </View>
              <Text className="flex-1 ml-4 text-base text-gray-800">Add New Product</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center px-4 py-4 border-b border-gray-100"
              onPress={() => navigation.navigate('Analytics')}
            >
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                <Ionicons name="analytics" size={20} color="#3B82F6" />
              </View>
              <Text className="flex-1 ml-4 text-base text-gray-800">View Analytics</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center px-4 py-4"
              onPress={() => navigation.navigate('EditProfile')}
            >
              <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center">
                <Ionicons name="storefront" size={20} color="#F59E0B" />
              </View>
              <Text className="flex-1 ml-4 text-base text-gray-800">Update Farm Profile</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</Text>
          <View className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <View className="items-center">
              <Ionicons name="time-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 text-center mt-4">
                No recent activity
              </Text>
              <Text className="text-gray-400 text-sm text-center mt-1">
                Your recent orders and updates will appear here
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}