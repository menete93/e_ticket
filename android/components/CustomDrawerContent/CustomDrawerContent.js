import React from 'react';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { logout } from './../../services/logout'; // o mesmo logout que criaste
import { useNavigation } from '@react-navigation/native';
import style from './style';

export default function CustomDrawerContent(props) {
  const navigation = useNavigation();

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      {/* Mostra as telas padrão */}
      <DrawerItemList {...props} />

      {/* Botão de logout */}
      <View style={style.logoutContainer}>
        <TouchableOpacity
          style={style.logoutButton}
          onPress={() => logout(navigation)}
        >
          <Icon name="exit-to-app" size={22} color="#E53935" />
          <Text style={style.logoutText}>Terminar sessão</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}
