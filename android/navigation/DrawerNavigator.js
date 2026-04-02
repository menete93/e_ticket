import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MainTabs from './MainTabs';
import SettingsScreen from '../screens/SettingsScreen';
import colors from '../theme/colors';
import CategoryRegistry from './../screens/CategoriesRegistry/CategoryRegistry';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import CustomDrawerContent from './../components/CustomDrawerContent/CustomDrawerContent';
import EventRegistrationScreen from './../screens/EventRegistry/EventRegistry';
import PricingStrategyScreen from './../screens/PricingStrategy/PricingStrategyScreen';
import BottomTabs from './BottomTabs';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />} // <--- adiciona aqui
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        drawerStyle: { backgroundColor: colors.background },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
      }}
    >
      <Drawer.Screen
        name="Principal"
        component={HomeScreen}
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="Configurações"
        component={PricingStrategyScreen}
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="Adicionar categoria"
        component={CategoryRegistry}
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
          drawerIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Adicionar evento"
        component={EventRegistrationScreen}
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
          drawerIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="MainTabs"
        component={BottomTabs}
        options={{ title: 'Início' }}
      />
    </Drawer.Navigator>
  );
}
