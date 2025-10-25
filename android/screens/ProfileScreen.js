import React from 'react';
import { View, Text } from 'react-native';
import globalStyles from '../theme/globalStyles';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from '../../assets/styles/scaling';
import CategoryRegistry from './CategoriesRegistry/CategoryRegistry';
export default function ProfileScreen() {
  return (
    <View style={globalStyles.container}>
      <CategoryRegistry />

      <Icon name="user" size={scaleFontSize(22)} color={'#25C0FF'} />
    </View>
  );
}
