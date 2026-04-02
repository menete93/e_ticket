// screens/tickets/style.js
import { StyleSheet } from 'react-native';
import colors from './colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text.tertiary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: colors.primary,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.inverse,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },

  // Event Info Card
  eventInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventDate: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 8,
    flex: 1,
  },

  // Strategies Preview
  strategiesPreview: {
    backgroundColor: colors.surfaceHover,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  strategiesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 8,
  },
  strategyPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  strategyPreviewText: {
    fontSize: 13,
    color: colors.success,
    marginLeft: 8,
  },

  // Section Title
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },

  // Ticket Card
  ticketCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  ticketInfo: {
    flex: 1,
    marginRight: 16,
  },
  ticketName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  ticketDescription: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginBottom: 8,
  },

  // Price
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  normalPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  originalPrice: {
    fontSize: 14,
    color: colors.text.disabled,
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
  },

  // Badges
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHover,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryBadge: {
    backgroundColor: colors.primary + '20',
  },
  lowStockBadge: {
    backgroundColor: colors.danger + '20',
  },
  lowStockText: {
    color: colors.danger,
  },
  badgeText: {
    fontSize: 12,
    color: colors.text.secondary,
  },

  // Quantity Controls
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceHover,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    minWidth: 24,
    textAlign: 'center',
  },

  // Coupon Section
  couponSection: {
    marginTop: 8,
    marginBottom: 100,
  },
  couponInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: colors.text.disabled,
  },
  applyButtonText: {
    color: colors.text.inverse,
    fontWeight: '600',
    fontSize: 14,
  },

  // Footer
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 16,
    paddingBottom: 32,
  },

  // Checkout Button
  checkoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
  },
  checkoutGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  checkoutButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  checkoutTotal: {
    color: colors.text.inverse,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
