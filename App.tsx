// App.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import SignInScreen from './Auth/SignInScreen';
import SignUpScreen from './Auth/SignUpScreen';
import DashboardScreen from './screens/DashboardScreen';
import TaskListScreen from './screens/TaskListScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import RedTasksScreen from './screens/RedTasksScreen';
import YellowTasksScreen from './screens/YellowTasksScreen';
import GreenTasksScreen from './screens/GreenTasksScreen';
import CompletedTasksScreen from './screens/CompletedTasksScreen';
import { supabase } from './supabaseClient';

// Define a type for your bottom tab navigator.
type TabParamList = {
  Dashboard: undefined;
  'Tasks List': undefined;
  Profile: undefined;
  Settings: undefined;
};

// Updated RootStackParamList: "Main" now accepts an optional nested parameter.
type RootStackParamList = {
  Main: { screen?: keyof TabParamList } | undefined;
  RedTasksScreen: undefined;
  YellowTasksScreen: undefined;
  GreenTasksScreen: undefined;
  CompletedTasksScreen: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

// Define a type for your auth stack.
type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const Tab = createBottomTabNavigator<TabParamList>();

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

function MainTabNavigator({ setUser }: { setUser: (user: any) => void }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
          if (route.name === 'Dashboard') {
            iconName = 'home-outline';
          } else if (route.name === 'Tasks List') {
            iconName = 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = 'person-outline';
          } else if (route.name === 'Settings') {
            iconName = 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Tasks List" component={TaskListScreen} />
      <Tab.Screen name="Profile">
        {(props) => <ProfileScreen {...props} setUser={setUser} />}
      </Tab.Screen>
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
    // Optionally, display a splash screen or loader here.
    return null;
  }

  return (
    <NavigationContainer>
      {user ? (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {/* Main tab navigator */}
          <RootStack.Screen name="Main">
            {(props) => <MainTabNavigator {...props} setUser={setUser} />}
          </RootStack.Screen>
          {/* Additional screens */}
          <RootStack.Screen name="RedTasksScreen" component={RedTasksScreen} options={{ title: 'Red Tasks' }} />
          <RootStack.Screen name="YellowTasksScreen" component={YellowTasksScreen} options={{ title: 'Yellow Tasks' }} />
          <RootStack.Screen name="GreenTasksScreen" component={GreenTasksScreen} options={{ title: 'Green Tasks' }} />
          <RootStack.Screen name="CompletedTasksScreen" component={CompletedTasksScreen} options={{ title: 'Completed Tasks' }} />
        </RootStack.Navigator>
      ) : (
        <AuthStackNavigator setUser={setUser} />
      )}
    </NavigationContainer>
  );
}
