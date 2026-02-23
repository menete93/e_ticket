import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  // Container principal
  container: {
    flexGrow: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },

  // Badge de modo edição
  editModeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  editModeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 4,
  },

  // Seções
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },

  // Inputs
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelIcon: {
    marginRight: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  inputWithPrefix: {
    paddingLeft: 40,
  },
  inputWithSuffix: {
    paddingRight: 40,
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  currencySymbol: {
    position: 'absolute',
    left: 12,
    fontSize: 16,
    color: '#6B7280',
    zIndex: 1,
  },
  percentageSymbol: {
    position: 'absolute',
    right: 12,
    fontSize: 16,
    color: '#6B7280',
    zIndex: 1,
  },

  // Picker
  pickerContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
    color: '#1F2937',
  },

  // Loading
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },

  // Botões de tipo de estratégia
  strategyTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  strategyTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    gap: 8,
  },
  strategyTypeButtonActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  strategyTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  strategyTypeTextActive: {
    color: '#4F46E5',
  },

  // Grid de preços
  priceGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  priceColumn: {
    flex: 1,
  },
  priceInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  priceInfoText: {
    fontSize: 12,
    color: '#0369A1',
    marginLeft: 8,
    flex: 1,
  },

  // Grid dinâmico
  dynamicGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  dynamicColumn: {
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },

  // Escopo de aplicação
  scopeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  scopeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  scopeOptionActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  scopeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  scopeOptionTextActive: {
    color: '#4F46E5',
  },
  scopeOptionSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },

  // Switch
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  switchTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  switchText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  switchSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  // Botões
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 40,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    gap: 8,
    flex: 1,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Loading full screen
  loadingFullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  // Modal de seleção de estratégias
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  modalLoading: {
    padding: 40,
    alignItems: 'center',
  },
  modalLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  modalEmpty: {
    padding: 40,
    alignItems: 'center',
  },
  modalEmptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalEmptyButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
  },
  modalEmptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  modalList: {
    padding: 20,
  },
  modalListHeader: {
    marginBottom: 16,
  },
  modalListCount: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Item da lista de estratégias
  strategyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  strategyItemSelected: {
    backgroundColor: '#E0E7FF',
    borderColor: '#4F46E5',
  },
  strategyItemContent: {
    flex: 1,
    marginRight: 12,
  },
  strategyItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  strategyItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },

  strategyTypeFixed: {
    backgroundColor: '#E0E7FF',
  },
  strategyTypeBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  strategyItemEvent: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  strategyItemDetails: {
    flexDirection: 'row',
  },
  strategyItemPrice: {
    fontSize: 13,
    color: '#4B5563',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },

  // Estratégia selecionada
  selectedStrategyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#0EA5E9',
    marginBottom: 12,
  },
  selectedStrategyInfo: {
    flex: 1,
    marginRight: 12,
  },
  selectedStrategyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedStrategyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C4A6E',
    flex: 1,
    marginRight: 8,
  },
  selectedStrategyTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  selectedStrategyTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0C4A6E',
  },
  selectedStrategyDetails: {
    fontSize: 14,
    color: '#0369A1',
    marginBottom: 2,
  },
  clearSelectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  clearSelectionText: {
    fontSize: 14,
    color: '#EF4444',
    marginLeft: 4,
    fontWeight: '500',
  },

  // Botão para selecionar estratégia
  selectStrategyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  selectStrategyButtonTextContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
  },
  selectStrategyButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  selectStrategyButtonSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Botão para nova estratégia
  newStrategyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
  },
  newStrategyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },

  // Modal de confirmação de exclusão
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deleteModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  deleteModalIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  deleteModalText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteModalCancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  deleteModalCancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  deleteModalConfirmButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#EF4444',
    borderRadius: 8,
  },
  deleteModalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Refresh button
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  refreshButtonText: {
    fontSize: 14,
    color: '#4F46E5',
    marginLeft: 4,
  },

  // Empty states
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
  },

  // New strategy section
  newStrategySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // Strategies list
  strategiesList: {
    marginBottom: 30,
  },

  strategyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  strategyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },

  strategyTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 8,
  },

  // strategyTypeBadge: {
  //   paddingHorizontal: 8,
  //   paddingVertical: 2,
  //   borderRadius: 12,
  // },

  strategyTypeDynamic: {
    backgroundColor: '#FEF3C7',
  },
  strategyInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },

  strategyDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },

  strategyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },

  strategyDetailText: {
    fontSize: 13,
    color: '#4B5563',
    marginLeft: 4,
  },

  dynamicInfo: {
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },

  dynamicText: {
    fontSize: 13,
    color: '#374151',
    fontStyle: 'italic',
  },

  strategyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
    backgroundColor: '#F3F4F6',
  },

  deleteButtonStyle: {
    backgroundColor: '#FEF2F2',
  },

  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4F46E5',
    marginLeft: 4,
  },

  deleteButtonTextStyle: {
    color: '#EF4444',
  },
  // No seu arquivo style
  pickerLoading: {
    position: 'absolute',
    right: 40,
    top: 12,
    backgroundColor: 'transparent',
    zIndex: 1,
  },

  selectedTicketInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
    gap: 8,
  },

  selectedTicketText: {
    fontSize: 12,
    color: '#4F46E5',
    flex: 1,
  },
});
