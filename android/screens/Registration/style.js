import { StyleSheet } from 'react-native';
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from '../../../assets/styles/scaling';
import getFontFamily from '../../../assets/helper';

const style = StyleSheet.create({
  container: {
    marginHorizontal: horizontalScale(24),
    marginVertical: verticalScale(24),
    // flex: 1,
    justifyContent: 'center',
  },
  buttonContainer: {
    paddingBottom: verticalScale(150),
    marginVertical: verticalScale(24),
  },
  newaccount: {
    justifyContent: 'center', // centraliza verticalmente
    alignItems: 'center', // centraliza horizontalmente
  },
  error: {
    fontFamily: getFontFamily(2, 500),
    fontSize: scaleFontSize(16),
    color: '#FF0000',
    marginBottom: verticalScale(24),
  },
  success: {
    fontFamily: getFontFamily(2, 500),
    fontSize: scaleFontSize(16),
    color: '#28a745',
    marginBottom: verticalScale(24),
  },
});

export default style;
