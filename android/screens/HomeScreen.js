import React from 'react';
import { View, Text } from 'react-native';
import globalStyles from '../theme/globalStyles';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from '../../assets/styles/scaling';

export default function HomeScreen() {
  return (
    <View style={globalStyles.container}>
      {/* <Text style={globalStyles.textPrimary}>🏠 Tela Inicial</Text> */}
      <Icon name="search" size={scaleFontSize(22)} color={'#25C0FF'} />
    </View>
  );
}
