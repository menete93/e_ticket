import { StyleSheet } from 'react-native';
import { horizontalScale, verticalScale } from '../../../assets/styles/scaling';

const style = StyleSheet.create({
  searchInput: {
    // borderWidth: 1,
    flex: 1,
    marginLeft: horizontalScale(10),
    height: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: horizontalScale(20),
    backgroundColor: '#F3F5F9',
    height: verticalScale(40),
    alignItems: 'center',
    marginTop: verticalScale(50), // ⬅️ isso move o input para baixo
    borderRadius: verticalScale(50),
  },
});

export default style;
