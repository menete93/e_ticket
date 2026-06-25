// navigation/HomeStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importar suas telas existentes
import HomeScreen from './../screens/user/screens/Home/HomeScreen';
import TicketSelectionScreen from './../screens/TicketSale/TicketSelectionScreen';

// ✅ IMPORTAR AS NOVAS TELAS
import CheckoutScreen from './../screens/checkout/CheckoutScreen';
import ReservationCreatedScreen from './../screens/Reservation/ReservationCreatedScreen';
import PaymentScreen from './../screens/Payment/PaymentScreen';
import PaymentSuccessScreen from './../screens/PaymentSuccess/PaymentSuccessScreen';
import MyReservationsScreen from './../screens/MyReservations/MyReservationsScreen';

// ❌ REMOVER import do antigo CheckoutFlow
// import CheckoutFlow from './../screens/CheckoutFlow/CheckoutFlow';

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
        options={{ headerShown: false }}
      />

      {/* Tela de seleção de ingressos */}
      <Stack.Screen
        name="TicketSelection"
        component={TicketSelectionScreen}
        options={{ title: 'Selecionar Ingressos', headerShown: false }}
      />

      {/* ✅ NOVAS TELAS DO FLUXO DE CHECKOUT */}
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Checkout', headerShown: true }}
      />

      <Stack.Screen
        name="ReservationCreated"
        component={ReservationCreatedScreen}
        options={{ title: 'Reserva Criada', headerShown: false }}
      />

      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ title: 'Pagamento', headerShown: false }}
      />

      <Stack.Screen
        name="PaymentSuccess"
        component={PaymentSuccessScreen}
        options={{ title: 'Sucesso', headerShown: false }}
      />

      <Stack.Screen
        name="MyReservations"
        component={MyReservationsScreen}
        options={{ title: 'Minhas Reservas', headerShown: true }}
      />

      {/* ❌ REMOVER a rota antiga do CheckoutFlow */}
      {/* <Stack.Screen name="CheckoutFlow" component={CheckoutFlow} ... /> */}
    </Stack.Navigator>
  );
}
