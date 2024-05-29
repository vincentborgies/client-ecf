import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './Login';
import Home from './Home';
import Profile from './Profil';
import UpdateProfile from './UpdateProfil';

const Stack = createStackNavigator();

export default function App() {
  const [token, setToken] = useState(null);
  const [profileChanged, setProfileChanged] = useState(0);

  const storeToken = async (value) => {
    await AsyncStorage.setItem('token', value);
    setToken(value);
  };

  const getToken = async () => {
    const tokenValue = await AsyncStorage.getItem('token');
    setToken(tokenValue);
    return tokenValue;
  };

  const eraseToken = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          children={() => <LoginScreen storeToken={storeToken} eraseToken={eraseToken} />}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          children={() => <Home getToken={getToken} />}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          children={() => <Profile getToken={getToken} profileChanged={profileChanged} />}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UpdateProfile"
          children={() => <UpdateProfile getToken={getToken} setProfileChanged={setProfileChanged} profileChanged={profileChanged} />}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
