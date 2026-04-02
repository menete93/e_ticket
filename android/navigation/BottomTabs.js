import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from '../screens/HomeScreen/HomeScreen';
import EventsScreen from '../screens/EventRegistry/EventRegistry';
import TicketsScreen from '../screens/TicketSale/TicketSelectionScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PriceBreakdown from './../screens/PriceBreakdown/PriceBreakdown';
import CreateCouponScreen from './../screens/Coupon/CreateCouponScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: 'gray',
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Eventos') {
            iconName = 'calendar';
          } else if (route.name === 'Tickets') {
            iconName = 'ticket';
          } else if (route.name === 'Perfil') {
            iconName = 'account';
          } else if (route.name === 'price') {
            iconName = 'cash';
          } else if (route.name === 'cupon') {
            iconName = 'ticket-percent';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="cupon" component={CreateCouponScreen} />
      <Tab.Screen name="price" component={PriceBreakdown} />
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Eventos" component={EventsScreen} />
      <Tab.Screen name="Tickets" component={TicketsScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
