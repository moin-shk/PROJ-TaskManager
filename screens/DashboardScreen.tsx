// DashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabaseClient';

type RootStackParamList = {
  Dashboard: undefined;
  RedTasksScreen: undefined;
  YellowTasksScreen: undefined;
  GreenTasksScreen: undefined;
  CompletedTasksScreen: undefined;
};

type DashboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardScreenNavigationProp>();

  const [firstName, setFirstName] = useState<string>('');
  const [redTasks, setRedTasks] = useState<number>(0);
  const [yellowTasks, setYellowTasks] = useState<number>(0);
  const [greenTasks, setGreenTasks] = useState<number>(0);
  const [completedTasks, setCompletedTasks] = useState<number>(0);

  useEffect(() => {
    async function fetchUserAndCounts() {
      const { data: userResponse, error: userError } = await supabase.auth.getUser();
      if (userError || !userResponse?.user) {
        console.error('Error fetching user:', userError?.message);
        return;
      }
      const userId = userResponse.user.id;
      
      // Fetch the first name from the User table
      const { data: userData, error: userDataError } = await supabase
        .from('User')
        .select('first_name')
        .eq('uuid', userId)
        .single();
      if (userDataError) {
        console.error('Error fetching first name:', userDataError.message);
      } else if (userData) {
        setFirstName(userData.first_name);
      }
      
      // Fetch counts for each task category in parallel
      const [redResult, yellowResult, greenResult, completedResult] = await Promise.all([
        supabase.from('tasks').select('id', { count: 'exact', head: false })
          .eq('user_id', userId)
          .eq('urgency', 'red')
          .eq('status', 'pending'),
        supabase.from('tasks').select('id', { count: 'exact', head: false })
          .eq('user_id', userId)
          .eq('urgency', 'yellow')
          .eq('status', 'pending'),
        supabase.from('tasks').select('id', { count: 'exact', head: false })
          .eq('user_id', userId)
          .eq('urgency', 'green')
          .eq('status', 'pending'),
        supabase.from('tasks').select('id', { count: 'exact', head: false })
          .eq('user_id', userId)
          .eq('status', 'completed')
      ]);

      setRedTasks(redResult.count || 0);
      setYellowTasks(yellowResult.count || 0);
      setGreenTasks(greenResult.count || 0);
      setCompletedTasks(completedResult.count || 0);
    }
    fetchUserAndCounts();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hello, {firstName || 'User'}!</Text>
      <Text style={styles.title}>Dashboard</Text>
      <View style={styles.cardsContainer}>
        {/* Red Tasks */}
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: '#ffe5e5' }]} 
          onPress={() => navigation.navigate('RedTasksScreen')}
        >
          <Text style={[styles.cardTitle, { color: '#000' }]}>Red Tasks</Text>
          <View style={styles.cardRight}>
            <Text style={[styles.cardValue, { color: '#000' }]}>{redTasks}</Text>
            <Ionicons name="chevron-forward-outline" size={26} color="#000" style={styles.arrow} />
          </View>
        </TouchableOpacity>
        {/* Yellow Tasks */}
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: '#fff9e6' }]} 
          onPress={() => navigation.navigate('YellowTasksScreen')}
        >
          <Text style={[styles.cardTitle, { color: '#000' }]}>Yellow Tasks</Text>
          <View style={styles.cardRight}>
            <Text style={[styles.cardValue, { color: '#000' }]}>{yellowTasks}</Text>
            <Ionicons name="chevron-forward-outline" size={26} color="#000" style={styles.arrow} />
          </View>
        </TouchableOpacity>
        {/* Green Tasks */}
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: '#e6ffe6' }]} 
          onPress={() => navigation.navigate('GreenTasksScreen')}
        >
          <Text style={[styles.cardTitle, { color: '#000' }]}>Green Tasks</Text>
          <View style={styles.cardRight}>
            <Text style={[styles.cardValue, { color: '#000' }]}>{greenTasks}</Text>
            <Ionicons name="chevron-forward-outline" size={26} color="#000" style={styles.arrow} />
          </View>
        </TouchableOpacity>
        {/* Completed Tasks */}
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: '#f0f0f0' }]} 
          onPress={() => navigation.navigate('CompletedTasksScreen')}
        >
          <Text style={[styles.cardTitle, { color: '#000' }]}>Completed Tasks</Text>
          <View style={styles.cardRight}>
            <Text style={[styles.cardValue, { color: '#000' }]}>{completedTasks}</Text>
            <Ionicons name="chevron-forward-outline" size={26} color="#000" style={styles.arrow} />
          </View>
        </TouchableOpacity>
      </View>
      <Text style={styles.info}>Your progress at a glance</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 20,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    color: '#333',
    alignSelf: 'flex-start',
    fontWeight: '700',
    marginTop: 60,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#222',
    marginVertical: 10,
  },
  cardsContainer: {
    width: '100%',
    marginTop: 20,
  },
  card: {
    width: '100%',
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'left',
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardValue: {
    fontSize: 26,
    fontWeight: '700',
  },
  arrow: {
    marginLeft: 5,
  },
  info: {
    marginTop: 30,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});
