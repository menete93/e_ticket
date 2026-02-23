import React, { useState, useEffect } from 'react';
import { createEvent } from './../../services/eventService';
import { searchPlace } from './../../api/ticketApi';
import storage from '@react-native-firebase/storage';
import RNFS from 'react-native-fs';
import MapLibreGL from '@maplibre/maplibre-react-native';
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
import AsyncStorage from '@react-native-async-storage/async-storage';

MapLibreGL.setAccessToken(null);

const EventRegistrationScreen = ({ navigation, route }) => {
  // Estados principais
  const [createdEventId, setCreatedEventId] = useState(null);
  const [ticketConfig, setTicketConfig] = useState([]);
  const [user, setUser] = useState(null); // Mantém apenas este
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log('Usuário          para registrar:', parsedUser);
        }
      } catch (error) {
        console.error('Erro ao pegar usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Estados para os campos do evento
  const [eventData, setEventData] = useState({
    userId: '',
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

  // Outros estados
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
  const [placeQuery, setPlaceQuery] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  // Carregar categorias
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

  // ─── FUNÇÕES DE UPLOAD DE IMAGENS ─────────────────────────────────
  const uploadImageToFirebaseWithVerification = async (
    image,
    imageType,
    progressCallback,
  ) => {
    console.log(`📤 Upload ${imageType}: iniciando...`);

    if (!image || !image.uri) {
      console.log(`⚠️  ${imageType}: Nenhuma imagem válida`);
      return null;
    }

    try {
      const fileInfo = await RNFS.stat(image.uri.replace('file://', ''));
      console.log(
        `${imageType}: Arquivo local existe, tamanho: ${fileInfo.size} bytes`,
      );

      if (fileInfo.size > 5 * 1024 * 1024) {
        throw new Error('Arquivo muito grande (máximo 5MB)');
      }
    } catch (error) {
      console.log(`⚠️  ${imageType}: Não foi possível verificar arquivo local`);
    }

    try {
      let filePath = image.uri;

      if (Platform.OS === 'android' && filePath.startsWith('content://')) {
        const destPath = `${
          RNFS.TemporaryDirectoryPath
        }/${imageType}_${Date.now()}.jpg`;
        await RNFS.copyFile(filePath, destPath);
        filePath = destPath;
      } else if (filePath.startsWith('file://')) {
        filePath = filePath.replace('file://', '');
      }

      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const filename = `${imageType}_${timestamp}_${randomId}.jpg`;
      const storagePath = `events/${filename}`;
      const reference = storage().ref(storagePath);

      console.log(`${imageType}: Enviando para ${storagePath}`);

      const downloadURL = await new Promise((resolve, reject) => {
        const uploadTask = reference.putFile(filePath);

        uploadTask.on(
          'state_changed',
          snapshot => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`${imageType}: Progresso ${Math.round(progress)}%`);
            if (progressCallback) {
              progressCallback(Math.round(progress));
            }
          },
          error => {
            console.error(`${imageType}: Erro no upload:`, error);
            reject(new Error(`Upload falhou: ${error.message}`));
          },
          async () => {
            try {
              console.log(`${imageType}: Upload completo, obtendo URL...`);
              await new Promise(resolve => setTimeout(resolve, 500));
              const url = await reference.getDownloadURL();
              console.log(`${imageType}: Upload validado com sucesso!`);
              resolve(url);
            } catch (urlError) {
              console.error(`${imageType}: Erro ao obter URL:`, urlError);
              reject(new Error(`Falha ao obter URL: ${urlError.message}`));
            }
          },
        );
      });

      return downloadURL;
    } catch (error) {
      console.error(`${imageType}: Erro no processo completo:`, error);
      throw error;
    }
  };

  // ─── SELEÇÃO DE IMAGENS ──────────────────────────────────────────
  const imageOptions = {
    mediaType: 'photo',
    quality: 0.8,
    maxWidth: 1024,
    maxHeight: 1024,
    includeBase64: false,
    selectionLimit: 1,
  };

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

  const removeImage = imageType => {
    setEventData({
      ...eventData,
      [imageType]: null,
    });
  };

  // ─── HANDLERS DE DATA/HORA ──────────────────────────────────────
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

  // Formatadores
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

  // ─── NAVEGAÇÃO PARA CONFIGURAÇÃO DE BILHETES ───────────────────
  const navigateToTicketConfig = eventId => {
    if (navigation) {
      navigation.navigate('TicketConfiguration', {
        eventId: eventId,
        eventName: eventData.name,
        isFree: eventData.isFree,
      });
    } else {
      Alert.alert('Info', 'Navegação não disponível');
    }
  };

  // ─── VALIDAÇÃO ─────────────────────────────────────────────────
  const validateEventData = () => {
    const errors = [];

    if (!eventData.name?.trim()) {
      errors.push('Nome do evento');
    }

    if (!eventData.description?.trim()) {
      errors.push('Descrição do evento');
    }

    if (!eventData.latitude || !eventData.longitude) {
      errors.push('Localização');
    }

    if (!eventData.eventDate) {
      errors.push('Data do evento');
    }

    if (!eventData.startTime || !eventData.endTime) {
      errors.push('Horários de início e término');
    }

    if (eventData.startTime >= eventData.endTime) {
      errors.push('Horário de início deve ser anterior ao término');
    }

    if (!selectedCategoryId) {
      errors.push('Categoria');
    }

    return errors;
  };

  // ─── CADASTRAR EVENTO ──────────────────────────────────────────
  const handleSubmit = async () => {
    console.log('🚀 Iniciando criação de evento...');

    const errors = validateEventData();

    if (errors.length > 0) {
      Alert.alert(
        'Campos obrigatórios',
        `Por favor, preencha:\n\n• ${errors.join('\n• ')}`,
        [{ text: 'OK' }],
      );
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Upload de imagens
      let coverImageUrl = null;
      let bannerImageUrl = null;

      if (eventData.coverImage) {
        coverImageUrl = await uploadImageToFirebaseWithVerification(
          eventData.coverImage,
          'cover',
          setUploadProgress,
        );
      }

      if (eventData.bannerImage) {
        bannerImageUrl = await uploadImageToFirebaseWithVerification(
          eventData.bannerImage,
          'banner',
          setUploadProgress,
        );
      }

      // Preparar payload do evento
      const payload = {
        userId: user?.id, // 👈 aqui
        name: eventData.name.trim(),
        description: eventData.description.trim(),
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('📦 Payload do Evento:', JSON.stringify(payload, null, 2));

      // Criar evento na API
      const response = await createEvent(payload);
      console.log('✅ Evento criado com sucesso! ID:', response);

      // Salvar o ID do evento criado
      setCreatedEventId(response.id);

      // Se evento é gratuito, finaliza aqui
      if (eventData.isFree) {
        Alert.alert('✅ Sucesso!', 'Evento gratuito criado com sucesso!', [
          {
            text: 'OK',
            onPress: () => {
              resetForm();
              if (navigation) {
                navigation.goBack();
              }
            },
          },
        ]);
      } else {
        // Se evento é pago, oferece opção de configurar bilhetes
        Alert.alert(
          '✅ Evento Criado!',
          `Evento "${eventData.name}" criado com sucesso!\n\nDeseja configurar as categorias de bilhetes agora?`,
          [
            {
              text: 'Mais Tarde',
              style: 'cancel',
              onPress: () => {
                resetForm();
                if (navigation) {
                  navigation.goBack();
                }
              },
            },
            {
              text: 'Configurar Bilhetes',
              onPress: () => navigateToTicketConfig(response.id),
            },
          ],
        );
      }
    } catch (error) {
      console.error('💥 Erro:', error);
      Alert.alert(
        'Erro',
        `Falha ao criar evento: ${
          error.message.message || 'Erro desconhecido'
        }`,
        [{ text: 'OK' }],
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // ─── FUNÇÕES AUXILIARES ────────────────────────────────────────
  const resetForm = () => {
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
    setCreatedEventId(null);
  };

  const openInGoogleMaps = () => {
    if (!latitude || !longitude) return;

    const lat = latitude;
    const lon = longitude;

    const url = Platform.select({
      android: `geo:${lat},${lon}?q=${lat},${lon}`,
      ios: `https://maps.google.com/?q=${lat},${lon}`,
    });

    Linking.openURL(url).catch(err =>
      Alert.alert('Erro', 'Não foi possível abrir o Google Maps'),
    );
  };

  const handleSearchPlace = async text => {
    setPlaceQuery(text);
    if (text.length > 2) {
      try {
        const results = await searchPlace(text);
        setSearchResults(results);
      } catch (error) {
        console.error('Erro ao buscar local:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  // ─── COMPONENTES DE RENDERIZAÇÃO ───────────────────────────────
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

  // ─── RENDER PRINCIPAL ──────────────────────────────────────────
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Cadastro de Evento</Text>
        <Text style={styles.subtitle}>* Campos obrigatórios</Text>
      </View>

      {uploading && (
        <View style={styles.uploadOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.uploadText}>Enviando... {uploadProgress}%</Text>
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
          <Text style={styles.label}>Categoria *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
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
                disabled={uploading}
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

      {/* Localização */}
      <View style={[styles.section, uploading && styles.disabledSection]}>
        <Text style={styles.sectionTitle}>Localização do Evento</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Pesquisar Local *</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite endereço, cidade, bairro..."
            placeholderTextColor="#CCC"
            value={placeQuery}
            onChangeText={handleSearchPlace}
            editable={!uploading}
          />

          {searchResults.length > 0 && (
            <ScrollView
              style={styles.dropdown}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
            >
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

                    setSearchResults([]);
                  }}
                >
                  <Text style={styles.dropdownText}>{place.display_name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {latitude && longitude && (
          <View style={styles.mapContainer}>
            <Text style={styles.mapHint}>Localização selecionada</Text>

            <MapLibreGL.MapView
              style={styles.map}
              styleURL="https://demotiles.maplibre.org/style.json"
              onPress={openInGoogleMaps}
            >
              <MapLibreGL.Camera
                zoomLevel={15}
                centerCoordinate={[longitude, latitude]}
                animationMode="flyTo"
                animationDuration={500}
              />

              <MapLibreGL.PointAnnotation
                id="eventLocation"
                coordinate={[longitude, latitude]}
              />
            </MapLibreGL.MapView>

            <Text style={styles.mapOpenHint}>
              Toque no mapa para abrir no Google Maps
            </Text>
          </View>
        )}
      </View>

      {/* Configurações do Evento */}
      <View style={[styles.section, uploading && styles.disabledSection]}>
        <Text style={styles.sectionTitle}>Configurações</Text>

        {renderSwitch('Evento Público', eventData.isPublic, 'isPublic')}
        {renderSwitch('Evento em Destaque', eventData.isFeatured, 'isFeatured')}

        {/* Switch de Evento Gratuito */}
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Evento Gratuito</Text>
          <Switch
            value={eventData.isFree}
            onValueChange={val => {
              setEventData({ ...eventData, isFree: val });
            }}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={eventData.isFree ? '#007AFF' : '#f4f3f4'}
            disabled={uploading}
          />
        </View>

        {/* Informação sobre bilhetes */}
        <View style={styles.ticketInfo}>
          <Text style={styles.ticketInfoTitle}>
            {eventData.isFree ? '🎫 Evento Gratuito' : '💰 Evento Pago'}
          </Text>
          <Text style={styles.ticketInfoText}>
            {eventData.isFree
              ? 'Este evento não requer venda de bilhetes.'
              : 'Após criar o evento, você poderá configurar as categorias de bilhetes.'}
          </Text>
        </View>
      </View>

      {/* Botões de Ação */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.cancelButton, uploading && styles.disabledButton]}
          onPress={resetForm}
          disabled={uploading}
        >
          <Text style={styles.cancelButtonText}>Limpar Formulário</Text>
        </TouchableOpacity>

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
      </View>

      {/* Date Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={eventData.eventDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
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
          minimumDate={new Date()}
        />
      )}
    </ScrollView>
  );
};

export default EventRegistrationScreen;
