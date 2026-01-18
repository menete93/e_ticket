import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import DrawerNavigator from './DrawerNavigator';
import Login from './../screens/Login/Login';
import TicketConfigurationScreen from './../screens/TicketConfigurationScreen/TicketConfigurationScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={Login} />

        <Stack.Screen name="Main" component={DrawerNavigator} />
        <Stack.Screen
          name="TicketConfiguration"
          component={TicketConfigurationScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
