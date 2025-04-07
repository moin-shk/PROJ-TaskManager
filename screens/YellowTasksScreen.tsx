// screens/YellowTasksScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../supabaseClient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Subtask {
  text: string;
  completed: boolean;
  order: number;
}

interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority?: number;
  status: string; // 'pending' | 'completed'
  urgency?: string; // 'red' | 'yellow' | 'green'
  subtasks?: Subtask[];
  created_at: string;
  updated_at: string;
}

type RootStackParamList = {
  Main: { screen?: 'Dashboard' } | undefined;
  YellowTasksScreen: undefined;
};

type YellowTasksScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'YellowTasksScreen'
>;

export default function YellowTasksScreen() {
  const navigation = useNavigation<YellowTasksScreenNavigationProp>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string>('');

  // Modal state for editing task.
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newDueDate, setNewDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [newPriority, setNewPriority] = useState<number>(2);
  const [selectedUrgency, setSelectedUrgency] = useState<string>('yellow'); // default yellow
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState<string>('');
  const [addSubtasks, setAddSubtasks] = useState<boolean>(false);

  // For expanded subtasks and inline options.
  const [expandedTaskIds, setExpandedTaskIds] = useState<string[]>([]);
  const [activeOptionsTaskId, setActiveOptionsTaskId] = useState<string | null>(null);

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
    // Fetch tasks with urgency 'yellow' and pending status.
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', uid)
      .eq('urgency', 'yellow')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching tasks:', error.message);
    } else {
      setTasks(data || []);
    }
    setIsLoading(false);
  }

  function handleDueDateChange(event: any, selectedDate?: Date) {
    setShowDatePicker(false);
    if (selectedDate) {
      const today = new Date();
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      if (selectedDate < todayMidnight) {
        Alert.alert('Invalid Date', 'Due date cannot be in the past.');
      } else {
        setNewDueDate(selectedDate);
      }
    }
  }

  async function addOrUpdateTask() {
    // Only used for editing.
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }
    if (!newTitle.trim()) {
      Alert.alert('Validation', 'Task title is required.');
      return;
    }
    const subtasksData = subtasks.length > 0 ? subtasks : null;
    if (editingTask) {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: newTitle,
          description: newDescription,
          due_date: newDueDate ? newDueDate.toISOString() : null,
          priority: newPriority,
          urgency: selectedUrgency,
          subtasks: subtasksData,
        })
        .eq('id', editingTask.id);
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        fetchTasks();
        clearModalFields();
      }
    }
  }

  function clearModalFields() {
    setNewTitle('');
    setNewDescription('');
    setNewDueDate(null);
    setSelectedUrgency('yellow');
    setSubtasks([]);
    setNewSubtask('');
    setAddSubtasks(false);
    setNewPriority(2);
    setEditingTask(null);
    setModalVisible(false);
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

  async function toggleTaskStatus(task: Task) {
    const updatedStatus = 'completed';
    const { error } = await supabase.from('tasks').update({ status: updatedStatus }).eq('id', task.id);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      fetchTasks();
    }
  }

  async function toggleSubtask(task: Task, index: number) {
    if (!task.subtasks) return;
    const updatedSubtasks = task.subtasks.map((sub, i) =>
      i === index ? { ...sub, completed: !sub.completed } : sub
    );
    updatedSubtasks.sort((a, b) => {
      if (a.completed === b.completed) return a.order - b.order;
      return a.completed ? 1 : -1;
    });
    const { error } = await supabase
      .from('tasks')
      .update({ subtasks: updatedSubtasks })
      .eq('id', task.id);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      fetchTasks();
    }
  }

  function toggleOptions(taskId: string) {
    setActiveOptionsTaskId(activeOptionsTaskId === taskId ? null : taskId);
  }

  function handleEditTask(task: Task) {
    setEditingTask(task);
    setNewTitle(task.title);
    setNewDescription(task.description || '');
    setNewDueDate(task.due_date ? new Date(task.due_date) : null);
    setNewPriority(task.priority || 2);
    setSelectedUrgency(task.urgency || 'yellow');
    setSubtasks(task.subtasks ? [...task.subtasks] : []);
    setModalVisible(true);
  }

  function toggleExpand(taskId: string) {
    if (expandedTaskIds.includes(taskId)) {
      setExpandedTaskIds(expandedTaskIds.filter(id => id !== taskId));
    } else {
      setExpandedTaskIds([...expandedTaskIds, taskId]);
    }
  }

  function renderDatePicker() {
    return (
      <>
        {showDatePicker && (
          <DateTimePicker
            value={newDueDate || new Date()}
            mode="date"
            display="default"
            onChange={handleDueDateChange}
          />
        )}
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={20} color="#fff" />
          <Text style={styles.dateButtonText}>
            {newDueDate ? newDueDate.toLocaleDateString() : 'Select Due Date'}
          </Text>
        </TouchableOpacity>
      </>
    );
  }

  function renderUrgencySelector() {
    const options = [
      { value: 'red', color: '#FF3B30' },
      { value: 'yellow', color: '#FFCC00' },
      { value: 'green', color: '#34C759' },
    ];
    return (
      <View style={styles.urgencyContainer}>
        {options.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.urgencyCircle,
              { backgroundColor: option.color },
              selectedUrgency === option.value && styles.urgencyCircleSelected,
            ]}
            onPress={() => setSelectedUrgency(option.value)}
          />
        ))}
      </View>
    );
  }

  function renderSubtasksSection() {
    return (
      <View style={styles.subtasksContainer}>
        <TouchableOpacity style={styles.centerButton} onPress={() => setAddSubtasks(!addSubtasks)}>
          <Text style={styles.centerButtonText}>
            {addSubtasks ? 'Hide Subtasks' : 'Add Subtasks'}
          </Text>
        </TouchableOpacity>
        {addSubtasks && (
          <>
            <View style={styles.subtasksInputContainer}>
              <TextInput
                style={styles.subtasksInput}
                placeholder="Enter subtask"
                value={newSubtask}
                onChangeText={setNewSubtask}
              />
              <TouchableOpacity
                style={styles.addSubtaskButtonContainer}
                onPress={() => {
                  if (newSubtask.trim()) {
                    setSubtasks(prev => {
                      const unchecked = prev.filter(s => !s.completed);
                      const newOrder = unchecked.length > 0 ? Math.max(...unchecked.map(s => s.order)) + 1 : 0;
                      return [...prev, { text: newSubtask.trim(), completed: false, order: newOrder }];
                    });
                    setNewSubtask('');
                  } else {
                    Alert.alert('Validation', 'Subtask cannot be empty.');
                  }
                }}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.subtasksList}>
              {[...subtasks]
                .sort((a, b) => {
                  if (a.completed === b.completed) return a.order - b.order;
                  return a.completed ? 1 : -1;
                })
                .map((sub, index) => (
                  <View key={index} style={styles.subtaskRow}>
                    <Text style={styles.subtaskItem}>• {sub.text}</Text>
                    <TouchableOpacity
                      style={styles.removeSubtaskButton}
                      onPress={() => setSubtasks(prev => prev.filter((_, i) => i !== index))}
                    >
                      <Ionicons name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
            </View>
          </>
        )}
      </View>
    );
  }

  function renderTaskItem({ item }: { item: Task }) {
    const isExpanded = expandedTaskIds.includes(item.id);
    const optionsVisible = activeOptionsTaskId === item.id;

    return (
      <View style={[styles.taskCard, { backgroundColor: '#fff9e6' }]}>
        <TouchableOpacity onPress={() => toggleTaskStatus(item)}>
          <Ionicons
            name={item.status === 'completed' ? 'checkbox-outline' : 'square-outline'}
            size={24}
            color={item.status === 'completed' ? 'green' : '#ccc'}
          />
        </TouchableOpacity>
        <View style={styles.taskContent}>
          <Text style={[styles.taskTitle, item.status === 'completed' && styles.completedTask]}>
            {item.title}
          </Text>
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
                .sort((a, b) => {
                  if (a.completed === b.completed) return a.order - b.order;
                  return a.completed ? 1 : -1;
                })
                .map((sub, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.subtaskRow}
                    onPress={() => toggleSubtask(item, index)}
                  >
                    <Ionicons
                      name={sub.completed ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={sub.completed ? 'green' : '#ccc'}
                    />
                    <Text style={styles.subtaskItem}>{sub.text}</Text>
                  </TouchableOpacity>
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
                onPress={() => { toggleOptions(item.id); handleEditTask(item); }}
              >
                <Text style={styles.optionText}>Edit Task</Text>
              </Pressable>
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
      <Text style={styles.header}>Yellow Tasks</Text>
      {isLoading ? (
        <Text style={styles.loadingText}>Loading tasks...</Text>
      ) : tasks.length === 0 ? (
        <Text style={styles.noTasks}>No yellow tasks yet.</Text>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
      {/* Modal for editing task */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalClose} onPress={clearModalFields}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Task</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Task Title"
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={[styles.modalInput, { height: 80 }]}
              placeholder="Task Description (Optional)"
              value={newDescription}
              onChangeText={setNewDescription}
              multiline
            />
            {renderDatePicker()}
            {renderUrgencySelector()}
            {renderSubtasksSection()}
            <TouchableOpacity style={styles.modalSubmit} onPress={addOrUpdateTask}>
              <Text style={styles.modalSubmitText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalSubmit: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  modalSubmitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    backgroundColor: '#fff9e6', // Light yellow background for cards
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
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#999',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '92%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    paddingTop: 40,
  },
  modalClose: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    alignSelf: 'center',
    color: '#333',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 6,
    padding: 12,
    marginVertical: 8,
    fontSize: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    marginVertical: 8,
  },
  dateButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  urgencyContainer: {
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  urgencyCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 8,
  },
  urgencyCircleSelected: {
    borderWidth: 2,
    borderColor: '#000',
  },
  subtasksContainer: {
    marginVertical: 8,
  },
  centerButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
    alignSelf: 'center',
  },
  centerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  subtasksInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  subtasksInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
  },
  addSubtaskButtonContainer: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    height: 42,
    width: 42,
    marginLeft: 6,
  },
  subtasksList: {
    marginTop: 8,
    alignSelf: 'stretch',
  },
  removeSubtaskButton: {
    marginLeft: 10,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 4,
  },
});
