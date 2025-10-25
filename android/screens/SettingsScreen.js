import React from 'react';
import { View, Text } from 'react-native';
import globalStyles from '../theme/globalStyles';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from '../../assets/styles/scaling';
export default function SettingsScreen() {
  return (
    <View style={globalStyles.container}>
      <Icon name="settings" size={scaleFontSize(22)} color={'#25C0FF'} />
    </View>
  );
}
