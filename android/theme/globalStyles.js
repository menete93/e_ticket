import { StyleSheet } from 'react-native';
import colors from './colors';
import getFontFamily from './../../assets/helper';
import scaleFontSize from './../../assets/styles/scaling';

const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 50,
  },
  textPrimary: {
    color: colors.textPrimary,
  },
  textSecondary: {
    color: colors.textSecondary,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },

  title: {
    // color: '#FFFFFF',
    // fontFamily: getFontFamily(1, 900),
    // fontSize: scaleFontSize(16),
    // alignSelf: 'center',

    fontFamily: 'Poppins-ExtraBoldItalic', // ou 'Billabong' se for o logo
    fontSize: 28,
    color: '#fff',
    alignSelf: 'center',
  },
});

export default globalStyles;
