// screens/checkout/PaymentSuccessScreen.jsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';

export default function PaymentSuccessScreen({ route, navigation }) {
  const { sale, paymentMethod } = route.params;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
        <View style={styles.successIconContainer}>
          <Icon name="check-circle" size={80} color="#fff" />
        </View>
        <Text style={styles.title}>Pagamento Confirmado!</Text>
        <Text style={styles.subtitle}>
          Seus ingressos foram reservados com sucesso
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <LinearGradient
          colors={paymentMethod.colors}
          style={styles.paymentMethodCard}
        >
          <Image source={paymentMethod.logo} style={styles.successLogo} />
          <Text style={styles.paymentMethodText}>
            Pago com {paymentMethod.name}
          </Text>
        </LinearGradient>

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Detalhes da compra</Text>

          <View style={styles.detailRow}>
            <Icon name="ticket" size={20} color="#4F46E5" />
            <Text style={styles.detailLabel}>Código:</Text>
            <Text style={styles.detailValue}>{sale.transactionId}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="calendar" size={20} color="#4F46E5" />
            <Text style={styles.detailLabel}>Evento:</Text>
            <Text style={styles.detailValue}>{sale.eventName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="ticket-percent" size={20} color="#4F46E5" />
            <Text style={styles.detailLabel}>Quantidade:</Text>
            <Text style={styles.detailValue}>{sale.quantity}x</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="cash" size={20} color="#4F46E5" />
            <Text style={styles.detailLabel}>Total pago:</Text>
            <Text style={styles.totalAmount}>
              {sale.totalAmount.toFixed(2)} MT
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('MyTickets')}
          >
            <LinearGradient
              colors={['#4F46E5', '#7C3AED']}
              style={styles.buttonGradient}
            >
              <Icon name="ticket" size={20} color="#fff" />
              <Text style={styles.buttonText}>Ver meus ingressos</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.popToTop()}
          >
            <Text style={styles.secondaryButtonText}>Voltar para Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
