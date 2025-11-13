import { StyleSheet } from 'react-native';
import {
  horizontalScale,
  verticalScale,
  scaleFontSize,
} from './../../../assets/styles/scaling';
const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  // Cores base - estas podem ser sobrescritas pelo GlobalStyle
  primaryColor: '#4F46E5',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  secondaryTextColor: '#666',
  placeholderColor: '#9ca3af',
  cardBackground: '#ffffff',

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#f8fafc',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  profileButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginVertical: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  reservationBanner: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reservationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reservationText: {
    marginLeft: 12,
  },
  reservationTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reservationSubtitle: {
    color: '#e0e7ff',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoryItem: {
    alignItems: 'center',
    padding: 12,
    marginRight: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    minWidth: 80,
  },
  categoryItemSelected: {
    backgroundColor: '#e0e7ff',
  },
  categoryText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  eventInfo: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  eventDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  buyButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buyButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },

  // Adicione estas styles no seu arquivo style.js

  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(12),
  },

  logoutButton: {
    padding: horizontalScale(8),
    borderRadius: horizontalScale(8),
    backgroundColor: '#f8f9fa',
  },
});

export default style;
