// screens/user/HomeScreen.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

// Importar serviços
import {
  getEvents,
  getEventCategories,
} from '../../../../services/eventService';
import styles from './style';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState('todos');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);

  // Buscar usuário logado
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
          console.log('Usuário carregado:', JSON.parse(userData).firstName);
        }
      } catch (error) {
        console.error('Erro ao pegar usuário:', error);
      }
    };

    fetchUser();
  }, []);

  // Buscar categorias da API
  const fetchCategories = useCallback(async () => {
    try {
      const response = await getEventCategories();
      const categoriesData = Array.isArray(response)
        ? response
        : response.data || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  }, []);

  // Aplicar filtros (busca e categoria)
  const applyFilters = useCallback((eventsList, query, categoryId) => {
    let filtered = [...eventsList];

    // Filtro por busca
    if (query && query.trim()) {
      filtered = filtered.filter(
        event =>
          event.name?.toLowerCase().includes(query.toLowerCase()) ||
          event.description?.toLowerCase().includes(query.toLowerCase()) ||
          event.location?.toLowerCase().includes(query.toLowerCase()),
      );
    }

    // Filtro por categoria
    if (categoryId) {
      filtered = filtered.filter(event => event.category?.id === categoryId);
    }

    // Ordenar por data (mais próximos primeiro)
    filtered.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

    setFilteredEvents(filtered);
  }, []);

  // Buscar eventos da API
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getEvents();
      const eventsData = Array.isArray(response)
        ? response
        : response.data || [];
      setEvents(eventsData);

      // Separar eventos em destaque
      const featured = eventsData.filter(event => event.isFeatured === true);
      setFeaturedEvents(featured.slice(0, 5));

      // Aplicar filtros
      applyFilters(eventsData, searchQuery, selectedCategoryId);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os eventos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [applyFilters, searchQuery, selectedCategoryId]); // ✅ Adicionadas dependências

  // Carregar dados iniciais
  useEffect(() => {
    fetchCategories();
    fetchEvents();
  }, [fetchCategories, fetchEvents]); // ✅ Dependências corretas

  // Quando busca ou categoria mudar, refiltrar
  useEffect(() => {
    if (events.length > 0) {
      applyFilters(events, searchQuery, selectedCategoryId);
    }
  }, [searchQuery, selectedCategoryId, events, applyFilters]);

  // ✅ REMOVA O useFocusEffect - Substitua por este useEffect se quiser recarregar quando a tela ganhar foco
  // Mas cuidado: isso pode causar recarregamento desnecessário
  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('focus', () => {
  //     fetchEvents();
  //   });
  //   return unsubscribe;
  // }, [navigation, fetchEvents]);

  // Refresh control - puxar para recarregar
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, [fetchEvents]);

  // Selecionar categoria
  const handleSelectCategory = (categoryId, categoryName) => {
    if (selectedCategoryId === categoryId) {
      // Desmarcar categoria (mostrar todos)
      setSelectedCategoryId(null);
      setSelectedCategoryName('todos');
    } else {
      // Selecionar categoria
      setSelectedCategoryId(categoryId);
      setSelectedCategoryName(categoryName);
    }
  };

  // Navegar para seleção de ingressos
  const handleBuyPress = event => {
    navigation.navigate('TicketSelection', {
      event: {
        id: event.id,
        name: event.name,
        description: event.description,
        eventDate: event.eventDate,
        location: event.location,
        imageUrl: event.coverImageUrl,
        category: event.category,
        isFree: event.isFree,
        price: event.isFree ? 0 : event.tickets?.[0]?.price || 0,
      },
    });
  };

  // Ver detalhes do evento
  const handleEventPress = event => {
    Alert.alert(
      event.name,
      `📍 ${event.location || 'Local a definir'}\n📅 ${formatDate(
        event.eventDate,
      )}\n🎫 ${
        event.isFree ? 'Grátis' : `${event.tickets?.[0]?.price || 0} MT`
      }\n\n${event.description || 'Sem descrição'}`,
      [
        { text: 'Fechar', style: 'cancel' },
        { text: 'Comprar', onPress: () => handleBuyPress(event) },
      ],
    );
  };

  // Formatar data
  const formatDate = dateString => {
    if (!dateString) return 'Data a definir';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Formatar preço
  const formatPrice = event => {
    if (event.isFree) return 'Grátis';
    const price = event.tickets?.[0]?.price || 0;
    return `${price} MT`;
  };

  // Renderizar item de categoria
  const renderCategoryItem = category => {
    const isSelected = selectedCategoryId === category.id;
    return (
      <TouchableOpacity
        key={category.id}
        style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}
        onPress={() => handleSelectCategory(category.id, category.name)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.categoryText,
            isSelected && styles.categoryTextSelected,
          ]}
        >
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // Renderizar evento em destaque (horizontal)
  const renderFeaturedItem = ({ item }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => handleBuyPress(item)}
      activeOpacity={0.9}
    >
      <Image
        source={{
          uri:
            item.coverImageUrl ||
            'https://via.placeholder.com/300x160/4F46E5/FFFFFF?text=Evento',
        }}
        style={styles.featuredImage}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.featuredGradient}
      >
        <Text style={styles.featuredTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.featuredDetails}>
          <View style={styles.featuredDetail}>
            <Ionicons name="calendar" size={12} color="#fff" />
            <Text style={styles.featuredDetailText}>
              {formatDate(item.eventDate)}
            </Text>
          </View>
          <View style={styles.featuredDetail}>
            <Ionicons name="location" size={12} color="#fff" />
            <Text style={styles.featuredDetailText} numberOfLines={1}>
              {item.location || 'Local a definir'}
            </Text>
          </View>
        </View>
        <Text style={styles.featuredPrice}>{formatPrice(item)}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Renderizar item de evento (vertical)
  const renderEventItem = ({ item }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => handleEventPress(item)}
      activeOpacity={0.9}
    >
      <Image
        source={{
          uri:
            item.coverImageUrl ||
            'https://via.placeholder.com/400x160/4F46E5/FFFFFF?text=Evento',
        }}
        style={styles.eventImage}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.eventGradient}
      />
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.eventDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar" size={12} color="#ccc" />
            <Text style={styles.detailText}>{formatDate(item.eventDate)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="location" size={12} color="#ccc" />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.location || 'Local a definir'}
            </Text>
          </View>
        </View>
        <View style={styles.eventFooter}>
          <Text style={styles.eventPrice}>{formatPrice(item)}</Text>
          <TouchableOpacity
            style={styles.buyButton}
            onPress={() => handleBuyPress(item)}
          >
            <Text style={styles.buyButtonText}>Comprar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && events.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Carregando eventos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>
              Olá, {user?.firstName || 'Visitante'}!
            </Text>
            <Text style={styles.subGreeting}>Descubra eventos incríveis</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Perfil')}
          >
            <Ionicons name="person-circle" size={40} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Barra de Pesquisa */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar eventos por nome, local..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {/* Categorias */}
        <Text style={styles.sectionTitle}>Categorias</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {/* Opção "Todos" */}
          <TouchableOpacity
            style={[
              styles.categoryItem,
              selectedCategoryName === 'todos' && styles.categoryItemSelected,
            ]}
            onPress={() => {
              setSelectedCategoryId(null);
              setSelectedCategoryName('todos');
            }}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategoryName === 'todos' && styles.categoryTextSelected,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>

          {/* Categorias da API */}
          {categories.map(renderCategoryItem)}
        </ScrollView>

        {/* Eventos em Destaque */}
        {featuredEvents.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Eventos em Destaque</Text>
              <TouchableOpacity onPress={() => console.log('Ver todos')}>
                <Text style={styles.seeAllText}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={featuredEvents}
              renderItem={renderFeaturedItem}
              keyExtractor={item => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            />
          </View>
        )}

        {/* Próximos Eventos */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategoryName === 'todos'
              ? 'Próximos Eventos'
              : `${selectedCategoryName}`}
          </Text>
        </View>

        {filteredEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>Nenhum evento encontrado</Text>
            <Text style={styles.emptyStateSubtext}>
              Tente outra busca ou categoria
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredEvents}
            renderItem={renderEventItem}
            keyExtractor={item => String(item.id)}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.eventsList}
          />
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
