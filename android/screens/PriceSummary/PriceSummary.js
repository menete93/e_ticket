// components/checkout/PriceSummary.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import styles from './styles';

export const PriceSummary = ({ priceCalculation, onApplyCoupon, loading }) => {
  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const formatMoney = value => {
    return `${value} MT`;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    try {
      await onApplyCoupon(couponCode.toUpperCase());
      setShowCouponInput(false);
      setCouponCode('');
    } catch (error) {
      console.error('Erro ao aplicar cupom:', error);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    onApplyCoupon('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumo do Pedido</Text>

      <View style={styles.summaryItems}>
        {priceCalculation.items?.map((item, index) => (
          <View key={index} style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {item.quantity}x {item.ticketName}
            </Text>
            <Text style={styles.summaryValue}>{formatMoney(item.total)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Subtotal</Text>
        <Text style={styles.summaryValue}>
          {formatMoney(priceCalculation.subtotal)}
        </Text>
      </View>

      {priceCalculation.discount > 0 && (
        <View style={[styles.summaryRow, styles.discountRow]}>
          <Text style={styles.discountLabel}>Desconto</Text>
          <Text style={styles.discountValue}>
            - {formatMoney(priceCalculation.discount)}
          </Text>
        </View>
      )}

      {priceCalculation.appliedCoupon && (
        <View style={styles.appliedCouponContainer}>
          <Text style={styles.appliedCouponText}>
            Cupom: {priceCalculation.appliedCoupon.code}
          </Text>
          <TouchableOpacity onPress={handleRemoveCoupon} disabled={loading}>
            <Text style={styles.removeCouponText}>Remover</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>
          {formatMoney(priceCalculation.total)}
        </Text>
      </View>

      {!priceCalculation.appliedCoupon && !showCouponInput && (
        <TouchableOpacity
          style={styles.couponButton}
          onPress={() => setShowCouponInput(true)}
          disabled={loading}
        >
          <Text style={styles.couponButtonText}>
            Tenho um cupom de desconto
          </Text>
        </TouchableOpacity>
      )}

      {showCouponInput && (
        <View style={styles.couponInputGroup}>
          <TextInput
            style={styles.couponInput}
            placeholder="Digite seu código"
            value={couponCode}
            onChangeText={text => setCouponCode(text.toUpperCase())}
            editable={!loading && !applyingCoupon}
            maxLength={50}
          />
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApplyCoupon}
            disabled={loading || applyingCoupon || !couponCode.trim()}
          >
            {applyingCoupon ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.applyButtonText}>Aplicar</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
