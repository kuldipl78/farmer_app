import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import RegistrationDebugger from '../components/RegistrationDebugger';
import NetworkTest from '../components/NetworkTest';

export default function DebugScreen() {
  const [activeTab, setActiveTab] = useState('network');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'network' && styles.activeTab]}
          onPress={() => setActiveTab('network')}
        >
          <Text style={[styles.tabText, activeTab === 'network' && styles.activeTabText]}>
            Network Test
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'registration' && styles.activeTab]}
          onPress={() => setActiveTab('registration')}
        >
          <Text style={[styles.tabText, activeTab === 'registration' && styles.activeTabText]}>
            Registration Test
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'network' ? <NetworkTest /> : <RegistrationDebugger />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});