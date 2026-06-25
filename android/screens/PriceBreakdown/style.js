// components/PriceBreakdown.style.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  // Container principal
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Título principal
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },

  // Seções
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginTop: 12,
    marginBottom: 8,
  },

  // Linhas normais
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },

  // Estratégias
  strategyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingLeft: 8,
  },
  strategyLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  strategyName: {
    fontSize: 13,
    color: '#10B981',
  },
  discountValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#10B981',
  },

  // Cupom
  couponRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingTop: 4,
    paddingLeft: 8,
  },
  couponLabel: {
    fontSize: 13,
    color: '#8B5CF6',
  },
  couponValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8B5CF6',
  },

  // Taxas
  feesValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F59E0B',
  },

  // Divisor
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },

  // Total
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F46E5',
  },

  // Economia
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
    paddingVertical: 8,
    borderRadius: 8,
  },
  savingsText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },

  // Informação adicional
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
