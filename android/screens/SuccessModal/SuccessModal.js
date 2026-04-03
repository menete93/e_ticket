// components/checkout/SuccessModal.jsx
import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import styles from './styles';

export const SuccessModal = ({ isOpen, sale, onClose }) => {
  const formatMoney = value => {
    return `${value} MT`;
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.title}>Compra Realizada com Sucesso!</Text>
          <Text style={styles.subtitle}>
            Seus ingressos foram reservados e o pagamento foi confirmado.
          </Text>

          <View style={styles.ticketInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Transação:</Text>
              <Text style={styles.infoValue}>{sale.transactionId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Evento:</Text>
              <Text style={styles.infoValue}>{sale.eventName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ingressos:</Text>
              <Text style={styles.infoValue}>
                {sale.quantity}x {sale.ticketName}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total pago:</Text>
              <Text style={styles.totalValue}>
                {formatMoney(sale.totalAmount)}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
              <Text style={styles.primaryButtonText}>Ver Meus Ingressos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                // Navegar para home
                onClose();
              }}
            >
              <Text style={styles.secondaryButtonText}>Voltar para Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
