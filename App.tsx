import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from './screens/DashboardScreen';
import TaskListScreen from './screens/TaskListScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const renderScreen = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardScreen />;
      case 'Tasks':
        return <TaskListScreen />;
      case 'Profile':
        return <ProfileScreen />;
      case 'Settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderScreen()}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('Dashboard')}>
          <Ionicons name="home-outline" size={24} color={activeTab === 'Dashboard' ? "#007AFF" : "#8e8e93"} />
          <Text style={activeTab === 'Dashboard' ? styles.activeTabText : styles.inactiveTabText}>
            Dashboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('Tasks')}>
          <Ionicons name="list-outline" size={24} color={activeTab === 'Tasks' ? "#007AFF" : "#8e8e93"} />
          <Text style={activeTab === 'Tasks' ? styles.activeTabText : styles.inactiveTabText}>
            Tasks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('Profile')}>
          <Ionicons name="person-outline" size={24} color={activeTab === 'Profile' ? "#007AFF" : "#8e8e93"} />
          <Text style={activeTab === 'Profile' ? styles.activeTabText : styles.inactiveTabText}>
            Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('Settings')}>
          <Ionicons name="settings" size={24} color={activeTab === 'Settings' ? "#007AFF" : "#8e8e93"} />
          <Text style={activeTab === 'Settings' ? styles.activeTabText : styles.inactiveTabText}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f7f7f7',
    paddingVertical: 10,
  },
  tabButton: {
    alignItems: 'center',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  inactiveTabText: {
    color: '#8e8e93',
    fontSize: 12,
  },
});
