import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HelpSupportScreen({ navigation }) {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });

  const faqData = [
    {
      id: 1,
      question: "How do I add a new product?",
      answer: "To add a new product, go to your farmer dashboard and tap 'Add New Product'. Fill in all the required information including product name, description, price, and upload at least one image."
    },
    {
      id: 2,
      question: "How do customers place orders?",
      answer: "Customers can browse your products, add them to cart, and place orders directly through the app. You'll receive notifications for new orders and can manage them from your dashboard."
    },
    {
      id: 3,
      question: "How do I update my product prices?",
      answer: "Go to your products list, select the product you want to update, and tap 'Edit'. You can modify the price, quantity, and other details from there."
    },
    {
      id: 4,
      question: "What payment methods are supported?",
      answer: "We support various payment methods including credit/debit cards, PayPal, and cash on delivery. Payments are processed securely through our platform."
    },
    {
      id: 5,
      question: "How do I track my sales?",
      answer: "Use the Analytics section in your farmer dashboard to view detailed sales reports, track performance, and see your top-selling products."
    },
    {
      id: 6,
      question: "Can I set delivery areas?",
      answer: "Yes, you can specify your delivery areas in your profile settings. This helps customers know if you deliver to their location."
    }
  ];

  const contactOptions = [
    {
      title: "Email Support",
      description: "Get help via email",
      icon: "mail",
      action: () => Linking.openURL('mailto:support@farmermarketplace.com')
    },
    {
      title: "Phone Support",
      description: "Call us for immediate help",
      icon: "call",
      action: () => Linking.openURL('tel:+1234567890')
    },
    {
      title: "Live Chat",
      description: "Chat with our support team",
      icon: "chatbubble",
      action: () => Alert.alert('Live Chat', 'Live chat feature coming soon!')
    },
    {
      title: "Community Forum",
      description: "Connect with other farmers",
      icon: "people",
      action: () => Alert.alert('Forum', 'Community forum coming soon!')
    }
  ];

  const handleSubmitContact = () => {
    if (!contactForm.subject || !contactForm.message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    Alert.alert(
      'Message Sent',
      'Thank you for contacting us. We\'ll get back to you within 24 hours.',
      [{ text: 'OK', onPress: () => {
        setContactForm({ subject: '', message: '' });
      }}]
    );
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
            <Text className="text-xl font-bold text-gray-800 ml-4">Help & Support</Text>
          </View>
        </View>

        <View className="px-6 py-6">
          {/* Quick Contact Options */}
          <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Contact Us</Text>
            <View className="space-y-3">
              {contactOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  className="flex-row items-center p-3 bg-gray-50 rounded-lg"
                  onPress={option.action}
                >
                  <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name={option.icon} size={20} color="#16a34a" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-gray-800">{option.title}</Text>
                    <Text className="text-sm text-gray-600">{option.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* FAQ Section */}
          <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Frequently Asked Questions</Text>
            <View className="space-y-3">
              {faqData.map((faq) => (
                <View key={faq.id} className="border-b border-gray-100 last:border-b-0">
                  <TouchableOpacity
                    className="py-3 flex-row items-center justify-between"
                    onPress={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  >
                    <Text className="flex-1 font-medium text-gray-800 pr-4">{faq.question}</Text>
                    <Ionicons
                      name={expandedFAQ === faq.id ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                  {expandedFAQ === faq.id && (
                    <View className="pb-3">
                      <Text className="text-gray-600 leading-6">{faq.answer}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Contact Form */}
          <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Send us a Message</Text>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Subject</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="What can we help you with?"
                value={contactForm.subject}
                onChangeText={(value) => setContactForm(prev => ({ ...prev, subject: value }))}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Message</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base h-24"
                placeholder="Describe your issue or question..."
                value={contactForm.message}
                onChangeText={(value) => setContactForm(prev => ({ ...prev, message: value }))}
                multiline
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              className="bg-primary-600 py-3 rounded-lg"
              onPress={handleSubmitContact}
            >
              <Text className="text-white font-semibold text-center">Send Message</Text>
            </TouchableOpacity>
          </View>

          {/* Additional Resources */}
          <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Additional Resources</Text>
            <View className="space-y-3">
              <TouchableOpacity className="flex-row items-center p-3 bg-gray-50 rounded-lg">
                <Ionicons name="document-text" size={20} color="#16a34a" />
                <Text className="ml-3 font-medium text-gray-800">User Guide</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center p-3 bg-gray-50 rounded-lg">
                <Ionicons name="play-circle" size={20} color="#16a34a" />
                <Text className="ml-3 font-medium text-gray-800">Video Tutorials</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center p-3 bg-gray-50 rounded-lg">
                <Ionicons name="shield-checkmark" size={20} color="#16a34a" />
                <Text className="ml-3 font-medium text-gray-800">Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center p-3 bg-gray-50 rounded-lg">
                <Ionicons name="document" size={20} color="#16a34a" />
                <Text className="ml-3 font-medium text-gray-800">Terms of Service</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}