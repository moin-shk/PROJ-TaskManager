// screens/SignInScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { supabase } from '../supabaseClient';

export default function SignInScreen({ navigation, setUser }: { navigation: any; setUser: (user: any) => void }) {
  const route = useRoute();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');

  // Pre-populate fields if data was passed from SignUp.
  useEffect(() => {
    if (route.params) {
      const params: any = route.params;
      if (params.email) setEmail(params.email);
      if (params.password) setPassword(params.password);
      if (params.firstName) setFirstName(params.firstName);
      if (params.lastName) setLastName(params.lastName);
    }
  }, [route.params]);

  async function handleSignIn() {
    // Create the account first (if it doesn't exist) using signUp.
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    // If signUp returns an error that isn't about duplicate registration, alert the error.
    if (signUpError && !signUpError.message.toLowerCase().includes("duplicate")) {
      alert("Sign up error: " + signUpError.message);
      return;
    }
    // Now sign in with the provided credentials.
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      alert("Sign in error: " + signInError.message);
      return;
    }
    if (data.user) {
      // Optionally insert the user details into your "User" table.
      // Since RLS is disabled, there's no policy check here.
      await supabase.from("User").insert([{ 
        uuid: data.user.id, 
        first_name: firstName, 
        last_name: lastName, 
        email 
      }]);
      // Update the global user state.
      setUser(data.user);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Sign In</Text>
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
        style={styles.input}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.linkButtonText}>Don't have an account? Sign Up</Text>
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
