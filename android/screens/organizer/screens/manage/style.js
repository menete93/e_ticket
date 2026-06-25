// screens/organizer/ManageTicketsScreen.style.js
import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  // ==================== HEADER ====================
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  batchButton: {
    padding: 8,
  },
  addButton: {
    padding: 8,
  },
  // ==================== BANNERS ====================
  disabledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: 12,
  },
  disabledBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#991B1B',
    fontWeight: '500',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 12,
  },
  warningBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
  },
  capacityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 12,
  },
  capacityBannerError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  capacityBannerContent: {
    flex: 1,
  },
  capacityBannerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 4,
  },
  capacityBannerTitleError: {
    color: '#991B1B',
  },
  capacityBannerSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  // ==================== LISTA DE TICKETS ====================
  ticketList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  disabledCard: {
    opacity: 0.7,
    backgroundColor: '#F9FAFB',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ticketIcon: {
    fontSize: 20,
  },
  ticketName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  // ==================== ESTATÍSTICAS ====================
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  // ==================== PREÇO ====================
  priceContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  basePriceLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  basePriceValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1E293B',
  },
  finalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
  },
  finalPriceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  finalPriceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  finalPriceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 10,
    gap: 6,
  },
  infoNoteText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  // ==================== BATCH MODE ====================
  batchInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    textAlign: 'center',
    minWidth: 80,
  },
  batchFooter: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  batchFooterInfo: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  batchFooterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  batchFooterSubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  batchFooterButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  batchCancelButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  batchSaveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // ==================== MODAL ====================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
  },
  helperText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#92400E',
    flex: 1,
  },
  categorySelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  categoryOption: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  categoryOptionIcon: {
    fontSize: 24,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#F3F4F6',
  },
  modalCancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  modalConfirmButton: {
    backgroundColor: '#4F46E5',
  },
  modalConfirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  // ==================== ESTADOS VAZIOS ====================
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  createTicketButtonText: {
    fontSize: 14,
    color: '#4F46E5',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  // ManageTicketsScreen.style.js - Adicione

  // ==================== BADGES DE ESTRATÉGIA ====================
  noStrategyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
    gap: 4,
    alignSelf: 'flex-start',
  },
  noStrategyBadgeText: {
    fontSize: 10,
    color: '#92400E',
    fontWeight: '500',
  },
  hasStrategyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
    gap: 4,
    alignSelf: 'flex-start',
  },
  hasStrategyBadgeText: {
    fontSize: 10,
    color: '#065F46',
    fontWeight: '500',
  },
  // ManageTicketsScreen.style.js - Adicione

  capacityWarningModal: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  capacityWarningModalText: {
    fontSize: 13,
    color: '#991B1B',
    flex: 1,
  },
  capacityWarningModalLink: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
