// screens/checkout/CheckoutScreen.jsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CheckoutFlow from './../../screens/CheckoutFlow/CheckoutFlow';
import styles from './styles';

export default function CheckoutScreen({ route, navigation }) {
  const params = route.params || {};

  // ✅ LOG DETALHADO
  console.log('🔍🔍🔍 CheckoutScreen - PARAMS COMPLETO:', params);
  console.log('🔍🔍🔍 CheckoutScreen - eventId:', params.eventId);
  console.log('🔍🔍🔍 CheckoutScreen - event:', params.event);

  // ✅ Tenta extrair o eventId de diferentes formas
  const eventId =
    params.eventId || params.event?.id || params.eventIdFromParams;
  const eventName = params.eventName || params.event?.name || 'Evento';
  const user = params.user;

  console.log('🔍 CheckoutScreen - TODOS os params:', Object.keys(params));
  console.log('🔍 CheckoutScreen - eventId encontrado:', eventId);

  if (!eventId) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>Erro ao carregar checkout</Text>
        <Text style={styles.errorMessage}>Dados do evento não encontrados</Text>
        <Text style={styles.errorDetails}>
          Parâmetros recebidos: {Object.keys(params).join(', ')}
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <CheckoutFlow eventId={eventId} eventName={eventName} user={user} />;
}
