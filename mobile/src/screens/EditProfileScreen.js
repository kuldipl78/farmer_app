import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';

export default function EditProfileScreen({ navigation }) {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zipCode: user?.zip_code || '',
    farmName: user?.farm_name || '',
    farmSize: user?.farm_size || '',
    farmingExperience: user?.farming_experience || '',
    specialties: user?.specialties || '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to change profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0]);
    }
  };

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        // Note: Backend currently only supports first_name, last_name, and phone
        // Additional fields would need backend support
      };

      await profileAPI.updateProfile(profileData, token);
      
      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to update profile';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
              <Text className="text-xl font-bold text-gray-800 ml-4">Edit Profile</Text>
            </View>
            <TouchableOpacity onPress={handleSave} disabled={loading}>
              <Text className="text-primary-600 font-semibold">Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6 py-6">
          {/* Profile Picture */}
          <View className="items-center mb-8">
            <TouchableOpacity onPress={pickImage} className="relative">
              {profileImage ? (
                <Image
                  source={{ uri: profileImage.uri }}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <View className="w-24 h-24 bg-primary-600 rounded-full items-center justify-center">
                  <Text className="text-white text-2xl font-bold">
                    {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                  </Text>
                </View>
              )}
              <View className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 rounded-full items-center justify-center border-2 border-white">
                <Ionicons name="camera" size={16} color="white" />
              </View>
            </TouchableOpacity>
            <Text className="text-gray-600 mt-2">Tap to change photo</Text>
          </View>

          {/* Basic Information */}
          <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Basic Information</Text>
            
            <View className="flex-row space-x-4 mb-4">
              <View className="flex-1">
                <Text className="text-gray-700 mb-2 font-medium">First Name *</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  placeholder="First name"
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 mb-2 font-medium">Last Name *</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  placeholder="Last name"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Email *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="Email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Phone</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                placeholder="Phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Bio</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base h-20"
                value={formData.bio}
                onChangeText={(value) => handleInputChange('bio', value)}
                placeholder="Tell us about yourself..."
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Address Information */}
          <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Address</Text>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Street Address</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                value={formData.address}
                onChangeText={(value) => handleInputChange('address', value)}
                placeholder="Street address"
              />
            </View>

            <View className="flex-row space-x-4 mb-4">
              <View className="flex-1">
                <Text className="text-gray-700 mb-2 font-medium">City</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                  value={formData.city}
                  onChangeText={(value) => handleInputChange('city', value)}
                  placeholder="City"
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 mb-2 font-medium">State</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                  value={formData.state}
                  onChangeText={(value) => handleInputChange('state', value)}
                  placeholder="State"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">ZIP Code</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                value={formData.zipCode}
                onChangeText={(value) => handleInputChange('zipCode', value)}
                placeholder="ZIP code"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Farm Information (for farmers) */}
          {user?.role === 'farmer' && (
            <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-4">Farm Information</Text>
              
              <View className="mb-4">
                <Text className="text-gray-700 mb-2 font-medium">Farm Name</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                  value={formData.farmName}
                  onChangeText={(value) => handleInputChange('farmName', value)}
                  placeholder="Your farm name"
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2 font-medium">Farm Size (acres)</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                  value={formData.farmSize}
                  onChangeText={(value) => handleInputChange('farmSize', value)}
                  placeholder="Farm size in acres"
                  keyboardType="numeric"
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2 font-medium">Years of Experience</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                  value={formData.farmingExperience}
                  onChangeText={(value) => handleInputChange('farmingExperience', value)}
                  placeholder="Years of farming experience"
                  keyboardType="numeric"
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2 font-medium">Specialties</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base h-20"
                  value={formData.specialties}
                  onChangeText={(value) => handleInputChange('specialties', value)}
                  placeholder="What do you specialize in growing?"
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity
            className="bg-primary-600 py-4 rounded-lg mb-6"
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-semibold text-center">
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}