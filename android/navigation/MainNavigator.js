// navigation/MainNavigator.js
import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Telas do Usuário
import HomeScreen from './../screens/user/screens/Home/HomeScreen';
import MyTicketsScreen from './../screens/user/screens/MyTicket/MyTicketsScreen';
import ProfileScreen from './../screens/user/screens/Profile/ProfileScreen';
import ApplyStrategiesScreen from './../screens/PricingStrategy/PricingStrategyScreen';

import CreateEventScreen from './../screens/organizer/screens/createEvent/CreateEventScreen';
import OrganizerHomeScreen from './../screens/organizer/screens/home/OrganizerHomeScreen';
import OrganizerStack from './../navigation/OrganizerStack';
import HomeStack from './../navigation/HomeStack';
import { isUserOrganizer } from '../utils/roleChecker';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const isOrganizer = isUserOrganizer(user);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Início') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Meus Ingressos') {
            iconName = focused ? 'ticket' : 'ticket-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Estrategias') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      })}
    >
      {isOrganizer ? (
        <>
          <Tab.Screen
            name="Dashboard"
            component={OrganizerStack} // ← MUDE PARA O STACK
            options={{ headerShown: false }}
          />
          {/* <Tab.Screen name="Dashboard" component={OrganizerHomeScreen} /> */}
          <Tab.Screen name="Estrategias" component={ApplyStrategiesScreen} />
          <Tab.Screen name="Perfil" component={ProfileScreen} />
        </>
      ) : (
        <>
          <Tab.Screen name="Início" component={HomeStack} />
          <Tab.Screen name="Meus Ingressos" component={MyTicketsScreen} />
          <Tab.Screen name="Perfil" component={ProfileScreen} />
        </>
      )}
    </Tab.Navigator>
  );
}
