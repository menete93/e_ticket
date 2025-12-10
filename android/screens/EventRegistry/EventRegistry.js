import React, { useState, useEffect } from 'react';
import { createEvent } from './../../services/eventService';
import { searchPlace } from './../../api/ticketApi';

import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import getCategories from './../../services/categoryService';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import styles from './style';

const EventRegistrationScreen = () => {
  // Estados para os campos do evento - todos inicializados vazios
  const [eventData, setEventData] = useState({
    name: '',
    description: '',
    latitude: null,
    longitude: null,
    categoryId: '',
    eventDate: null, // Alterado para null
    startTime: null, // Alterado para null
    endTime: null, // Alterado para null
    coverImage: null,
    bannerImage: null,
    maxAttendees: '',
    minAttendees: '',
    isPublic: true,
    isFeatured: false,
    isFree: true,
    registrationDeadline: null, // Alterado para null
    location: '',
  });

  // Estados para controlar os pickers
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [activeDateField, setActiveDateField] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [placeQuery, setPlaceQuery] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      if (response && response.length > 0) {
        setCategories(response);
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ─── HANDLERS ────────────────────────────────────────────
  const handleChangeCategory = (index, field, value) => {
    const updated = [...categories];
    updated[index][field] = value;
    setCategories(updated);
  };

  // Opções para o seletor de imagens
  const imageOptions = {
    mediaType: 'photo',
    quality: 0.8,
    maxWidth: 1024,
    maxHeight: 1024,
    includeBase64: false,
    selectionLimit: 1,
  };

  // Função para selecionar imagem da galeria
  const selectImage = async imageType => {
    try {
      const result = await launchImageLibrary(imageOptions);

      if (result.didCancel) {
        console.log('Usuário cancelou a seleção de imagem');
        return;
      }

      if (result.errorCode) {
        Alert.alert(
          'Erro',
          `Erro ao selecionar imagem: ${result.errorMessage}`,
        );
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const image = result.assets[0];

        setEventData({
          ...eventData,
          [imageType]: {
            uri: image.uri,
            type: image.type,
            name: image.fileName || `image_${Date.now()}.jpg`,
            size: image.fileSize,
          },
        });
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao selecionar imagem');
      console.error(error);
    }
  };

  // Função para tirar foto com a câmera
  const takePhoto = async imageType => {
    try {
      const result = await launchCamera(imageOptions);

      if (result.didCancel) {
        console.log('Usuário cancelou a captura de foto');
        return;
      }

      if (result.errorCode) {
        Alert.alert('Erro', `Erro ao capturar foto: ${result.errorMessage}`);
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const image = result.assets[0];

        setEventData({
          ...eventData,
          [imageType]: {
            uri: image.uri,
            type: image.type,
            name: image.fileName || `photo_${Date.now()}.jpg`,
            size: image.fileSize,
          },
        });
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao capturar foto');
      console.error(error);
    }
  };

  // Menu de opções para upload de imagem
  const showImageOptions = imageType => {
    Alert.alert('Selecionar Imagem', 'Escolha uma opção:', [
      {
        text: 'Tirar Foto',
        onPress: () => takePhoto(imageType),
      },
      {
        text: 'Escolher da Galeria',
        onPress: () => selectImage(imageType),
      },
      {
        text: 'Cancelar',
        style: 'cancel',
      },
    ]);
  };

  // Função para remover imagem
  const removeImage = imageType => {
    setEventData({
      ...eventData,
      [imageType]: null,
    });
  };

  // Função para simular upload
  const uploadImageToServer = async image => {
    if (!image) return null;

    setUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newProgress;
        });
      }, 200);

      // Simulando upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      clearInterval(progressInterval);
      setUploadProgress(100);

      // URL simulada do servidor
      const imageUrl = `https://seuservidor.com/images/${Date.now()}.jpg`;

      setUploading(false);
      setUploadProgress(0);

      return imageUrl;
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      setUploadProgress(0);
      throw error;
    }
  };

  // Manipuladores de data/hora corrigidos
  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();

    setEventData({
      ...eventData,
      [activeDateField]: currentDate,
    });

    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      setShowStartTimePicker(false);
      setShowEndTimePicker(false);
      setShowDeadlinePicker(false);
    }
  };

  const showPicker = field => {
    setActiveDateField(field);
    switch (field) {
      case 'eventDate':
        setShowDatePicker(true);
        break;
      case 'startTime':
        setShowStartTimePicker(true);
        break;
      case 'endTime':
        setShowEndTimePicker(true);
        break;
      case 'registrationDeadline':
        setShowDeadlinePicker(true);
        break;
    }
  };

  // Formatadores de data/hora com verificação
  const formatDate = date => {
    if (!date) return 'Selecionar data';
    return date.toLocaleDateString('pt-BR');
  };

  const formatTime = date => {
    if (!date) return 'Selecionar horário';
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Manipulador de envio
  const handleSubmit = async () => {
    // Validação básica
    if (
      !eventData.name ||
      !eventData.description ||
      !eventData.latitude ||
      !eventData.longitude ||
      !eventData.eventDate ||
      !eventData.startTime ||
      !eventData.endTime
    ) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      console.log(eventData);
      return;
    }

    // Validação de horário
    if (eventData.startTime >= eventData.endTime) {
      Alert.alert('Erro', 'O horário de início deve ser anterior ao término');
      return;
    }

    if (eventData.maxAttendees && eventData.minAttendees) {
      const max = parseInt(eventData.maxAttendees);
      const min = parseInt(eventData.minAttendees);
      if (min > max) {
        Alert.alert(
          'Erro',
          'O número mínimo de participantes não pode ser maior que o máximo',
        );
        return;
      }
    }

    try {
      setUploading(true);

      // Upload das imagens
      let coverImageUrl = '';
      let bannerImageUrl = '';

      if (eventData.coverImage) {
        coverImageUrl = await uploadImageToServer(eventData.coverImage);
      }

      if (eventData.bannerImage) {
        bannerImageUrl = await uploadImageToServer(eventData.bannerImage);
      }

      // Preparar dados para envio
      const payload = {
        name: eventData.name,
        description: eventData.description,
        geographicLocation: {
          type: 'Point',
          coordinates: [
            parseFloat(eventData.longitude),
            parseFloat(eventData.latitude),
          ],
        },
        categoryId: selectedCategoryId,
        eventDate: eventData.eventDate.toISOString(),
        startTime: eventData.startTime.toISOString(),
        endTime: eventData.endTime.toISOString(),
        maxAttendees: eventData.maxAttendees || null,
        minAttendees: eventData.minAttendees || null,
        isPublic: eventData.isPublic,
        isFeatured: eventData.isFeatured,
        isFree: eventData.isFree,
        registrationDeadline: eventData.registrationDeadline
          ? eventData.registrationDeadline.toISOString()
          : null,
        coverImageUrl,
        bannerImageUrl,
      };

      console.log('Dados do evento prontos para envio:', payload);

      // Aqui você faria a chamada à API para salvar o evento
      // await api.post('/events', eventToSubmit);

      try {
        await createEvent(payload);
        Alert.alert('✅ Evento criado com sucesso!');
      } catch (error) {
        console.error('Erro ao criar evento:', error);
        console.error('Payload:', payload);
        Alert.alert(
          'Falha ao criar evento. Verifique os dados e tente novamente.',
        );
      }

      setUploading(false);
      Alert.alert('Sucesso', 'Evento cadastrado com sucesso!');

      // Resetar formulário
      setEventData({
        name: '',
        description: '',
        latitude: null,
        longitude: null,
        categoryId: '',
        eventDate: null,
        startTime: null,
        endTime: null,
        coverImage: null,
        bannerImage: null,
        maxAttendees: '',
        minAttendees: '',
        isPublic: true,
        isFeatured: false,
        isFree: true,
        registrationDeadline: null,
        location: '',
      });
      setSelectedCategoryId(null);
      setPlaceQuery('');
      setLatitude(null);
      setLongitude(null);
      setSearchResults([]);
    } catch (error) {
      setUploading(false);
      Alert.alert('Erro', 'Falha ao enviar evento. Tente novamente.');
      console.error(error);
    }
  };

  const handleSearchPlace = async text => {
    setPlaceQuery(text);
    if (text.length > 2) {
      try {
        const results = await searchPlace(text);
        setSearchResults(results);
        console.log(results, 'LOCALIZACAO');
      } catch (error) {
        console.error('Erro ao buscar local:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Componente para campos de texto
  const renderTextInput = (
    label,
    value,
    field,
    placeholder,
    multiline = false,
    keyboardType = 'default',
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={text => setEventData({ ...eventData, [field]: text })}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType}
        editable={!uploading}
      />
    </View>
  );

  // Componente para switches
  const renderSwitch = (label, value, field) => (
    <View style={styles.switchContainer}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={val => setEventData({ ...eventData, [field]: val })}
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={value ? '#007AFF' : '#f4f3f4'}
        disabled={uploading}
      />
    </View>
  );

  // Componente para botões de data/hora corrigido
  const renderDateTimeButton = (label, date, time, field) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label} *</Text>
      <TouchableOpacity
        style={[styles.dateButton, uploading && styles.disabledButton]}
        onPress={() => !uploading && showPicker(field)}
        disabled={uploading}
      >
        <Text style={styles.dateButtonText}>
          {time ? formatTime(date) : formatDate(date)}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Componente para upload de imagem
  const renderImageUpload = (label, image, imageType) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>

      {image ? (
        <View style={styles.imagePreviewContainer}>
          <Image
            source={{ uri: image.uri }}
            style={styles.imagePreview}
            resizeMode="cover"
          />

          <View style={styles.imageActions}>
            <TouchableOpacity
              style={[styles.imageButton, styles.changeButton]}
              onPress={() => showImageOptions(imageType)}
              disabled={uploading}
            >
              <Text style={styles.imageButtonText}>Alterar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.imageButton, styles.removeButton]}
              onPress={() => removeImage(imageType)}
              disabled={uploading}
            >
              <Text style={styles.imageButtonText}>Remover</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.imageInfo}>
            {image.name} • {(image.size / 1024).toFixed(1)} KB
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.uploadButton, uploading && styles.disabledButton]}
          onPress={() => showImageOptions(imageType)}
          disabled={uploading}
        >
          <Text style={styles.uploadButtonText}>+ Selecionar Imagem</Text>
          <Text style={styles.uploadButtonSubtext}>
            Toque para escolher ou tirar foto
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cadastro de Evento</Text>
        <Text style={styles.subtitle}>* Campos obrigatórios</Text>
      </View>

      {uploading && (
        <View style={styles.uploadOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.uploadText}>
            Enviando imagens... {uploadProgress}%
          </Text>
        </View>
      )}

      {/* Informações Básicas */}
      <View style={[styles.section, uploading && styles.disabledSection]}>
        <Text style={styles.sectionTitle}>Informações Básicas</Text>

        {renderTextInput(
          'Nome do Evento *',
          eventData.name,
          'name',
          'Digite o nome do evento',
        )}

        {renderTextInput(
          'Descrição *',
          eventData.description,
          'description',
          'Descreva o evento...',
          true,
        )}

        {/* Categoria */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Categoria</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  selectedCategoryId === cat.id &&
                    styles.categoryButtonSelected,
                ]}
                onPress={() => setSelectedCategoryId(cat.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategoryId === cat.id &&
                      styles.categoryTextSelected,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Data e Hora */}
      <View style={[styles.section, uploading && styles.disabledSection]}>
        <Text style={styles.sectionTitle}>Data e Hora</Text>

        {renderDateTimeButton(
          'Data do Evento *',
          eventData.eventDate,
          false,
          'eventDate',
        )}

        <View style={styles.timeContainer}>
          <View style={styles.timeInput}>
            {renderDateTimeButton(
              'Horário Início *',
              eventData.startTime,
              true,
              'startTime',
            )}
          </View>
          <View style={styles.timeInput}>
            {renderDateTimeButton(
              'Horário Término *',
              eventData.endTime,
              true,
              'endTime',
            )}
          </View>
        </View>

        {renderDateTimeButton(
          'Prazo de Inscrição',
          eventData.registrationDeadline,
          false,
          'registrationDeadline',
        )}
      </View>

      {/* Upload de Imagens */}
      <View style={[styles.section, uploading && styles.disabledSection]}>
        <Text style={styles.sectionTitle}>Imagens</Text>

        {renderImageUpload(
          'Imagem de Capa',
          eventData.coverImage,
          'coverImage',
        )}
        {renderImageUpload(
          'Banner do Evento',
          eventData.bannerImage,
          'bannerImage',
        )}

        <Text style={styles.imageNote}>
          * Recomendado: Capa (16:9) e Banner (3:1)
          {'\n'}* Tamanho máximo: 5MB por imagem
          {'\n'}* Formatos: JPG, PNG
        </Text>
      </View>

      {/* Configurações de Participantes */}
      <View style={[styles.section, uploading && styles.disabledSection]}>
        <Text style={styles.sectionTitle}>Participantes</Text>

        <View style={styles.rowContainer}>
          <View style={styles.halfInput}>
            {renderTextInput(
              'Mínimo',
              eventData.minAttendees,
              'minAttendees',
              '0',
              false,
              'numeric',
            )}
          </View>
          <View style={styles.halfInput}>
            {renderTextInput(
              'Máximo',
              eventData.maxAttendees,
              'maxAttendees',
              '100',
              false,
              'numeric',
            )}
          </View>
        </View>
      </View>

      <View style={styles.locationContainer}>
        <Text style={styles.sectionTitle}>Localização do Evento</Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Pesquisar Local:</Text>

          <TextInput
            style={styles.input}
            placeholder="Pesquisar local"
            placeholderTextColor="#CCC"
            value={placeQuery}
            onChangeText={handleSearchPlace}
          />

          {searchResults.length > 0 && (
            <ScrollView style={styles.dropdown} nestedScrollEnabled={true}>
              {searchResults.map((place, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => {
                    const lat = parseFloat(place.lat);
                    const lon = parseFloat(place.lon);

                    setPlaceQuery(place.display_name);
                    setLatitude(lat);
                    setLongitude(lon);

                    setEventData({
                      ...eventData,
                      location: place.display_name,
                      latitude: lat,
                      longitude: lon,
                    });

                    setSearchResults([]); // fecha dropdown
                  }}
                >
                  <Text style={styles.dropdownText}>{place.display_name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {latitude !== null && longitude !== null && (
            <View style={styles.mapContainer}>
              <Text style={styles.mapHint}>
                Toque no mapa para abrir no Google Maps
              </Text>

              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(
                    `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
                  )
                }
                activeOpacity={0.8}
              >
                <Image
                  source={{
                    uri: `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=16&size=600x400&markers=${latitude},${longitude},red`,
                  }}
                  style={styles.staticMap}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Configurações do Evento */}
      <View style={[styles.section, uploading && styles.disabledSection]}>
        <Text style={styles.sectionTitle}>Configurações</Text>

        {renderSwitch('Evento Público', eventData.isPublic, 'isPublic')}
        {renderSwitch('Evento em Destaque', eventData.isFeatured, 'isFeatured')}
        {renderSwitch('Evento Gratuito', eventData.isFree, 'isFree')}
      </View>

      {/* Botão de Envio */}
      <TouchableOpacity
        style={[styles.submitButton, uploading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Cadastrar Evento</Text>
        )}
      </TouchableOpacity>

      {/* Date Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={eventData.eventDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {showStartTimePicker && (
        <DateTimePicker
          value={eventData.startTime || new Date()}
          mode="time"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={eventData.endTime || new Date()}
          mode="time"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {showDeadlinePicker && (
        <DateTimePicker
          value={eventData.registrationDeadline || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </ScrollView>
  );
};

export default EventRegistrationScreen;
