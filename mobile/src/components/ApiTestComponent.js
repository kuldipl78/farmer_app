/**
 * API Test Component
 * Use this component to test API connectivity and registration
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { testApiConnectivity, testRegistration } from '../utils/apiTest';
import { authAPI } from '../services/api';

const ApiTestComponent = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addTestResult = (result) => {
    setTestResults(prev => [...prev, { ...result, timestamp: new Date().toLocaleTimeString() }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const runConnectivityTest = async () => {
    setLoading(true);
    addTestResult({ type: 'info', message: '🧪 Starting connectivity test...' });
    
    try {
      const result = await testApiConnectivity();
      addTestResult({
        type: result.success ? 'success' : 'error',
        message: result.message
      });
    } catch (error) {
      addTestResult({
        type: 'error',
        message: `Connectivity test failed: ${error.message}`
      });
    }
    
    setLoading(false);
  };

  const runRegistrationTest = async () => {
    setLoading(true);
    addTestResult({ type: 'info', message: '🧪 Starting registration test...' });
    
    try {
      const result = await testRegistration();
      addTestResult({
        type: result.success ? 'success' : 'error',
        message: result.success ? 'Registration test successful!' : result.message
      });
    } catch (error) {
      addTestResult({
        type: 'error',
        message: `Registration test failed: ${error.message}`
      });
    }
    
    setLoading(false);
  };

  const testActualRegistration = async () => {
    setLoading(true);
    addTestResult({ type: 'info', message: '🧪 Testing actual registration API...' });
    
    try {
      const testUser = {
        email: `testuser${Date.now()}@example.com`,
        password: 'testpassword123',
        role: 'customer',
        first_name: 'Test',
        last_name: 'User',
        phone: '+1234567890'
      };

      const response = await authAPI.register(testUser);
      addTestResult({
        type: 'success',
        message: `Registration successful! User ID: ${response.data.id}`
      });
    } catch (error) {
      addTestResult({
        type: 'error',
        message: `Registration failed: ${error.message}`
      });
    }
    
    setLoading(false);
  };

  const getResultStyle = (type) => {
    switch (type) {
      case 'success':
        return styles.successResult;
      case 'error':
        return styles.errorResult;
      default:
        return styles.infoResult;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>API Test Dashboard</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={runConnectivityTest}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test API Connectivity</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={runRegistrationTest}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Registration Endpoint</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.tertiaryButton]}
          onPress={testActualRegistration}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Actual Registration</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearResults}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.length === 0 ? (
          <Text style={styles.noResults}>No tests run yet</Text>
        ) : (
          testResults.map((result, index) => (
            <View key={index} style={[styles.result, getResultStyle(result.type)]}>
              <Text style={styles.timestamp}>{result.timestamp}</Text>
              <Text style={styles.resultMessage}>{result.message}</Text>
            </View>
          ))
        )}
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Running test...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  tertiaryButton: {
    backgroundColor: '#FF9500',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  noResults: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  result: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  successResult: {
    backgroundColor: '#E8F5E8',
    borderLeftColor: '#34C759',
  },
  errorResult: {
    backgroundColor: '#FFE8E8',
    borderLeftColor: '#FF3B30',
  },
  infoResult: {
    backgroundColor: '#E8F4FF',
    borderLeftColor: '#007AFF',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  resultMessage: {
    fontSize: 14,
    color: '#333',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default ApiTestComponent;