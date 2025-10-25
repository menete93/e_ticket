import { StyleSheet } from 'react-native';
import getFontFamily from '../../../assets/helper';
import { scaleFontSize, verticalScale } from './../../../assets/styles/scaling';

const style = StyleSheet.create({
  title1: {
    fontFamily: getFontFamily(1, 700),
    fontSize: scaleFontSize(20),
    lineHeight: scaleFontSize(20),
    marginLeft: -43,
  },

  title2: {
    fontFamily: getFontFamily(3, 600),
    fontSize: scaleFontSize(18),
    lineHeight: scaleFontSize(20),
    marginLeft: -40,
  },

  title3: {
    fontFamily: getFontFamily(3, 600),
    fontSize: scaleFontSize(16),
    lineHeight: scaleFontSize(18),
    marginLeft: 5,
    marginTop: -50,
  },
});

export default style;
