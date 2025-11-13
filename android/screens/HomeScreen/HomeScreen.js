import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import globalStyles from '../../theme/globalStyles';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from '../../../assets/styles/scaling';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import style from './style';

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation(); // ✅ dentro do componente

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData)); // transforma a string em objeto
        }
      } catch (error) {
        console.error('Erro ao pegar usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!user) {
    return (
      <View>
        <Text>Nenhum usuário encontrado.</Text>
      </View>
    );
  }

  // Dados de exemplo
  const events = [
    {
      id: '1',
      title: 'Tech Conference 2024',
      date: '15 Dez 2024',
      time: '09:00 - 18:00',
      location: 'Centro de Convenções',
      price: 120,
      type: 'conference',
      image:
        'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Tech+Conference',
    },
    {
      id: '2',
      title: 'Festival de Música',
      date: '20 Jan 2025',
      time: '14:00 - 23:00',
      location: 'Parque Central',
      price: 80,
      type: 'music',
      image:
        'https://via.placeholder.com/300x200/EC4899/FFFFFF?text=Music+Festival',
    },
    {
      id: '3',
      title: 'Workshop Design',
      date: '05 Fev 2025',
      time: '10:00 - 16:00',
      location: 'Espaço Criativo',
      price: 60,
      type: 'workshop',
      image:
        'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Design+Workshop',
    },
    {
      id: '4',
      title: 'Exposição de Arte',
      date: '12 Mar 2025',
      time: '11:00 - 19:00',
      location: 'Museu de Arte',
      price: 25,
      type: 'exhibition',
      image:
        'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Art+Exhibition',
    },
  ];

  const categories = [
    { id: 'todos', name: 'Todos', icon: 'apps' },
    { id: 'conference', name: 'Conferências', icon: 'business' },
    { id: 'music', name: 'Música', icon: 'musical-notes' },
    { id: 'workshop', name: 'Workshops', icon: 'school' },
    { id: 'exhibition', name: 'Exposições', icon: 'image' },
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'todos' || event.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEventPress = event => {
    Alert.alert(
      'Detalhes do Evento',
      `Deseja ver mais detalhes sobre ${event.title}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ver Detalhes',
          onPress: () => console.log('Navegar para detalhes'),
        },
      ],
    );
  };

  const handleSpaceReservation = () => {
    navigation.navigate('Adicionar evento'); // nome da tela no Navigator
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair da sua conta?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          // Aqui você adicionaria a lógica real de logout
          console.log('Usuário deslogado');
          // Exemplo: navigation.navigate('Login');
          // Ou: await auth().signOut();
        },
      },
    ]);
  };

  const renderEventItem = ({ item }) => (
    <TouchableOpacity
      style={style.eventCard}
      onPress={() => handleEventPress(item)}
    >
      <Image source={{ uri: item.image }} style={style.eventImage} />
      <View style={style.eventInfo}>
        <Text style={style.eventTitle}>{item.title}</Text>
        <View style={style.eventDetails}>
          <View style={style.detailItem}>
            <Ionicons name="calendar" size={16} color="#666" />
            <Text style={style.detailText}>{item.date}</Text>
          </View>
          <View style={style.detailItem}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={style.detailText}>{item.time}</Text>
          </View>
          <View style={style.detailItem}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={style.detailText}>{item.location}</Text>
          </View>
        </View>
        <View style={style.eventFooter}>
          <Text style={style.eventPrice}>R$ {item.price}</Text>
          <TouchableOpacity style={style.buyButton}>
            <Text style={style.buyButtonText}>Comprar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={style.container}>
      {/* Header */}
      <View style={style.header}>
        <View style={style.headerTop}>
          <Text style={style.greeting}>
            Olá {user.firstName} {user.lastName}
          </Text>{' '}
          <View style={style.headerButtons}>
            <TouchableOpacity style={style.profileButton}>
              <Ionicons name="person-circle" size={32} color="#4F46E5" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={style.headerTitle}>Encontre eventos incríveis</Text>
      </View>

      <ScrollView style={style.content} showsVerticalScrollIndicator={false}>
        {/* Barra de Pesquisa */}
        <View style={style.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={style.searchIcon}
          />
          <TextInput
            style={style.searchInput}
            placeholder="Pesquisar eventos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Botão de Reserva de Espaço */}
        <TouchableOpacity
          style={style.reservationBanner}
          onPress={handleSpaceReservation}
        >
          <View style={style.reservationContent}>
            <Ionicons name="business" size={32} color="#ffffff" />
            <View style={style.reservationText}>
              <Text style={style.reservationTitle}>Reserve seu espaço</Text>
              <Text style={style.reservationSubtitle}>
                Organize seu próprio evento
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ffffff" />
        </TouchableOpacity>

        {/* Categorias */}
        <Text style={style.sectionTitle}>Categorias</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={style.categoriesContainer}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                style.categoryItem,
                selectedCategory === category.id && style.categoryItemSelected,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon}
                size={24}
                color={selectedCategory === category.id ? '#4F46E5' : '#666'}
              />
              <Text
                style={[
                  style.categoryText,
                  selectedCategory === category.id &&
                    style.categoryTextSelected,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Eventos em Destaque */}
        <View style={style.eventsHeader}>
          <Text style={style.sectionTitle}>Eventos em Destaque</Text>
          <TouchableOpacity>
            <Text style={style.seeAllText}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Eventos */}
        <FlatList
          data={filteredEvents}
          renderItem={renderEventItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
