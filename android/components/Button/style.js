import { StyleSheet } from 'react-native';
import getFontFamily from '../../../assets/helper';
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from '../../../assets/styles/scaling';
const style = StyleSheet.create({
  Button: {
    backgroundColor: '#2979F2',
    height: verticalScale(50),
    borderRadius: horizontalScale(50),
    justifyContent: 'center',
  },

  title: {
    color: '#FFFFFF',
    fontFamily: getFontFamily(2, 500),
    fontSize: scaleFontSize(16),
    alignSelf: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default style;
