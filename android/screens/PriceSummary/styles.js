import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 16,
  },
  summaryItems: {
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#4a5568',
  },
  summaryValue: {
    fontSize: 14,
    color: '#4a5568',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
  },
  discountRow: {
    marginTop: 4,
  },
  discountLabel: {
    fontSize: 14,
    color: '#48bb78',
  },
  discountValue: {
    fontSize: 14,
    color: '#48bb78',
    fontWeight: '500',
  },
  appliedCouponContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  appliedCouponText: {
    fontSize: 13,
    color: '#16a34a',
    fontWeight: '500',
  },
  removeCouponText: {
    fontSize: 12,
    color: '#e53e3e',
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#48bb78',
  },
  couponButton: {
    marginTop: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  couponButtonText: {
    fontSize: 14,
    color: '#667eea',
  },
  couponInputGroup: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  couponInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    fontSize: 14,
  },
  applyButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
