import { StyleSheet } from 'react-native';
import getFontFamily from '../../../assets/helper';
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from '../../../assets/styles/scaling';
const style = StyleSheet.create({
  bagde: {
    backgroundColor: '#145855',
    height: verticalScale(20),
    borderRadius: horizontalScale(50),
    justifyContent: 'center',
  },

  title: {
    color: '#FFFFFF',
    fontFamily: getFontFamily(2, 600),
    fontSize: scaleFontSize(14),
    alignSelf: 'center',
  },

  inactiveTitle: {
    color: '#79869F',
  },
});

export default style;
