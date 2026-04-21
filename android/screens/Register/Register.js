// screens/Register/Register.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { auth } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InputField from '../../components/Input/InputField';
import styles from './style';

export default function RegisterScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!firstName.trim()) {
      Alert.alert('Erro', 'Por favor, informe seu nome');
      return;
    }
    if (!lastName.trim()) {
      Alert.alert('Erro', 'Por favor, informe seu sobrenome');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, informe seu email');
      return;
    }
    if (!username.trim()) {
      Alert.alert('Erro', 'Por favor, informe um nome de usuário');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Erro', 'Por favor, informe sua senha');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const response = await auth.post('/auth/register', {
        firstName,
        lastName,
        email,
        username,
        password,
        isOrganizer,
      });

      const { token, user } = response.data;

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      auth.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      Alert.alert('Sucesso', 'Conta criada com sucesso!');
      navigation.replace('Login');
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Erro ao criar conta';
      Alert.alert('Erro ao criar conta', errorMessage);
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
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Comece sua jornada</Text>

          <View style={styles.form}>
            <InputField
              label="Nome"
              placeholder="Digite seu nome"
              value={firstName}
              onChangeText={setFirstName}
            />

            <InputField
              label="Sobrenome"
              placeholder="Digite seu sobrenome"
              value={lastName}
              onChangeText={setLastName}
            />

            <InputField
              label="Email"
              placeholder="exemplo@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <InputField
              label="Nome de Usuário"
              placeholder="escolha um username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
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

            <InputField
              label="Confirmar Senha"
              placeholder="Confirme sua senha"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              rightIcon={showConfirmPassword ? 'eye-off' : 'eye'}
              onRightIconPress={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            />

            <TouchableOpacity
              style={styles.organizerContainer}
              onPress={() => setIsOrganizer(!isOrganizer)}
            >
              <View
                style={[styles.checkbox, isOrganizer && styles.checkboxChecked]}
              >
                {isOrganizer && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.organizerTextContainer}>
                <Text style={styles.organizerTitle}>
                  Sou organizador de eventos
                </Text>
                <Text style={styles.organizerSubtitle}>
                  Criar e gerenciar meus próprios eventos
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Cadastrar</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem uma conta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}> Faça login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
