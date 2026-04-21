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
    if (value === undefined || value === null) return '0 MT';
    return `${value.toFixed(2)} MT`;
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

  // Se não tem priceCalculation, não mostra nada
  if (!priceCalculation) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Resumo do Pedido</Text>
        <Text style={styles.emptyText}>Selecione os ingressos</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumo do Pedido</Text>

      {/* Items do breakdown */}
      {priceCalculation.breakdown && priceCalculation.breakdown.length > 0 && (
        <View style={styles.summaryItems}>
          {priceCalculation.breakdown.map((item, index) => (
            <View key={index} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {item.quantity}x {item.ticketName}
              </Text>
              <Text style={styles.summaryValue}>
                {formatMoney(item.subtotal)}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.divider} />

      {/* Subtotal */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Subtotal</Text>
        <Text style={styles.summaryValue}>
          {formatMoney(priceCalculation.subtotal)}
        </Text>
      </View>

      {/* Desconto */}
      {priceCalculation.discount > 0 && (
        <View style={[styles.summaryRow, styles.discountRow]}>
          <Text style={styles.discountLabel}>Desconto</Text>
          <Text style={styles.discountValue}>
            - {formatMoney(priceCalculation.discount)}
          </Text>
        </View>
      )}

      {/* Cupom aplicado (se houver) */}
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

      {/* Estratégias aplicadas */}
      {priceCalculation.appliedStrategies &&
        priceCalculation.appliedStrategies.length > 0 && (
          <View style={styles.strategiesContainer}>
            <Text style={styles.strategiesTitle}>Estratégias aplicadas:</Text>
            {priceCalculation.appliedStrategies.map((strategy, index) => (
              <View key={index} style={styles.strategyRow}>
                <Text style={styles.strategyName}>{strategy.strategyName}</Text>
                <Text style={styles.strategyDiscount}>
                  - {formatMoney(strategy.discount)}
                </Text>
              </View>
            ))}
          </View>
        )}

      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>
          {formatMoney(priceCalculation.finalPrice)}
        </Text>
      </View>

      {/* Botão de cupom */}
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

      {/* Input do cupom */}
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
