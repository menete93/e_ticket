// components/PriceBreakdown.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './style';

export default function PriceBreakdown({ calculation }) {
  if (!calculation) return null;

  const {
    subtotal = 0,
    finalPrice = 0,
    totalSavings = 0,
    appliedStrategies = [],
    couponDiscount = 0,
  } = calculation;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💰 Resumo dos valores</Text>

      {/* Subtotal */}
      <View style={styles.row}>
        <Text style={styles.label}>Subtotal</Text>
        <Text style={styles.value}>R$ {subtotal.toFixed(2)}</Text>
      </View>

      {/* Estratégias aplicadas */}
      {appliedStrategies.map((strategy, index) => (
        <View key={index} style={styles.row}>
          <View style={styles.strategyLabel}>
            <Icon name="tag" size={14} color="#10B981" />
            <Text style={styles.strategyName}>{strategy.name}</Text>
          </View>
          <Text style={styles.discountValue}>
            -R$ {strategy.discountValue?.toFixed(2)}
          </Text>
        </View>
      ))}

      {/* Cupom de desconto */}
      {couponDiscount > 0 && (
        <View style={styles.row}>
          <View style={styles.strategyLabel}>
            <Icon name="ticket-percent" size={14} color="#8B5CF6" />
            <Text style={styles.couponLabel}>Cupom</Text>
          </View>
          <Text style={styles.couponValue}>
            -R$ {couponDiscount.toFixed(2)}
          </Text>
        </View>
      )}

      {/* Linha divisória */}
      <View style={styles.divider} />

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>R$ {finalPrice.toFixed(2)}</Text>
      </View>

      {/* Economia total */}
      {totalSavings > 0 && (
        <View style={styles.savingsContainer}>
          <Icon name="heart" size={16} color="#EF4444" />
          <Text style={styles.savingsText}>
            Você economizou R$ {totalSavings.toFixed(2)}!
          </Text>
        </View>
      )}
    </View>
  );
}
