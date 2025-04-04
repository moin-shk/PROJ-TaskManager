import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function TaskListScreen() {
  const [newTask, setNewTask] = useState('');
  const [tasks, setTasks] = useState<{ id: string; title: string }[]>([]);

  const addTask = () => {
    if (newTask.trim() === '') {
      Alert.alert('Error', 'Please enter a task');
      return;
    }
    const task = { id: Date.now().toString(), title: newTask };
    setTasks(prevTasks => [task, ...prevTasks]);
    setNewTask('');
  };

interface Task {
    id: string;
    title: string;
}

const deleteTask = (id: string): void => {
    setTasks((prevTasks: Task[]) => prevTasks.filter((task: Task) => task.id !== id));
};

  const renderItem = ({ item }: { item: Task }) => (
    <View style={styles.taskItem}>
      <Text style={styles.taskText}>{item.title}</Text>
      <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter new task..."
          value={newTask}
          onChangeText={setNewTask}
        />
        <TouchableOpacity onPress={addTask} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      {tasks.length === 0 ? (
        <Text style={styles.noTasksText}>No tasks yet. Add one!</Text>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={{ width: '100%' }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noTasksText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
    fontSize: 16,
  },
  taskItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskText: {
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
