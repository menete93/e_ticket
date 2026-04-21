// screens/user/MyTicketsScreen.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserSales } from '../../../../services/ticketService';
import LinearGradient from 'react-native-linear-gradient';
import styles from './style';

export default function MyTicketsScreen() {
  const navigation = useNavigation();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userId, setUserId] = useState(null);

  // Ref para evitar múltiplas chamadas
  const isFirstLoad = useRef(true);

  // Buscar usuário logado (apenas uma vez)
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUserId(user.id);
          console.log('👤 User ID carregado:', user.id);
        }
      } catch (error) {
        console.error('Erro ao pegar usuário:', error);
      }
    };
    loadUserId();
  }, []);

  // Carregar ingressos quando userId estiver disponível
  useEffect(() => {
    if (userId) {
      loadTickets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadTickets = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      console.log('🔄 Carregando ingressos para userId:', userId);

      const response = await getUserSales(userId);
      const salesData = Array.isArray(response)
        ? response
        : response?.data || [];

      console.log('✅ Ingressos carregados:', salesData.length);
      setSales(salesData);
    } catch (error) {
      console.error('❌ Erro ao carregar ingressos:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus ingressos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  });

  // Refresh manual
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTickets();
  }, [loadTickets]);

  // Abrir detalhes do ingresso
  const handleTicketPress = sale => {
    setSelectedSale(sale);
    setModalVisible(true);
  };

  // Baixar ingresso (PDF/Imagem)
  const handleDownloadTicket = sale => {
    Alert.alert('Download do Ingresso', 'Escolha uma opção:', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salvar como PDF',
        onPress: () => Alert.alert('Info', 'Funcionalidade em desenvolvimento'),
      },
      {
        text: 'Salvar na Galeria',
        onPress: () => Alert.alert('Info', 'Funcionalidade em desenvolvimento'),
      },
    ]);
  };

  // Compartilhar ingresso
  const handleShareTicket = sale => {
    Alert.alert('Compartilhar', 'Funcionalidade em desenvolvimento');
  };

  // Formatar data
  const formatDate = dateString => {
    if (!dateString) return 'Data não definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Obter status do ingresso
  const getStatusConfig = status => {
    switch (status) {
      case 'PAID':
        return {
          text: 'Confirmado',
          color: '#10B981',
          icon: 'checkmark-circle',
        };
      case 'PENDING':
        return { text: 'Pendente', color: '#F59E0B', icon: 'time' };
      case 'CANCELLED':
        return { text: 'Cancelado', color: '#EF4444', icon: 'close-circle' };
      default:
        return {
          text: status || 'Desconhecido',
          color: '#6B7280',
          icon: 'help-circle',
        };
    }
  };

  // Renderizar item de ingresso
  const renderTicketItem = ({ item }) => {
    const statusConfig = getStatusConfig(item.status);

    return (
      <TouchableOpacity
        style={styles.ticketCard}
        onPress={() => handleTicketPress(item)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={
            item.status === 'PAID'
              ? ['#4F46E5', '#7C3AED']
              : ['#9CA3AF', '#6B7280']
          }
          style={styles.ticketGradient}
        >
          <View style={styles.ticketHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventName} numberOfLines={1}>
                {item.eventName || item.event?.name || 'Evento'}
              </Text>
              <Text style={styles.ticketType} numberOfLines={1}>
                {item.ticketName || item.ticket?.name || 'Ingresso'}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusConfig.color + '20' },
              ]}
            >
              <Ionicons
                name={statusConfig.icon}
                size={14}
                color={statusConfig.color}
              />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.text}
              </Text>
            </View>
          </View>

          <View style={styles.ticketInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={16} color="#fff" />
              <Text style={styles.infoText}>
                {formatDate(item.createdAt || item.saleDate)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="ticket" size={16} color="#fff" />
              <Text style={styles.infoText}>
                {item.quantity || 1} ingresso(s)
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="cash" size={16} color="#fff" />
              <Text style={styles.infoText}>
                {item.totalAmount || item.amount || 0} MT
              </Text>
            </View>
          </View>

          <View style={styles.ticketFooter}>
            <Text style={styles.transactionId} numberOfLines={1}>
              Transação: {item.transactionId || item.id}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Modal de detalhes
  const renderTicketModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>Detalhes do Ingresso</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            {selectedSale && (
              <>
                {/* QR Code Placeholder */}
                <View style={styles.qrCodeContainer}>
                  <View style={styles.qrCodePlaceholder}>
                    <Ionicons name="qr-code" size={80} color="#4F46E5" />
                  </View>
                  <Text style={styles.qrCodeText}>
                    Apresente este QR Code na entrada
                  </Text>
                </View>

                {/* Informações do Evento */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Evento</Text>
                  <Text style={styles.eventNameDetail}>
                    {selectedSale.eventName || selectedSale.event?.name}
                  </Text>
                  <Text style={styles.eventDetail}>
                    {selectedSale.event?.location || 'Local não informado'}
                  </Text>
                </View>

                {/* Informações do Ingresso */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Ingresso</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Tipo:</Text>
                    <Text style={styles.detailValue}>
                      {selectedSale.ticketName || selectedSale.ticket?.name}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Quantidade:</Text>
                    <Text style={styles.detailValue}>
                      {selectedSale.quantity || 1}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Preço Unitário:</Text>
                    <Text style={styles.detailValue}>
                      {selectedSale.unitPrice || selectedSale.price || 0} MT
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total:</Text>
                    <Text style={[styles.detailValue, styles.totalValue]}>
                      {selectedSale.totalAmount || selectedSale.amount || 0} MT
                    </Text>
                  </View>
                </View>

                {/* Informações do Comprador */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Comprador</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Nome:</Text>
                    <Text style={styles.detailValue}>
                      {selectedSale.buyerName ||
                        selectedSale.user?.name ||
                        'Não informado'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email:</Text>
                    <Text style={styles.detailValue}>
                      {selectedSale.buyerEmail ||
                        selectedSale.user?.email ||
                        'Não informado'}
                    </Text>
                  </View>
                </View>

                {/* Transação */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Transação</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>ID:</Text>
                    <Text style={styles.transactionIdDetail}>
                      {selectedSale.transactionId || selectedSale.id}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Data:</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(
                        selectedSale.createdAt || selectedSale.saleDate,
                      )}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <Text
                      style={[
                        styles.statusDetail,
                        { color: getStatusConfig(selectedSale.status).color },
                      ]}
                    >
                      {getStatusConfig(selectedSale.status).text}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.downloadButton]}
              onPress={() => handleDownloadTicket(selectedSale)}
            >
              <Ionicons name="download" size={20} color="#fff" />
              <Text style={styles.modalButtonText}>Baixar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.shareButton]}
              onPress={() => handleShareTicket(selectedSale)}
            >
              <Ionicons name="share-social" size={20} color="#fff" />
              <Text style={styles.modalButtonText}>Compartilhar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading && sales.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Carregando seus ingressos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <Text style={styles.headerTitle}>Meus Ingressos</Text>
        <Text style={styles.headerSubtitle}>
          {sales.length} {sales.length === 1 ? 'ingresso' : 'ingressos'}{' '}
          comprados
        </Text>
      </LinearGradient>

      {sales.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="ticket-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>Nenhum ingresso encontrado</Text>
          <Text style={styles.emptyStateSubtext}>
            Você ainda não comprou nenhum ingresso
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Início')}
          >
            <Text style={styles.browseButtonText}>Explorar Eventos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sales}
          renderItem={renderTicketItem}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {renderTicketModal()}
    </View>
  );
}
