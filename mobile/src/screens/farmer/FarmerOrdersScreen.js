import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FarmerOrdersScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 justify-center items-center px-6">
        <Ionicons name="receipt-outline" size={80} color="#9CA3AF" />
        <Text className="text-xl font-semibold text-gray-800 mt-4 mb-2">
          No orders yet
        </Text>
        <Text className="text-gray-600 text-center">
          Customer orders will appear here once you start receiving them
        </Text>
      </View>
    </SafeAreaView>
  );
}