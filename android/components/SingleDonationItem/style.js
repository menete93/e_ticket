import { StyleSheet } from 'react-native';
import { horizontalScale, verticalScale } from '../../../assets/styles/scaling';

const style = StyleSheet.create({
  image: {
    width: horizontalScale(150),
    height: verticalScale(150),
    borderRadius: horizontalScale(20),
    // marginBottom: -5,
    // marginTop: verticalScale(56),
  },
  badge: {
    position: 'absolute',
    zIndex: 1,
    top: verticalScale(6),
  },
  donationInformation: {
    marginTop: verticalScale(8),
    // paddingVertical: 10,
  },
  price: {
    marginTop: verticalScale(-40),
    marginHorizontal: horizontalScale(10),
  },
});

export default style;
