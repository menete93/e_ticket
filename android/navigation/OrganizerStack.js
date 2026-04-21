// navigation/OrganizerStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Telas do Organizador
import OrganizerHomeScreen from './../screens/organizer/screens/home/OrganizerHomeScreen';
import CreateEventScreen from './../screens/organizer/screens/createEvent/CreateEventScreen';
import EventStatsScreen from './../screens/organizer/screens/eventStatisc/EventStatsScreen';
import EditEventScreen from './../screens/organizer/screens/EditEventScreen/EditEventScreen';
import TicketConfigurationScreen from './../screens/organizer/screens/TicketConfigurationScreen/TicketConfigurationScreen';
import ManageTicketsScreen from './../screens/organizer/screens/manage/ManageTicketsScreen';

const Stack = createNativeStackNavigator();

export default function OrganizerStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4F46E5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="OrganizerHome"
        component={OrganizerHomeScreen}
        options={{
          title: 'Dashboard',
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="EventStatsScreen"
        component={EventStatsScreen}
        options={{
          title: 'Estatísticas do Evento',
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="CreateEventScreen"
        component={CreateEventScreen}
        options={{
          title: 'Criar Evento',
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="EditEventScreen"
        component={EditEventScreen}
        options={{
          title: 'Editar Evento',
          headerShown: false, // Se quiser esconder o header do navigator
        }}
      />

      <Stack.Screen
        name="TicketConfigurationScreen"
        component={TicketConfigurationScreen}
        options={{
          title: 'Configurar Ingressos',
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="ManageTicketsScreen"
        component={ManageTicketsScreen}
        options={{
          title: 'Configurar Ingressos',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
