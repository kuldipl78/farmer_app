/**
 * Debug Registration Component
 * Add this to your RegisterScreen temporarily to debug the issue
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
import { testExactRegistrationFormat, testRegistrationFormats } from '../utils/testRegistration';

const DebugRegistration = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runExactTest = async () => {
    setLoading(true);
    try {
      const result = await testExactRegistrationFormat();
      setTestResults(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        type: 'exact',
        result
      }]);
      
      if (result.success) {
        Alert.alert('Success', 'Registration test passed!');
      } else {
        Alert.alert('Failed', `Registration test failed: ${result.error}`);
      }
    } catch (error) {
      Alert.alert('Error', `Test error: ${error.message}`);
    }
    setLoading(false);
  };

  const runAllTests = async () => {
    setLoading(true);
    try {
      const results = await testRegistrationFormats();
      setTestResults(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        type: 'all',
        result: results
      }]);
      
      const successCount = results.filter(r => r.success).length;
      Alert.alert('Tests Complete', `${successCount}/${results.length} tests passed`);
    } catch (error) {
      Alert.alert('Error', `Test error: ${error.message}`);
    }
    setLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registration Debug</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={runExactTest}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Exact Format</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={runAllTests}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test All Formats</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearResults}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.length === 0 ? (
          <Text style={styles.noResults}>No tests run yet</Text>
        ) : (
          testResults.map((test, index) => (
            <View key={index} style={styles.result}>
              <Text style={styles.timestamp}>{test.timestamp}</Text>
              <Text style={styles.testType}>Type: {test.type}</Text>
              {test.type === 'exact' ? (
                <View>
                  <Text style={[styles.status, test.result.success ? styles.success : styles.error]}>
                    {test.result.success ? '✅ SUCCESS' : '❌ FAILED'}
                  </Text>
                  {!test.result.success && (
                    <View>
                      <Text style={styles.errorText}>Error: {test.result.error}</Text>
                      <Text style={styles.statusText}>Status: {test.result.status}</Text>
                      {test.result.details && (
                        <Text style={styles.detailsText}>
                          Details: {JSON.stringify(test.result.details, null, 2)}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              ) : (
                <View>
                  {test.result.map((r, i) => (
                    <View key={i} style={styles.subResult}>
                      <Text style={styles.testName}>{r.name}</Text>
                      <Text style={[styles.status, r.success ? styles.success : styles.error]}>
                        {r.success ? '✅ SUCCESS' : '❌ FAILED'}
                      </Text>
                      {!r.success && (
                        <Text style={styles.errorText}>Error: {r.error}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
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
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    maxHeight: 300,
  },
  resultsTitle: {
    fontSize: 16,
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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  testType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  success: {
    color: '#34C759',
  },
  error: {
    color: '#FF3B30',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  detailsText: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'monospace',
  },
  subResult: {
    marginBottom: 8,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#eee',
  },
  testName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default DebugRegistration;