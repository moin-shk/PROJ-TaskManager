// screens/ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabaseClient';
import { useNavigation } from '@react-navigation/native';
import Dialog from 'react-native-dialog';

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

  // Inline update for name (remains unchanged)
  const [showUpdateName, setShowUpdateName] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');

  // State for Android password update dialog
  const [isPasswordDialogVisible, setIsPasswordDialogVisible] = useState(false);
  const [passwordStep, setPasswordStep] = useState<'current' | 'new' | 'confirm'>('current');
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    const { data: userResponse, error: userError } = await supabase.auth.getUser();
    if (userError || !userResponse?.user) {
      console.error('Error getting user:', userError?.message);
      return;
    }
    const currentUser = userResponse.user;
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

  // Password update function supporting both iOS and Android.
  async function handleUpdatePassword() {
    if (Platform.OS === 'ios') {
      // iOS: Use Alert.prompt flow as before.
      Alert.prompt(
        'Current Password',
        'Enter your current password:',
        async (currentPassword) => {
          if (!currentPassword) return;
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: userProfile.email,
            password: currentPassword,
          });
          if (signInError || !signInData.user) {
            Alert.alert('Error', 'Current password is incorrect. Please try again.');
            return;
          }
          Alert.prompt(
            'New Password',
            'Enter your new password:',
            (newPassword) => {
              if (!newPassword) return;
              Alert.prompt(
                'Confirm New Password',
                'Re-enter your new password:',
                async (confirmPassword) => {
                  if (newPassword !== confirmPassword) {
                    Alert.alert('Error', 'New passwords do not match. Please try again.');
                    return;
                  }
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
    } else {
      // Android: Use a dialog flow.
      // Initialize dialog state
      setPasswordStep('current');
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setIsPasswordDialogVisible(true);
    }
  }

  // Function to handle Android dialog submission.
  async function handleAndroidPasswordDialogSubmit() {
    if (passwordStep === 'current') {
      // Verify current password
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: userProfile.email,
        password: currentPasswordInput,
      });
      if (signInError || !signInData.user) {
        Alert.alert('Error', 'Current password is incorrect. Please try again.');
        // Reset dialog for current password
        setCurrentPasswordInput('');
        return;
      }
      // Proceed to new password step.
      setPasswordStep('new');
      setCurrentPasswordInput(''); // Optionally clear current password
    } else if (passwordStep === 'new') {
      if (!newPasswordInput) {
        Alert.alert('Error', 'Please enter a new password.');
        return;
      }
      // Proceed to confirmation step.
      setPasswordStep('confirm');
    } else if (passwordStep === 'confirm') {
      if (newPasswordInput !== confirmPasswordInput) {
        Alert.alert('Error', 'New passwords do not match. Please try again.');
        // Reset new password inputs and go back to new step.
        setNewPasswordInput('');
        setConfirmPasswordInput('');
        setPasswordStep('new');
        return;
      }
      // All steps verified; update the password.
      const { error: updateError } = await supabase.auth.updateUser({ password: newPasswordInput });
      if (updateError) {
        Alert.alert('Error updating password', updateError.message);
      } else {
        Alert.alert('Success', 'Password updated successfully.');
      }
      // Hide the dialog.
      setIsPasswordDialogVisible(false);
    }
  }

  // Function to handle Android dialog cancellation.
  function handleAndroidPasswordDialogCancel() {
    setIsPasswordDialogVisible(false);
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

      {/* Android Password Update Dialog */}
      {Platform.OS === 'android' && isPasswordDialogVisible && (
        <Dialog.Container visible={isPasswordDialogVisible}>
          {passwordStep === 'current' && (
            <>
              <Dialog.Title>Current Password</Dialog.Title>
              <Dialog.Input
                placeholder="Enter current password"
                secureTextEntry
                value={currentPasswordInput}
                onChangeText={setCurrentPasswordInput}
              />
            </>
          )}
          {passwordStep === 'new' && (
            <>
              <Dialog.Title>New Password</Dialog.Title>
              <Dialog.Input
                placeholder="Enter new password"
                secureTextEntry
                value={newPasswordInput}
                onChangeText={setNewPasswordInput}
              />
            </>
          )}
          {passwordStep === 'confirm' && (
            <>
              <Dialog.Title>Confirm New Password</Dialog.Title>
              <Dialog.Input
                placeholder="Re-enter new password"
                secureTextEntry
                value={confirmPasswordInput}
                onChangeText={setConfirmPasswordInput}
              />
            </>
          )}
          <Dialog.Button label="Cancel" onPress={handleAndroidPasswordDialogCancel} />
          <Dialog.Button label="OK" onPress={handleAndroidPasswordDialogSubmit} />
        </Dialog.Container>
      )}
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
