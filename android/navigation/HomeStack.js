// navigation/HomeStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importar suas telas existentes
import HomeScreen from './../screens/user/screens/Home/HomeScreen';
import TicketSelectionScreen from './../screens/TicketSale/TicketSelectionScreen';
// Importe outras telas que você tenha para o fluxo de eventos
import CheckoutFlow from './../screens/CheckoutFlow/CheckoutFlow';

import CheckoutScreen from './../screens/checkout/CheckoutScreen';
// import TicketConfirmationScreen from '../screens/user/screens/TicketConfirmation/TicketConfirmationScreen';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4F46E5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitle: 'Voltar',
      }}
    >
      {/* Tela inicial - sem header */}
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />

      {/* Tela de seleção de ingressos - com header */}
      <Stack.Screen
        name="TicketSelection"
        component={TicketSelectionScreen}
        options={{
          title: 'Selecionar Ingressos',
          headerShown: true,
        }}
      />

      {/* Adicione outras telas do fluxo de compra conforme necessário */}

      <Stack.Screen
        name="CheckoutScreen"
        component={CheckoutScreen}
        options={{
          title: 'Pagamento',
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="CheckoutFlow"
        component={CheckoutFlow}
        options={{
          title: 'Finalizar Compra',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}
