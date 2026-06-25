// components/PriceBreakdown.js
import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './style';

/**
 * Componente para exibir o detalhamento de preços
 * @param {Object} calculation - Objeto com os dados de cálculo
 * @param {number} calculation.subtotal - Subtotal sem descontos
 * @param {number} calculation.finalPrice - Preço final após descontos
 * @param {number} calculation.totalSavings - Economia total
 * @param {Array} calculation.appliedStrategies - Estratégias aplicadas
 * @param {number} calculation.couponDiscount - Desconto de cupom
 * @param {number} calculation.fees - Taxas adicionais (opcional)
 * @param {number} calculation.quantity - Quantidade de ingressos (opcional)
 */
export default function PriceBreakdown({ calculation }) {
  if (!calculation) return null;

  const {
    subtotal = 0,
    finalPrice = 0,
    totalSavings = 0,
    appliedStrategies = [],
    couponDiscount = 0,
    fees = 0,
    quantity = 1,
  } = calculation;

  // Função para formatar moeda (Metical)
  const formatMoney = value => {
    return `${value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} MT`;
  };

  // Verifica se tem estratégias aplicadas
  const hasStrategies = appliedStrategies && appliedStrategies.length > 0;
  const hasDiscount = couponDiscount > 0 || totalSavings > 0;

  return (
    <View style={styles.container}>
      {/* Título */}
      <View style={styles.titleContainer}>
        <Icon name="calculator" size={20} color="#4F46E5" />
        <Text style={styles.title}>Resumo dos valores</Text>
      </View>

      {/* Quantidade (opcional) */}
      {quantity > 1 && (
        <View style={styles.row}>
          <Text style={styles.label}>Quantidade</Text>
          <Text style={styles.value}>{quantity} ingressos</Text>
        </View>
      )}

      {/* Subtotal */}
      <View style={styles.row}>
        <Text style={styles.label}>Subtotal</Text>
        <Text style={styles.value}>{formatMoney(subtotal)}</Text>
      </View>

      {/* Estratégias aplicadas */}
      {hasStrategies && (
        <>
          <Text style={styles.sectionSubtitle}>📊 Estratégias aplicadas</Text>
          {appliedStrategies.map((strategy, index) => (
            <View key={index} style={styles.strategyRow}>
              <View style={styles.strategyLabel}>
                <Icon name="tag-outline" size={14} color="#10B981" />
                <Text style={styles.strategyName}>{strategy.name}</Text>
              </View>
              <Text style={styles.discountValue}>
                - {formatMoney(strategy.discountValue || 0)}
              </Text>
            </View>
          ))}
        </>
      )}

      {/* Cupom de desconto */}
      {couponDiscount > 0 && (
        <View style={styles.couponRow}>
          <View style={styles.strategyLabel}>
            <Icon name="ticket-percent" size={14} color="#8B5CF6" />
            <Text style={styles.couponLabel}>Cupom de desconto</Text>
          </View>
          <Text style={styles.couponValue}>
            - {formatMoney(couponDiscount)}
          </Text>
        </View>
      )}

      {/* Taxas (se houver) */}
      {fees > 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>Taxas</Text>
          <Text style={styles.feesValue}>{formatMoney(fees)}</Text>
        </View>
      )}

      {/* Linha divisória */}
      <View style={styles.divider} />

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total a pagar</Text>
        <Text style={styles.totalValue}>{formatMoney(finalPrice)}</Text>
      </View>

      {/* Economia total */}
      {totalSavings > 0 && (
        <View style={styles.savingsContainer}>
          <Icon name="heart" size={16} color="#EF4444" />
          <Text style={styles.savingsText}>
            Você economizou {formatMoney(totalSavings)}!
          </Text>
        </View>
      )}

      {/* Info adicional */}
      {!hasDiscount && (
        <View style={styles.infoContainer}>
          <Icon name="information-outline" size={14} color="#6B7280" />
          <Text style={styles.infoText}>Nenhum desconto aplicado</Text>
        </View>
      )}
    </View>
  );
}
