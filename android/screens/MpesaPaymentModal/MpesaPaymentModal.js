// components/checkout/MpesaPaymentModal.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import styles from './styles';
export const MpesaPaymentModal = ({
  isOpen,
  sale,
  buyerPhone,
  onClose,
  onConfirmPayment,
  loading,
}) => {
  const [phoneNumber, setPhoneNumber] = useState(buyerPhone);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const formatMoney = value => {
    return `${value} MT`;
  };

  const handleConfirm = () => {
    if (!acceptTerms) {
      alert('Você precisa aceitar os termos para continuar');
      return;
    }
    if (!phoneNumber || phoneNumber.length < 9) {
      alert('Por favor, insira um número de telefone válido');
      return;
    }
    onConfirmPayment(phoneNumber);
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pagamento via M-Pesa</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.saleSummary}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Evento:</Text>
                <Text style={styles.summaryValue}>{sale.eventName}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Ingresso:</Text>
                <Text style={styles.summaryValue}>{sale.ticketName}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Quantidade:</Text>
                <Text style={styles.summaryValue}>
                  {sale.quantity} unidade(s)
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total a pagar:</Text>
                <Text style={styles.totalAmount}>
                  {formatMoney(sale.totalAmount)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Referência:</Text>
                <Text style={styles.transactionRef}>{sale.transactionId}</Text>
              </View>
            </View>

            <View style={styles.mpesaInfo}>
              <Text style={styles.mpesaIcon}>💰</Text>
              <Text style={styles.mpesaInfoText}>
                Você receberá uma notificação no seu telefone para concluir o
                pagamento
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Número do M-Pesa *</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="84XXXXXXX"
                value={phoneNumber}
                onChangeText={text => setPhoneNumber(text.replace(/\D/g, ''))}
                keyboardType="phone-pad"
                editable={!loading}
              />
              <Text style={styles.helperText}>
                Digite o número associado à sua conta M-Pesa
              </Text>
            </View>

            <View style={styles.paymentInstructions}>
              <Text style={styles.instructionsTitle}>Como funciona:</Text>
              <View style={styles.instructionsList}>
                <Text style={styles.instructionItem}>
                  1. Confirme seu número de telefone
                </Text>
                <Text style={styles.instructionItem}>2. Clique em "Pagar"</Text>
                <Text style={styles.instructionItem}>
                  3. Você receberá uma solicitação no seu M-Pesa
                </Text>
                <Text style={styles.instructionItem}>
                  4. Digite seu PIN para autorizar o pagamento
                </Text>
                <Text style={styles.instructionItem}>
                  5. Aguardamos confirmação automática
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.termsCheckbox}
              onPress={() => setAcceptTerms(!acceptTerms)}
              disabled={loading}
            >
              <View
                style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}
              >
                {acceptTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                Li e aceito os termos e condições de compra
              </Text>
            </TouchableOpacity>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.payButton,
                  (loading || !acceptTerms || !phoneNumber) &&
                    styles.payButtonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={loading || !acceptTerms || !phoneNumber}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.payButtonText}>
                    Pagar {formatMoney(sale.totalAmount)}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
