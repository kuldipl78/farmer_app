import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { checkApiHealth, testRegistrationEndpoint } from '../utils/apiHealthCheck';

const ApiHealthChecker = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const runHealthCheck = async () => {
    setLoading(true);
    try {
      const healthResults = await checkApiHealth();
      setResults(healthResults);
      
      if (healthResults.summary.success) {
        Alert.alert('✅ Success', `All ${healthResults.summary.total} API tests passed!`);
      } else {
        Alert.alert('⚠️ Issues Found', `${healthResults.summary.failed}/${healthResults.summary.total} tests failed`);
      }
    } catch (error) {
      Alert.alert('❌ Error', `Health check failed: ${error.message}`);
    }
    setLoading(false);
  };

  const testRegistration = async () => {
    setLoading(true);
    try {
      const testData = {
        email: `test_${Date.now()}@example.com`,
        password: 'password123',
        role: 'customer',
        first_name: 'Test',
        last_name: 'User',
        phone: null
      };

      const result = await testRegistrationEndpoint(testData);
      
      if (result.success) {
        Alert.alert('✅ Success', 'Registration endpoint is working!');
      } else {
        Alert.alert('❌ Failed', `Registration failed: ${result.error?.detail || result.error || 'Unknown error'}`);
      }
    } catch (error) {
      Alert.alert('❌ Error', `Registration test failed: ${error.message}`);
    }
    setLoading(false);
  };

  const clearResults = () => {
    setResults(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Health Checker</Text>
      <Text style={styles.subtitle}>Test backend connectivity and endpoints</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={runHealthCheck}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Run Health Check</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={testRegistration}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Registration</Text>
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
          <Text style={styles.loadingText}>Testing API...</Text>
        </View>
      )}

      {results && (
        <ScrollView style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Health Check Results</Text>
          
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              📊 Summary: {results.summary.passed}/{results.summary.total} tests passed
            </Text>
            <Text style={styles.timestampText}>
              🕒 {new Date(results.timestamp).toLocaleString()}
            </Text>
            <Text style={styles.urlText}>
              🌐 {results.baseUrl}
            </Text>
          </View>

          {results.tests.map((test, index) => (
            <View key={index} style={styles.testResult}>
              <View style={styles.testHeader}>
                <Text style={styles.testName}>{test.name}</Text>
                <Text style={[styles.testStatus, test.success ? styles.success : styles.error]}>
                  {test.success ? '✅ PASS' : '❌ FAIL'}
                </Text>
              </View>
              
              {test.status && (
                <Text style={styles.statusText}>Status: {test.status}</Text>
              )}
              
              {test.success && test.data && (
                <View style={styles.dataContainer}>
                  <Text style={styles.dataTitle}>Response:</Text>
                  <Text style={styles.dataText}>
                    {JSON.stringify(test.data, null, 2)}
                  </Text>
                </View>
              )}
              
              {!test.success && test.error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorTitle}>Error:</Text>
                  <Text style={styles.errorText}>{test.error}</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
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
  testButton: {
    backgroundColor: '#34C759',
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
  summaryContainer: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 4,
  },
  timestampText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  urlText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  testResult: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 8,
  },
  testHeader: {
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
  testStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  success: {
    color: '#34C759',
  },
  error: {
    color: '#FF3B30',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dataContainer: {
    backgroundColor: '#f0f9ff',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  dataTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 4,
  },
  dataText: {
    fontSize: 10,
    color: '#333',
    fontFamily: 'monospace',
  },
  errorContainer: {
    backgroundColor: '#fff5f5',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
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
  },
});

export default ApiHealthChecker;