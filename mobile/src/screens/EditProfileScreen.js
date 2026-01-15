import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';

export default function EditProfileScreen({ navigation }) {
  const { user, token, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const loadProfileImage = async () => {
    try {
      if (user?.id) {
        const storedImageUri = await AsyncStorage.getItem(`profile_image_${user.id}`);
        if (storedImageUri) {
          setProfileImage({ uri: storedImageUri });
        } else if (user?.profile_image) {
          setProfileImage({ uri: user.profile_image });
        } else {
          setProfileImage(null);
        }
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
    }
  };

  // Load profile image from storage
  useEffect(() => {
    loadProfileImage();
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
      });
      loadProfileImage();
    }
  }, [user]);

  // Refresh user data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (user) {
        setFormData({
          firstName: user?.first_name || '',
          lastName: user?.last_name || '',
          email: user?.email || '',
          phone: user?.phone || '',
        });
        loadProfileImage();
      }
    });
    return unsubscribe;
  }, [navigation, user]);

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

    if (!result.canceled && result.assets && result.assets[0]) {
      const selectedImage = result.assets[0];
      setProfileImage(selectedImage);
      
      // Save image URI to AsyncStorage for persistence
      try {
        await AsyncStorage.setItem(`profile_image_${user?.id}`, selectedImage.uri);
        
        // Also update user context with image URI
        if (updateUser) {
          await updateUser({
            ...user,
            profile_image: selectedImage.uri,
          });
        }
      } catch (error) {
        console.error('Error saving profile image:', error);
        Alert.alert('Warning', 'Image selected but could not be saved. Please try again.');
      }
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.firstName || !formData.lastName) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }

    // Validate name length
    if (formData.firstName.trim().length < 2) {
      Alert.alert('Error', 'First name must be at least 2 characters');
      return;
    }

    if (formData.lastName.trim().length < 2) {
      Alert.alert('Error', 'Last name must be at least 2 characters');
      return;
    }

    // Validate email format (if provided)
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Validate phone number format (if provided)
    if (formData.phone && formData.phone.trim().length > 0) {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        Alert.alert('Error', 'Please enter a valid phone number');
        return;
      }
    }

    setLoading(true);
    try {
      const profileData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone: formData.phone?.trim() || null,
      };

      const response = await profileAPI.updateProfile(profileData, token);
      
      // Update user in context (including profile image if selected)
      if (updateUser) {
        await updateUser({
          ...user,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone || user?.phone,
          profile_image: profileImage?.uri || user?.profile_image,
        });
      }
      
      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [{ 
          text: 'OK', 
          onPress: () => {
            // Refresh the profile screen
            navigation.goBack();
          }
        }]
      );
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to update profile';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            disabled={loading}
            style={styles.saveButton}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#16a34a" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Profile Picture */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarButton}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage.uri }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                  </Text>
                </View>
              )}
              (iOS)
              
              › Using Expo Go
              › Press s │ switch to development build
              
              › Press a │ open Android
              › Press w │ open web
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={16} color="white" />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Tap to change photo</Text>
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  placeholder="First name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={[styles.inputGroup, styles.inputGroupRight]}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  placeholder="Last name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.inputGroupFull}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.emailContainer}>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={formData.email}
                  editable={false}
                  placeholder="Email address"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Ionicons name="lock-closed" size={16} color="#9CA3AF" style={styles.lockIcon} />
              </View>
              <Text style={styles.hint}>Email cannot be changed for security reasons</Text>
            </View>

            <View style={styles.inputGroupFull}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                placeholder="Enter your phone number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={15}
              />
              <Text style={styles.hint}>Optional - Add your phone number for order updates</Text>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButtonFull, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonFullText}>Save Changes</Text>
            )}
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginLeft: 8,
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: '#16a34a',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarButton: {
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    backgroundColor: '#16a34a',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    backgroundColor: '#16a34a',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  avatarHint: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 8,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 24,
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
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputGroupRight: {
    marginLeft: 12,
  },
  inputGroupFull: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: 'white',
  },
  inputDisabled: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
  },
  emailContainer: {
    position: 'relative',
  },
  lockIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  saveButtonFull: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonFullText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
