import { StyleSheet } from 'react-native';
import getFontFamily from '../../../assets/helper';
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from '../../../assets/styles/scaling';
const style = StyleSheet.create({
  tab: {
    backgroundColor: '#2979F2',
    height: verticalScale(40),
    borderRadius: horizontalScale(50),
    justifyContent: 'center',
  },

  title: {
    color: '#FFFFFF',
    fontFamily: getFontFamily(3, 600),
    fontSize: scaleFontSize(14),
    alignSelf: 'center',
    paddingHorizontal: horizontalScale(30), // <-- Adicione esta linha
  },
  inactiveTab: {
    backgroundColor: '#F3F5F9',
  },
  inactiveTitle: {
    color: '#79869F',
  },
});

export default style;
