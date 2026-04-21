// screens/Login/Login.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { auth } from '../../services/api';
import { useAuth } from './../../contexts/authContext';
import InputField from '../../components/Input/InputField';
import styles from './style';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth(); // Adicionar esta linha
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert('Erro', 'Por favor, informe seu email/usuário');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Erro', 'Por favor, informe sua senha');
      return;
    }

    setLoading(true);
    try {
      const response = await auth.post('/auth/login', { username, password });

      console.log('✅ Login realizado com sucesso!');
      console.log(
        '👤 Usuário:',
        response.data.user.firstName,
        response.data.user.lastName,
      );

      // Usar o signIn do contexto ao invés de salvar manualmente
      await signIn(response);

      Alert.alert(
        'Sucesso',
        `Bem-vindo, ${
          response.data.user.firstName || response.data.user.username
        }!`,
      );

      // NÃO precisa mais do navigation.replace('Main')
      // O AppNavigator vai mostrar o Main automaticamente quando o user estiver logado
    } catch (error) {
      console.log('❌ Erro no login:', error.response?.data || error.message);
      const errorMessage =
        error.response?.data?.message || 'Verifique suas credenciais';
      Alert.alert('Erro ao autenticar', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/1077/1077012.png',
            }}
            style={styles.logo}
          />
          <Text style={styles.title}>Bem-vindo de volta!</Text>
          <Text style={styles.subtitle}>Faça login para continuar</Text>

          <View style={styles.form}>
            <InputField
              label="Email ou Username"
              placeholder="exemplo@email.com"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <InputField
              label="Senha"
              placeholder="Digite sua senha"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              rightIcon={showPassword ? 'eye-off' : 'eye'}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgot}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Não tem uma conta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerText}> Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
