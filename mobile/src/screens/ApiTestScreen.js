import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import ApiHealthChecker from '../components/ApiHealthChecker';

export default function ApiTestScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ApiHealthChecker />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});