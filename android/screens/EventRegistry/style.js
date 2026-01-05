import { StyleSheet } from 'react-native';

const style = StyleSheet.create({
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  disabledSection: {
    opacity: 0.6,
  },

  inputContainer: {
    marginBottom: 16,
  },

  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 14,
    backgroundColor: '#fafafa',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInput: {
    flex: 1,
    marginRight: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  categoryScroll: {
    flexDirection: 'row',
  },

  categoryButtonText: {
    color: '#666',
    fontSize: 14,
  },
  categoryButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginRight: 8,
  },

  uploadButtonSubtext: {
    color: '#666',
    fontSize: 12,
  },
  imagePreviewContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
  },
  imageActions: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  imageButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  changeButton: {
    backgroundColor: '#007AFF',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
  },
  imageButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  imageInfo: {
    padding: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
  },
  imageNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 18,
  },
  disabledButton: {
    opacity: 0.5,
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  uploadText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },

  dropdown: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    maxHeight: 150,
    zIndex: 999,
    elevation: 5,
  },

  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  inputWrapper: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginTop: 5,
    padding: 5,
    maxHeight: 200,
    elevation: 10, // Android
    shadowColor: '#000', // iOS
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 999,
  },
  option: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 5,
  },
  mapContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 5,
    overflow: 'hidden',
    height: 100, // 🔽 diminui a altura do mapa
  },

  mapHint: {
    padding: 5,
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    backgroundColor: '#F7F7F7',
  },

  staticMap: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },

  map: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    flex: 1,
  },

  optionText: {
    color: '#290909ff',
  },
  locationContainer: {
    marginVertical: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // para Android
  },

  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 10,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  uploadButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginRight: 10,
  },
  categoryButtonSelected: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#FFF',
  },
  submitButton: {
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default style;
