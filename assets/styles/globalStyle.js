import { StyleSheet } from 'react-native';
import { verticalScale } from './scaling';

const globalStyle = StyleSheet.create({
  backgroundWhite: {
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  flexGrow: {
    flexGrow: 1,
  },
  marginBottom24: {
    marginBottom: verticalScale(24),
    paddingTop: verticalScale(10),
  },
});

export default globalStyle;
