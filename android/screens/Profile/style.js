import React from 'react';
import { StyleSheet } from 'react-native';
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from '../../../assets/styles/scaling';

const style = StyleSheet.create({
  profileImage: {
    width: horizontalScale(110),
    height: horizontalScale(110),
    borderRadius: horizontalScale(100),
  },
  profileImageContainer: {
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: verticalScale(32),
  },
  profileImageContent: {
    borderWidth: 1,
    borderColor: '#0150EC',
    padding: horizontalScale(8),
    borderRadius: horizontalScale(100),
  },
  name: {
    fontSize: scaleFontSize(24),
    // flex: 1, // o flex segura
    marginTop: verticalScale(20),
    textAlign: 'center',
    fontFamily: 'Inter_28pt-Bold',
  },
  statAmount: {
    marginTop: verticalScale(32),
    fontFamily: 'Inter_28pt-Bold',
    color: '#022150',
    textAlign: 'center',
  },
  statType: {
    fontFamily: 'Inter_28pt-Light',
    color: '#022150',
    fontSize: scaleFontSize(16),
  },
  statContainer: {
    flexDirection: 'row',
    borderColor: '#E9EFF1',
    justifyContent: 'space-between',
    marginHorizontal: horizontalScale(40), //puxou os tres valores mais para o centro
    paddingVertical: verticalScale(-20),
    borderBottomWidth: scaleFontSize(1), //linha na horizontal
    borderRightColor: 'hsla(195, 22.20%, 92.90%, 0.89)', // 0.5 = 50% de transparência
  },
  statBorder: {
    borderRightWidth: 1, //barra na vertical
    borderColor: '#E9EFF1',
    height: verticalScale(40),
    marginVertical: verticalScale(30),
    borderRightColor: 'hsla(195, 22.20%, 92.90%, 0.89)', // 0.5 = 50% de transparência
  },
});

export default style;
