import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';

const NetworkTest = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const addResult = (test, success, data, error = null) => {
    const result = {
      id: Date.now(),
      test,
      success,
      data,
      error,
      timestamp: new Date().toLocaleTimeString(),
    };
    setResults(prev => [result, ...prev]);
    return result;
  };

  const testBasicFetch = async () => {
    setLoading(true);
    try {
      console.log('🔍 Testing basic fetch to backend...');
      
      const response = await fetch('https://farmer-api-v2.onrender.com/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      console.log('✅ Fetch response:', data);
      
      addResult('Basic Fetch Test', true, data);
      Alert.alert('✅ Success', 'Basic fetch works!');
    } catch (error) {
      console.error('❌ Fetch failed:', error);
      addResult('Basic Fetch Test', false, null, error.message);
      Alert.alert('❌ Failed', `Fetch failed: ${error.message}`);
    }
    setLoading(false);
  };

  const testAxiosRequest = async () => {
    setLoading(true);
    try {
      console.log('🔍 Testing axios request...');
      
      // Import axios dynamically
      const axios = require('axios');
      
      const response = await axios.get('https://farmer-api-v2.onrender.com/health', {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log('✅ Axios response:', response.data);
      addResult('Axios Test', true, response.data);
      Alert.alert('✅ Success', 'Axios request works!');
    } catch (error) {
      console.error('❌ Axios failed:', error);
      addResult('Axios Test', false, null, {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
      });
      Alert.alert('❌ Failed', `Axios failed: ${error.message}`);
    }
    setLoading(false);
  };

  const testRegistrationEndpoint = async () => {
    setLoading(true);
    try {
      console.log('🔍 Testing registration endpoint...');
      
      const testData = {
        email: `test_${Date.now()}@example.com`,
        password: 'password123',
        role: 'customer',
        first_name: 'Test',
        last_name: 'User',
        phone: null
      };

      const response = await fetch('https://farmer-api-v2.onrender.com/auth/register', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });
      
      const data = await response.json();
      console.log('✅ Registration response:', data);
      
      if (response.ok) {
        addResult('Registration Test', true, data);
        Alert.alert('✅ Success', 'Registration endpoint works!');
      } else {
        addResult('Registration Test', false, null, {
          status: response.status,
          data: data
        });
        Alert.alert('❌ Failed', `Registration failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Registration test failed:', error);
      addResult('Registration Test', false, null, error.message);
      Alert.alert('❌ Failed', `Registration test failed: ${error.message}`);
    }
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network Connectivity Test</Text>
      <Text style={styles.subtitle}>Test backend connectivity</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={testBasicFetch}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Basic Fetch</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={testAxiosRequest}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Axios Request</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={testRegistrationEndpoint}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Registration Endpoint</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearResults}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Testing...</Text>
        </View>
      )}

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results ({results.length})</Text>
        {results.length === 0 ? (
          <Text style={styles.noResults}>No tests run yet</Text>
        ) : (
          results.map((result) => (
            <View key={result.id} style={styles.result}>
              <View style={styles.resultHeader}>
                <Text style={styles.testName}>{result.test}</Text>
                <Text style={styles.timestamp}>{result.timestamp}</Text>
              </View>
              
              <Text style={[styles.status, result.success ? styles.success : styles.error]}>
                {result.success ? '✅ SUCCESS' : '❌ FAILED'}
              </Text>
              
              {result.success && result.data && (
                <View style={styles.dataContainer}>
                  <Text style={styles.dataTitle}>Response:</Text>
                  <Text style={styles.dataText}>
                    {JSON.stringify(result.data, null, 2)}
                  </Text>
                </View>
              )}
              
              {!result.success && result.error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorTitle}>Error:</Text>
                  <Text style={styles.errorText}>
                    {typeof result.error === 'string' ? result.error : JSON.stringify(result.error, null, 2)}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </View>
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
    marginBottom: 5,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  testButton: {
    backgroundColor: '#FF9500',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    flex: 1,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  noResults: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  result: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  success: {
    color: '#34C759',
  },
  error: {
    color: '#FF3B30',
  },
  dataContainer: {
    backgroundColor: '#f0f9ff',
    padding: 10,
    borderRadius: 6,
    marginTop: 5,
  },
  dataTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 4,
  },
  dataText: {
    fontSize: 11,
    color: '#333',
    fontFamily: 'monospace',
  },
  errorContainer: {
    backgroundColor: '#fff5f5',
    padding: 10,
    borderRadius: 6,
    marginTop: 5,
  },
  errorTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#cc0000',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 11,
    color: '#cc0000',
    fontFamily: 'monospace',
  },
});

export default NetworkTest;