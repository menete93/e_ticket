import React from 'react';
import { View, Text, Button } from 'react-native';
import globalStyles from '../theme/globalStyles';
import Icon from 'react-native-vector-icons/FontAwesome';
import Login from './Login/Login';
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from '../../assets/styles/scaling';
export default function LoginScreen({ navigation }) {
  return (
    <View style={globalStyles.container}>
      <Icon name="login" size={scaleFontSize(22)} color={'#25C0FF'} />
      <Button title="Entrar" onPress={() => navigation.replace('Main')} />

      <Login />
    </View>
  );
}
