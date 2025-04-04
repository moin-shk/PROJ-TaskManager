import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  // Example statistics
  const totalTasks = 8;
  const completedTasks = 4;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.image} />
      <View style={styles.card}>
        <Ionicons name="checkmark-circle" size={28} color="#007AFF" />
        <Text style={styles.cardTitle}>Total Tasks</Text>
        <Text style={styles.cardValue}>{totalTasks}</Text>
      </View>
      <View style={styles.card}>
        <Ionicons name="checkmark-done" size={28} color="#007AFF" />
        <Text style={styles.cardTitle}>Completed Tasks</Text>
        <Text style={styles.cardValue}>{completedTasks}</Text>
      </View>
      <Text style={styles.info}>Your progress at a glance</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
    borderRadius: 75,
  },
  card: {
    width: '90%',
    backgroundColor: '#f2f2f7',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    color: '#555',
    marginTop: 5,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 5,
  },
  info: {
    marginTop: 20,
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
});
