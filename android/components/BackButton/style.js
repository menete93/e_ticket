import { StyleSheet } from 'react-native';
import { horizontalScale } from '../../../assets/styles/scaling';
import getFontFamily from '../../../assets/helper';

const style = StyleSheet.create({
  container: {
    backgroundColor: '#FAFAFA',
    width: horizontalScale(44),
    height: horizontalScale(44),
    borderRadius: horizontalScale(22),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  icon: {
    // fontFamily: getFontFamily(3, 600),
    // fontSize: 40,
    fontWeight: 10,
  },
});

export default style;
