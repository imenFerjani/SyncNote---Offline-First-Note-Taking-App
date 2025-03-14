import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { LogBox } from 'react-native';

// Import screens
import HomeScreen from './screens/HomeScreen';
import NoteScreen from './screens/NoteScreen';
import SyncScreen from './screens/SyncScreen';

// Import context
import { AppProvider } from './context/AppContext';

// Ignore specific warnings (optional)
LogBox.ignoreLogs(['AsyncStorage has been extracted from react-native']);

const Stack = createStackNavigator();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#6200ee',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}>
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'Offline Notes' }} 
          />
          <Stack.Screen 
            name="Note" 
            component={NoteScreen} 
            options={({ route }) => ({ title: route.params?.title || 'New Note' })} 
          />
          <Stack.Screen 
            name="Sync" 
            component={SyncScreen} 
            options={{ title: 'Sync Status' }} 
          />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </AppProvider>
  );
}