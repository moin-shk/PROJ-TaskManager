// screens/ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabaseClient';
import { useNavigation } from '@react-navigation/native';

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
}

interface ProfileScreenProps {
  setUser: (user: UserProfile | null) => void;
}

export default function ProfileScreen({ setUser }: ProfileScreenProps) {
  const navigation = useNavigation();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    first_name: '',
    last_name: '',
    email: '',
  });

  // Inline update for name
  const [showUpdateName, setShowUpdateName] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    // Get the current authenticated user.
    const { data: userResponse, error: userError } = await supabase.auth.getUser();
    if (userError || !userResponse?.user) {
      console.error('Error getting user:', userError?.message);
      return;
    }
    const currentUser = userResponse.user;
    // Query the "User" table for first_name, last_name, and email.
    const { data, error } = await supabase
      .from('User')
      .select('first_name, last_name, email')
      .eq('uuid', currentUser.id)
      .single();
    if (error) {
      console.error('Error fetching user data:', error.message);
    } else if (data) {
      setUserProfile({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
      });
      // Pre-fill the inline update fields.
      setNewFirstName(data.first_name);
      setNewLastName(data.last_name);
    }
  }

  async function handleSignOut() {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert('Sign Out Error', error.message);
            } else {
              setUser(null);
            }
          },
        },
      ]
    );
  }

  async function handleUpdateName() {
    const { data: userResponse, error: userError } = await supabase.auth.getUser();
    if (userError || !userResponse?.user) {
      Alert.alert('Error', 'Unable to get current user.');
      return;
    }
    const currentUserId = userResponse.user.id;
    const { error } = await supabase
      .from('User')
      .update({
        first_name: newFirstName,
        last_name: newLastName,
      })
      .eq('uuid', currentUserId);
    if (error) {
      Alert.alert('Error updating name', error.message);
    } else {
      setUserProfile({
        ...userProfile,
        first_name: newFirstName,
        last_name: newLastName,
      });
      setShowUpdateName(false);
      Alert.alert('Success', 'Name updated successfully.');
    }
  }

  async function handleUpdatePassword() {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Supported', 'Password update via prompt is only supported on iOS.');
      return;
    }
    // Prompt for current password.
    Alert.prompt(
      'Current Password',
      'Enter your current password:',
      async (currentPassword) => {
        if (!currentPassword) return;
        // Verify current password by attempting to sign in.
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: userProfile.email,
          password: currentPassword,
        });
        if (signInError || !signInData.user) {
          Alert.alert('Error', 'Current password is incorrect. Please try again.');
          return;
        }
        // Prompt for new password.
        Alert.prompt(
          'New Password',
          'Enter your new password:',
          (newPassword) => {
            if (!newPassword) return;
            // Prompt to confirm new password.
            Alert.prompt(
              'Confirm New Password',
              'Re-enter your new password:',
              async (confirmPassword) => {
                if (newPassword !== confirmPassword) {
                  Alert.alert('Error', 'New passwords do not match. Please try again.');
                  return;
                }
                // Update the password.
                const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
                if (updateError) {
                  Alert.alert('Error updating password', updateError.message);
                } else {
                  Alert.alert('Success', 'Password updated successfully.');
                }
              },
              'secure-text'
            );
          },
          'secure-text'
        );
      },
      'secure-text'
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name="person-circle-outline" size={120} color="#ccc" />
      <Text style={styles.name}>{`${userProfile.first_name} ${userProfile.last_name}`}</Text>
      <Text style={styles.email}>{userProfile.email}</Text>

      <TouchableOpacity style={styles.editButton} onPress={() => setShowUpdateName(!showUpdateName)}>
        <Ionicons name="create-outline" size={20} color="#fff" />
        <Text style={styles.editButtonText}>Change Name</Text>
      </TouchableOpacity>

      {showUpdateName && (
        <View style={styles.updateContainer}>
          <TextInput
            style={styles.input}
            placeholder="New First Name"
            value={newFirstName}
            onChangeText={setNewFirstName}
          />
          <TextInput
            style={styles.input}
            placeholder="New Last Name"
            value={newLastName}
            onChangeText={setNewLastName}
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleUpdateName}>
            <Text style={styles.saveButtonText}>Save Name</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.editButton} onPress={handleUpdatePassword}>
        <Ionicons name="lock-closed-outline" size={20} color="#fff" />
        <Text style={styles.editButtonText}>Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  email: {
    fontSize: 16,
    color: '#777',
    marginVertical: 5,
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  updateContainer: {
    width: '100%',
    marginVertical: 10,
    alignItems: 'center',
  },
  input: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
