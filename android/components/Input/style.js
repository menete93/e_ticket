import { StyleSheet } from 'react-native';
import getFontFamily from '../../../assets/helper';
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from '../../../assets/styles/scaling';

const style = StyleSheet.create({
  label: {
    fontFamily: getFontFamily(2, 500),
    fontSize: scaleFontSize(15),
    lineHeight: scaleFontSize(13),
    color: '#36455A',
    paddingVertical: verticalScale(25),
    marginHorizontal: horizontalScale(5),
  },
  input: {
    marginTop: verticalScale(1),
    paddingVertical: verticalScale(10),
    borderBottomWidth: 1, //linha na horizontal
    borderBottomColor: 'rgb(167,167,167,0.5)',
  },
});

export default style;
