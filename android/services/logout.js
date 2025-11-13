import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native'; // <-- faltava este import

export async function logout(navigation) {
  try {
    // Remove o token salvo localmente
    await AsyncStorage.removeItem('token');

    // Redireciona o usuário para a tela de Login
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      }),
    );
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  }
}
