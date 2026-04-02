import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  // Header
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  resetButton: {
    position: 'absolute',
    top: 0,
    right: 20,
    padding: 8,
  },

  // Container
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // Steps
  stepsWrapper: {
    marginBottom: 24,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepCircleActive: {
    backgroundColor: '#6366F1',
  },
  stepLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  stepLabelActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
  stepLine: {
    height: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#6366F1',
  },

  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoriesCard: {
    // Estilo específico
  },
  strategiesCard: {
    // Estilo específico
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  cardLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardPlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  cardHint: {
    fontSize: 12,
    color: '#6366F1',
  },
  cardDescription: {
    fontSize: 13,
    color: '#6B7280',
  },

  // Select All Button
  selectAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
  },
  selectAllText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '500',
  },

  // Categories
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 6,
    marginRight: 4,
  },
  categoryChipTextSelected: {
    color: '#6366F1',
    fontWeight: '500',
  },
  categoryChipBadge: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  categoryChipBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Selected Count Badge
  selectedCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  selectedCountText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
    marginLeft: 8,
  },

  // Loading Tickets
  loadingTickets: {
    padding: 20,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },

  // Add Button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '500',
    marginLeft: 4,
  },

  // Conflict Warning
  conflictWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  conflictWarningText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
    marginLeft: 8,
  },

  // Strategies List
  strategiesList: {
    marginTop: 8,
  },
  strategyCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  strategyGradient: {
    padding: 16,
  },
  strategyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  strategyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  strategyInfo: {
    flex: 1,
  },
  strategyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  strategySubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  strategyAction: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  associatedCatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  associatedCatTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  associatedCatText: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  noAssociationText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 8,
  },

  // Empty Strategies
  emptyStrategies: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyStrategiesText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },

  // Apply Button
  applyButton: {
    borderRadius: 30,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  applyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  applyButtonDisabled: {
    opacity: 0.7,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    marginRight: 12,
  },
  applyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  applyBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: height * 0.8,
  },
  strategyModalContainer: {
    maxHeight: height * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalList: {
    padding: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  modalFooterText: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalConfirmButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  modalConfirmButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Event Modal Items
  eventModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
  },
  eventModalItemSelected: {
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  eventModalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventModalInfo: {
    flex: 1,
  },
  eventModalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  eventModalDate: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Strategy Modal Items
  strategyModalItem: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  strategyModalItemSelected: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  strategyModalGradient: {
    padding: 16,
    flexDirection: 'row',
  },
  strategyModalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  strategyModalContent: {
    flex: 1,
  },
  strategyModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  strategyModalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  strategyModalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  strategyModalDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  strategyModalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  strategyTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  strategyTypeText: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
  },
  strategyInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strategyInfoText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },

  // Association Modal
  associationSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  associationList: {
    padding: 16,
  },
  associationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
  },
  associationItemSelected: {
    backgroundColor: '#EEF2FF',
  },
  associationItemText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  associationItemTextSelected: {
    color: '#6366F1',
    fontWeight: '500',
  },

  // Details Modal
  detailsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailsModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    width: width * 0.9,
    maxHeight: height * 0.8,
    overflow: 'hidden',
  },
  detailsModalHeader: {
    padding: 30,
    alignItems: 'center',
  },
  detailsModalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  detailsModalSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  detailsModalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  detailsModalContent: {
    padding: 20,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  detailsModalButton: {
    backgroundColor: '#6366F1',
    padding: 16,
    alignItems: 'center',
  },
  detailsModalButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Results Modal
  resultItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
  },
  resultSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  resultError: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  resultIconContainer: {
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultStrategyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  // resultMessage: {
  //   fontSize: 14,
  //   color: '#4B5563',
  //   marginBottom: 8,
  // },
  resultStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultStatsText: {
    fontSize: 12,
    color: '#6366F1',
    marginLeft: 4,
  },

  // style.js (adicione estes estilos)

  resultsSummary: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },

  summaryGradient: {
    padding: 20,
    alignItems: 'center',
  },

  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },

  summarySubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },

  resultCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  resultGradient: {
    padding: 16,
  },

  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  resultIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  resultHeaderInfo: {
    flex: 1,
  },

  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },

  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  resultCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },

  resultCategory: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
  },

  resultBody: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 12,
  },

  resultMessage: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },

  resultDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  resultDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  resultDetailText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginLeft: 4,
  },

  resultsList: {
    paddingBottom: 16,
  },

  confirmGradient: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
});
