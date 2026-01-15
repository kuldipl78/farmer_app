import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen({ navigation }) {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      bio: "Former agricultural engineer with 15+ years of experience helping farmers adopt technology."
    },
    {
      name: "Mike Chen",
      role: "CTO",
      bio: "Tech entrepreneur passionate about sustainable agriculture and connecting communities."
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Operations",
      bio: "Supply chain expert focused on reducing food waste and supporting local farmers."
    }
  ];

  const features = [
    {
      icon: "leaf",
      title: "Direct Farm-to-Table",
      description: "Connect directly with local farmers for the freshest produce"
    },
    {
      icon: "shield-checkmark",
      title: "Quality Guaranteed",
      description: "All products are verified for quality and freshness"
    },
    {
      icon: "people",
      title: "Community Focused",
      description: "Supporting local farmers and building stronger communities"
    },
    {
      icon: "earth",
      title: "Sustainable Practices",
      description: "Promoting environmentally friendly farming methods"
    }
  ];

  const handleLinkPress = (url) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-800 ml-4">About</Text>
          </View>
        </View>

        <View className="px-6 py-6">
          {/* App Info */}
          <View className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6 items-center">
            <View className="w-20 h-20 bg-primary-600 rounded-full items-center justify-center mb-4">
              <Ionicons name="leaf" size={40} color="white" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-2">Farmer Marketplace</Text>
            <Text className="text-gray-600 text-center mb-4">
              Connecting farmers directly with customers for fresh, local produce
            </Text>
            <View className="bg-primary-100 px-3 py-1 rounded-full">
              <Text className="text-primary-600 font-medium">Version 1.0.0</Text>
            </View>
          </View>

          {/* Mission Statement */}
          <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Our Mission</Text>
            <Text className="text-gray-600 leading-6">
              We believe in creating a sustainable food system that benefits both farmers and consumers. 
              Our platform eliminates middlemen, ensuring farmers get fair prices while customers enjoy 
              fresh, locally-grown produce at competitive rates.
            </Text>
          </View>

          {/* Key Features */}
          <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">What We Offer</Text>
            <View className="space-y-4">
              {features.map((feature, index) => (
                <View key={index} className="flex-row items-start">
                  <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-3 mt-1">
                    <Ionicons name={feature.icon} size={20} color="#16a34a" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-800 mb-1">{feature.title}</Text>
                    <Text className="text-gray-600 text-sm">{feature.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Team Section */}
          <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Meet Our Team</Text>
            <View className="space-y-4">
              {teamMembers.map((member, index) => (
                <View key={index} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                  <View className="flex-row items-center mb-2">
                    <View className="w-12 h-12 bg-primary-600 rounded-full items-center justify-center mr-3">
                      <Text className="text-white font-bold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                    <View>
                      <Text className="font-semibold text-gray-800">{member.name}</Text>
                      <Text className="text-primary-600 text-sm">{member.role}</Text>
                    </View>
                  </View>
                  <Text className="text-gray-600 text-sm ml-15">{member.bio}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Statistics */}
          <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Our Impact</Text>
            <View className="flex-row flex-wrap justify-between">
              <View className="w-[48%] items-center p-4 bg-gray-50 rounded-lg mb-4">
                <Text className="text-2xl font-bold text-primary-600">500+</Text>
                <Text className="text-gray-600 text-center">Active Farmers</Text>
              </View>
              <View className="w-[48%] items-center p-4 bg-gray-50 rounded-lg mb-4">
                <Text className="text-2xl font-bold text-primary-600">10K+</Text>
                <Text className="text-gray-600 text-center">Happy Customers</Text>
              </View>
              <View className="w-[48%] items-center p-4 bg-gray-50 rounded-lg">
                <Text className="text-2xl font-bold text-primary-600">50K+</Text>
                <Text className="text-gray-600 text-center">Orders Delivered</Text>
              </View>
              <View className="w-[48%] items-center p-4 bg-gray-50 rounded-lg">
                <Text className="text-2xl font-bold text-primary-600">25</Text>
                <Text className="text-gray-600 text-center">Cities Served</Text>
              </View>
            </View>
          </View>

          {/* Contact & Social */}
          <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Connect With Us</Text>
            <View className="space-y-3">
              <TouchableOpacity
                className="flex-row items-center p-3 bg-gray-50 rounded-lg"
                onPress={() => handleLinkPress('https://farmermarketplace.com')}
              >
                <Ionicons name="globe" size={20} color="#16a34a" />
                <Text className="ml-3 text-gray-800">www.farmermarketplace.com</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-row items-center p-3 bg-gray-50 rounded-lg"
                onPress={() => handleLinkPress('mailto:info@farmermarketplace.com')}
              >
                <Ionicons name="mail" size={20} color="#16a34a" />
                <Text className="ml-3 text-gray-800">info@farmermarketplace.com</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-row items-center p-3 bg-gray-50 rounded-lg"
                onPress={() => handleLinkPress('https://twitter.com/farmermarket')}
              >
                <Ionicons name="logo-twitter" size={20} color="#16a34a" />
                <Text className="ml-3 text-gray-800">@farmermarket</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-row items-center p-3 bg-gray-50 rounded-lg"
                onPress={() => handleLinkPress('https://facebook.com/farmermarketplace')}
              >
                <Ionicons name="logo-facebook" size={20} color="#16a34a" />
                <Text className="ml-3 text-gray-800">Farmer Marketplace</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Legal */}
          <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Legal</Text>
            <View className="space-y-3">
              <TouchableOpacity className="flex-row items-center justify-between">
                <Text className="text-gray-800">Privacy Policy</Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center justify-between">
                <Text className="text-gray-800">Terms of Service</Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center justify-between">
                <Text className="text-gray-800">Cookie Policy</Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Copyright */}
          <View className="mt-6 items-center">
            <Text className="text-gray-500 text-sm">
              © 2024 Farmer Marketplace. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}