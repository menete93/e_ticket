import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import globalStyles from '../../theme/globalStyles';
import colors from '../../theme/colors';
import { createCategory } from '../../services/categoryService';

export default function CategoryRegistry() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !description) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    setLoading(true);
    try {
      1;
      await createCategory({ name, description, createdBy: 'Android' });
      Alert.alert('Sucesso', 'Categoria criada com sucesso!');
      setName('');
      setDescription('');
    } catch (error) {
      console.log('Erro ao criar categoria:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        globalStyles.container,
        { flex: 1, backgroundColor: colors.background },
      ]}
    >
      <StatusBar backgroundColor={colors.background} barStyle="light-content" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: colors.textPrimary,
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            Cadastrar Categoria
          </Text>

          {/* Nome */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                color: colors.textPrimary,
                marginBottom: 6,
                fontWeight: '600',
              }}
            >
              Nome da Categoria
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.surface,
                color: colors.textPrimary,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
              }}
              placeholder="Digite o nome"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Descrição */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                color: colors.textPrimary,
                marginBottom: 6,
                fontWeight: '600',
              }}
            >
              Descrição
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.surface,
                color: colors.textPrimary,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                height: 120,
                textAlignVertical: 'top',
              }}
              placeholder="Digite a descrição"
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          {/* Botão */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowOffset: { width: 0, height: 3 },
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text
              style={{
                color: colors.buttonText,
                fontWeight: 'bold',
                fontSize: 18,
              }}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
