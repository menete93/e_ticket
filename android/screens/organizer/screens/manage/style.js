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
  // ==================== BANNER DE CAPACIDADE ====================
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
  capacityBannerText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '500',
  },
  capacityBannerTextError: {
    color: '#EF4444',
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
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ticketIconContainer: {
    marginRight: 12,
  },
  ticketIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketInfo: {
    flex: 1,
  },
  ticketName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  ticketDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  editQuantityButton: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 4,
  },
  editQuantityText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  soldNumber: {
    color: '#10B981',
  },
  statSubtext: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 2,
  },
  // ==================== PROGRESSO ====================
  progressSection: {
    marginTop: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'right',
  },
  // ==================== PREÇO COM ESTRATÉGIAS ====================
  priceContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  priceHeaderText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
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
  strategiesContainer: {
    marginTop: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  strategiesTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  strategyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  strategyName: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
  },
  strategyImpact: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '500',
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
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  infoNoteText: {
    fontSize: 10,
    color: '#64748B',
    flex: 1,
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
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  modalTitle: {
    fontSize: 20,
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
    paddingHorizontal: 20,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 11,
    color: '#999',
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
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
  emptyStateSubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  batchButton: {
    padding: 8,
  },
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
  },
  batchSaveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
});
