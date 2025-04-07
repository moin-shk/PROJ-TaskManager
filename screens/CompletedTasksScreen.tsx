// screens/CompletedTasksScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabaseClient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority?: number;
  status: string; // 'pending' | 'completed'
  urgency?: string;
  subtasks?: any;
  created_at: string;
  updated_at: string;
}

type RootStackParamList = {
  Main: { screen?: 'Dashboard' } | undefined;
  CompletedTasksScreen: undefined;
};

type CompletedTasksScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CompletedTasksScreen'
>;

export default function CompletedTasksScreen() {
  const navigation = useNavigation<CompletedTasksScreenNavigationProp>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string>('');
  const [activeOptionsTaskId, setActiveOptionsTaskId] = useState<string | null>(null);
  const [expandedTaskIds, setExpandedTaskIds] = useState<string[]>([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      console.error('Error getting user:', userError?.message);
      setIsLoading(false);
      return;
    }
    const uid = userData.user.id;
    setUserId(uid);
    // Fetch tasks with status 'completed'
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', uid)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching tasks:', error.message);
    } else {
      setTasks(data || []);
    }
    setIsLoading(false);
  }

  async function deleteTask(taskId: string) {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('tasks').delete().eq('id', taskId);
          if (error) {
            Alert.alert('Error', error.message);
          } else {
            fetchTasks();
          }
        },
      },
    ]);
  }

  function toggleOptions(taskId: string) {
    setActiveOptionsTaskId(activeOptionsTaskId === taskId ? null : taskId);
  }

  function toggleExpand(taskId: string) {
    if (expandedTaskIds.includes(taskId)) {
      setExpandedTaskIds(expandedTaskIds.filter(id => id !== taskId));
    } else {
      setExpandedTaskIds([...expandedTaskIds, taskId]);
    }
  }

  function renderTaskItem({ item }: { item: Task }) {
    const isExpanded = expandedTaskIds.includes(item.id);
    const optionsVisible = activeOptionsTaskId === item.id;

    return (
      <View style={[styles.taskCard, { backgroundColor: '#f0f0f0' }]}>
        <View style={styles.taskContent}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          {item.due_date && (
            <Text style={styles.taskDueDate}>
              Due: {new Date(item.due_date).toLocaleDateString()}
            </Text>
          )}
          {item.subtasks && item.subtasks.length > 0 && (
            <TouchableOpacity onPress={() => toggleExpand(item.id)} style={styles.dropdownButton}>
              <Ionicons
                name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
                size={20}
                color="#333"
              />
            </TouchableOpacity>
          )}
          {isExpanded && item.subtasks && (
            <View style={styles.subtasksDropdown}>
              {[...item.subtasks]
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((sub, index) => (
                  <View key={index} style={styles.subtaskRow}>
                    <Ionicons
                      name={sub.completed ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={sub.completed ? 'green' : '#ccc'}
                    />
                    <Text style={styles.subtaskItem}>{sub.text}</Text>
                  </View>
                ))}
            </View>
          )}
        </View>
        <View style={styles.optionsContainer}>
          <TouchableOpacity onPress={() => toggleOptions(item.id)} style={styles.optionsButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#333" />
          </TouchableOpacity>
          {optionsVisible && (
            <View style={styles.optionsDropdown}>
              <Pressable
                style={({ pressed }) => [
                  styles.optionItem,
                  pressed && { backgroundColor: '#eee' },
                ]}
                onPress={() => { toggleOptions(item.id); deleteTask(item.id); }}
              >
                <Text style={[styles.optionText, { color: '#FF3B30' }]}>Delete Task</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.optionItem,
                  pressed && { backgroundColor: '#eee' },
                ]}
                onPress={() => toggleOptions(item.id)}
              >
                <Text style={styles.optionText}>Close</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    );
  }

  // Back button handler to navigate to Dashboard.
  const handleBack = () => {
    navigation.navigate('Main', { screen: 'Dashboard' });
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>
      <Text style={styles.header}>Completed Tasks</Text>
      {isLoading ? (
        <Text style={styles.loadingText}>Loading tasks...</Text>
      ) : tasks.length === 0 ? (
        <Text style={styles.noTasks}>No completed tasks found.</Text>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // White page background
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
    paddingTop: 20,
  },
  loadingText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  noTasks: {
    textAlign: 'center',
    color: '#333',
    fontSize: 16,
    marginTop: 20,
  },
  listContainer: {
    paddingBottom: 120,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0', // Light grey background for completed task cards
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  taskContent: {
    flex: 1,
    marginLeft: 10,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  taskDueDate: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  dropdownButton: {
    marginRight: 4,
  },
  subtasksDropdown: {
    marginTop: 8,
    paddingLeft: 10,
    flexDirection: 'column',
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  subtaskItem: {
    fontSize: 16,
    color: '#333',
    marginLeft: 6,
  },
  optionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionsButton: {
    marginLeft: 4,
  },
  optionsDropdown: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  optionItem: {
    paddingVertical: 6,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
});
