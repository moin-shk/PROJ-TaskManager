// App.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SignInScreen from './Auth/SignInScreen';
import SignUpScreen from './Auth/SignUpScreen';
import DashboardScreen from './screens/DashboardScreen';
import TaskListScreen from './screens/TaskListScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import { supabase } from './supabaseClient';
import { Ionicons } from '@expo/vector-icons';


const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStackNavigator({ setUser }: { setUser: (user: any) => void }) {
  return (
    <AuthStack.Navigator initialRouteName="SignIn" screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="SignIn">
        {(props) => <SignInScreen {...props} setUser={setUser} />}
      </AuthStack.Screen>
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
        let iconName: 'home-outline' | 'list-outline' | 'person-outline' | 'settings-outline' | undefined;
          if (route.name === 'Dashboard') {
            iconName = 'home-outline';
          } else if (route.name === 'Tasks List') {
            iconName = 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = 'person-outline';
          }else if (route.name === 'Settings') {
            iconName = 'settings-outline';
          }
          
          // You can add more conditions for other tabs
          return iconName ? <Ionicons name={iconName} size={size} color={color} /> : null;
        },
      })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Tasks List" component={TaskListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
      setIsAuthReady(true);
    }
    checkSession();
  }, []);

  if (!isAuthReady) {
    // Optionally, render a splash screen or loader here
    return null;
  }

  return (
    <NavigationContainer>
      {user ? <MainTabNavigator /> : <AuthStackNavigator setUser={setUser} />}
    </NavigationContainer>
  );
}
