import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabaseClient';
import { useNavigation } from '@react-navigation/native';

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  bio: string;
}

interface UserData {
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
    bio: 'Enthusiastic task manager user who loves productivity and keeping things organized.',
  });

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
        bio: 'Enthusiastic task manager user who loves productivity and keeping things organized.',
      });
    }
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Sign Out Error', error.message);
    } else {
      // Clear the global user state so App.tsx re-renders with the AuthStackNavigator.
      setUser(null);
    }
  }

  return (
    <View style={styles.container}>
      {/* Display a default icon in place of an avatar */}
      <Ionicons name="person-circle-outline" size={120} color="#ccc" />
      <Text style={styles.name}>{`${userProfile.first_name} ${userProfile.last_name}`}</Text>
      <Text style={styles.email}>{userProfile.email}</Text>
      <Text style={styles.bio}>{userProfile.bio}</Text>
      
      <TouchableOpacity style={styles.editButton}>
        <Ionicons name="create-outline" size={20} color="#fff" />
        <Text style={styles.editButtonText}>Edit Profile</Text>
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
  bio: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
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
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});
