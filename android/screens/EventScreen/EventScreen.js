import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import style from './style';
import createEvent from './../../services/eventService';
import { searchPlace } from './../../api/ticketApi';
import StaticTextWithImage from './../../components/StaticTextWithImage/StaticTextWithImage';
import IdeaIcon from './../../../assets/images/ideia.svg';
import colors from './../../theme/colors';
import LinearGradient from 'react-native-linear-gradient';

// 👉 Função auxiliar para buscar categorias da base
import getCategories from './../../services/categoryService'; // usa tua instância axios

export default function EventScreen() {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [capacity, setCapacity] = useState('');
  const [seatType, setSeatType] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [createdBy] = useState('menete');
  const [placeQuery, setPlaceQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // 🔹 Carregar categorias da base ao iniciar
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories(); // Ajusta o endpoint conforme tua API
        setCategories(response);
        console.error('categorias:', response);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
    };
    fetchCategories();
  }, []);

  // 🔹 Pesquisa de locais (como já tinhas)
  const handleSearchPlace = async text => {
    setPlaceQuery(text);
    if (text.length > 2) {
      try {
        const results = await searchPlace(text);
        console.log('Resultados da busca de local:', results);

        setSearchResults(results);
      } catch (error) {
        console.error('Erro ao buscar local:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleConfirmTime = date => {
    setSelectedTime(
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    );
    setTimePickerVisible(false);
  };

  // 🔹 Enviar dados do evento
  const handleSubmit = async () => {
    const payload = {
      categoryId: Number(selectedCategoryId),
      name,
      description,
      startTime: startTime.toISOString().slice(0, 19),
      endTime: endTime.toISOString().slice(0, 19),
      capacity: Number(capacity),
      seatType,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      createdBy,
    };

    try {
      const result = await createEvent(payload);
      alert('✅ Evento criado com sucesso!');
      console.log('Resposta da API:', result);
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      alert('Falha ao criar evento. Verifique os dados e tente novamente.');
    }
  };

  return (
    <LinearGradient
      colors={colors.primaryGradient} // gradiente global
      start={{ x: 1, y: 1 }}
      end={{ x: 0, y: 0 }} // horizontal, começa mais carregado na esquerda
      style={{ flex: 1 }} // ocupa toda a tela
    >
      <ScrollView contentContainerStyle={style.container}>
        {/* <Text style={style.header}>Novo Evento</Text> */}
        <StaticTextWithImage
          // text="Outro exemplo de descrição com uma imagem lateral."
          // SvgIcon={IdeaIcon}
          imageSource={require('./../../../assets/images/marketing.png')}
        />

        {/* 🔹 Seleção de Categoria */}
        <Text style={style.label}>Categoria:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={style.categoryScroll}
        >
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                style.categoryButton,
                selectedCategoryId === cat.id && style.categoryButtonSelected,
              ]}
              onPress={() => setSelectedCategoryId(cat.id)}
            >
              <Text
                style={[
                  style.categoryText,
                  selectedCategoryId === cat.id && style.categoryTextSelected,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={style.label}>Nome do Evento:</Text>
        <TextInput
          style={style.input}
          placeholder="Nome do evento"
          value={name}
          onChangeText={setName}
        />
        <Text style={style.label}>Descricao do Evento:</Text>
        <TextInput
          style={[style.input, { height: 100 }]}
          placeholder="Descrição"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Text style={style.label}>Hora:</Text>
        <View style={style.section}>
          <Text style={style.sectionTitle}>Data e Hora</Text>

          {/* 🔹 Início */}
          <TouchableOpacity
            style={style.dateButton}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={style.dateLabel}>Início</Text>
            <Text style={style.dateValue}>
              {startTime ? startTime.toLocaleString('pt-PT') : 'Selecionar'}
            </Text>
          </TouchableOpacity>

          {showStartPicker && (
            <DateTimePicker
              value={startTime}
              mode="datetime"
              is24Hour
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={(e, date) => {
                setShowStartPicker(false);
                if (date) setStartTime(date);
              }}
            />
          )}

          {/* 🔹 Término */}
          <TouchableOpacity
            style={style.dateButton}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={style.dateLabel}>Término</Text>
            <Text style={style.dateValue}>
              {endTime ? endTime.toLocaleString('pt-PT') : 'Selecionar'}
            </Text>
          </TouchableOpacity>

          {showEndPicker && (
            <DateTimePicker
              value={endTime}
              mode="datetime"
              is24Hour
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={(e, date) => {
                setShowEndPicker(false);
                if (date) setEndTime(date);
              }}
            />
          )}
        </View>
        <Text style={style.label}>Bilhetes:</Text>
        <TextInput
          style={style.input}
          placeholder="Capacidade (número)"
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="numeric"
        />
        <TextInput
          style={style.input}
          placeholder="Tipo de assento (ex: Livre, Marcado)"
          value={seatType}
          onChangeText={setSeatType}
        />
        <Text style={style.label}>Pesquisar Local:</Text>
        {/* 🔹 Campo de busca de local */}
        <TextInput
          style={style.input}
          placeholder="Pesquisar local"
          value={placeQuery}
          onChangeText={handleSearchPlace}
        />
        {/* 🔹 Lista de resultados */}
        {searchResults.map((place, index) => (
          <TouchableOpacity
            key={index}
            style={style.option}
            onPress={() => {
              setLatitude(place.lat);
              setLongitude(place.lon);
              setPlaceQuery(place.display_name);
              setSearchResults([]);
            }}
          >
            <Text>{place.display_name}</Text>
          </TouchableOpacity>
        ))}
        {/* <TextInput
        style={style.input}
        placeholder="Latitude"
        value={latitude}
        onChangeText={setLatitude}
        keyboardType="numeric"
      />
      <TextInput
        style={style.input}
        placeholder="Longitude"
        value={longitude}
        onChangeText={setLongitude}
        keyboardType="numeric"
      /> */}
        <TouchableOpacity style={style.button} onPress={handleSubmit}>
          <Text style={style.buttonText}>Salvar Evento</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}
