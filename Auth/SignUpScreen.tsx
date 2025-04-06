// screens/SignUpScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

export default function SignUpScreen({ navigation }: { navigation: any }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');

  function handleProceedToSignIn() {
    // Pass sign-up information to SignInScreen via route parameters.
    navigation.navigate('SignIn', { firstName, lastName, email, password });
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
        style={styles.input}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleProceedToSignIn}>
        <Text style={styles.buttonText}>Proceed to Sign In</Text>
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
