// Auth/SignUpScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '../supabaseClient';

export default function SignUpScreen({ navigation }: { navigation: any }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSignUp() {
    // Sign up the user with Supabase
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert("Sign up error: " + error.message);
    } else if (data.user) {
      // Insert extra details into the "User" table
      const { error: insertError } = await supabase
        .from("User")
        .insert([{ uuid: data.user.id, first_name: firstName, last_name: lastName, email }]);
      if (insertError) {
        alert("Error inserting user details: " + insertError.message);
      } else {
        alert("Sign up successful! Please sign in.");
        navigation.navigate('SignIn');
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Sign Up</Text>
      <TextInput 
        placeholder="First Name" 
        value={firstName}
        onChangeText={setFirstName}
        style={styles.input}
      />
      <TextInput 
        placeholder="Last Name" 
        value={lastName}
        onChangeText={setLastName}
        style={styles.input}
      />
      <TextInput 
        placeholder="Email" 
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput 
        placeholder="Password" 
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('SignIn')}>
        <Text style={styles.linkButtonText}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 20,
    justifyContent: 'center'
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 12
  },
  linkButtonText: {
    color: '#007BFF',
    fontSize: 16,
    textDecorationLine: 'underline'
  }
});
