import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ScanResultScreen from '../screens/ScanResultScreen';
import CCCDDetailScreen from '../screens/CCCDDetailScreen';
import GPLXDetailScreen from '../screens/GPLXDetailScreen';
import BHYTDetailScreen from '../screens/BHYTDetailScreen';
import QRCodeScreen from '../screens/QRCodeScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#f5f5f5' }
        }}
      >
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ScanResult" component={ScanResultScreen} />
        <Stack.Screen name="CCCDDetail" component={CCCDDetailScreen} />
        <Stack.Screen name="GPLXDetail" component={GPLXDetailScreen} />
        <Stack.Screen name="BHYTDetail" component={BHYTDetailScreen} />
        <Stack.Screen name="QRCode" component={QRCodeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
