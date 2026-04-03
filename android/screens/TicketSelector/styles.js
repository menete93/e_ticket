import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#718096',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    color: '#e53e3e',
    fontSize: 14,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 20,
  },
  ticketItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  disabledItem: {
    opacity: 0.5,
  },
  ticketInfo: {
    flex: 1,
    marginRight: 16,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  ticketName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },
  ticketPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 6,
  },
  ticketDescription: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 6,
  },
  benefitsContainer: {
    marginBottom: 6,
  },
  benefitsText: {
    fontSize: 11,
    color: '#48bb78',
  },
  ticketStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
  },
  statsText: {
    fontSize: 10,
    color: '#a0aec0',
  },
  ticketQuantity: {
    minWidth: 100,
    alignItems: 'flex-end',
  },
  quantityLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 6,
  },
  quantityInput: {
    width: 70,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 14,
  },
});
