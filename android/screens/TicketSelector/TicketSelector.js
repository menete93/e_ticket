// // components/checkout/TicketSelector.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import { getTickets } from './../../services/ticketService';
// import styles from './styles';

// export const TicketSelector = ({ eventId, onSelectionChange, disabled }) => {
//   const [tickets, setTickets] = useState([]);
//   const [quantities, setQuantities] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const loadTickets = useCallback(async () => {
//     if (!eventId) {
//       console.log('⚠️ TicketSelector: eventId não fornecido');
//       setError('ID do evento não fornecido');
//       setLoading(false);
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);

//       console.log('🔍 TicketSelector: Buscando tickets para eventId:', eventId);

//       const response = await getTickets(eventId);

//       console.log(
//         '📦 TicketSelector: Resposta recebida:',
//         JSON.stringify(response, null, 2),
//       );

//       // Trata diferentes formatos de resposta
//       let ticketsData = [];

//       if (response?.data?.data) {
//         ticketsData = response.data.data;
//       } else if (response?.data && Array.isArray(response.data)) {
//         ticketsData = response.data;
//       } else if (Array.isArray(response)) {
//         ticketsData = response;
//       } else if (response?.data && typeof response.data === 'object') {
//         ticketsData = [response.data];
//       } else {
//         console.warn('⚠️ Formato de resposta não reconhecido:', response);
//         ticketsData = [];
//       }

//       console.log(
//         '✅ TicketSelector: Tickets processados:',
//         ticketsData.length,
//       );

//       // Mapeia os campos
//       const mappedTickets = ticketsData.map(ticket => ({
//         id: ticket.id,
//         ticketName: ticket.name || ticket.ticketName || 'Ingresso',
//         name: ticket.name,
//         price: ticket.price || 0,
//         description: ticket.description || '',
//         availableQuantity:
//           ticket.availableQuantity || ticket.available_quantity || 0,
//         maxTicketsPerUser:
//           ticket.maxPerPerson || ticket.maxTicketsPerUser || 10,
//         category: ticket.category || 'regular',
//         isAvailable: (ticket.availableQuantity || 0) > 0,
//         benefits: ticket.benefits || [],
//       }));

//       setTickets(mappedTickets);

//       const initialQuantities = {};
//       mappedTickets.forEach(ticket => {
//         initialQuantities[ticket.id] = 0;
//       });
//       setQuantities(initialQuantities);

//       onSelectionChange(initialQuantities);
//     } catch (err) {
//       console.error('❌ TicketSelector: Erro ao carregar tickets:', err);
//       setError(
//         err.response?.data?.message || 'Não foi possível carregar os ingressos',
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [eventId, onSelectionChange]);

//   useEffect(() => {
//     loadTickets();
//   }, [loadTickets]);

//   const handleQuantityChange = (ticketId, quantity) => {
//     const newQuantity = parseInt(quantity) || 0;
//     const ticket = tickets.find(t => t.id === ticketId);

//     if (!ticket) return;

//     if (ticket.maxTicketsPerUser && newQuantity > ticket.maxTicketsPerUser) {
//       Alert.alert(
//         'Limite excedido',
//         `Máximo de ${ticket.maxTicketsPerUser} ingressos por usuário`,
//       );
//       return;
//     }

//     if (newQuantity > ticket.availableQuantity) {
//       Alert.alert(
//         'Indisponível',
//         `Apenas ${ticket.availableQuantity} ingressos disponíveis`,
//       );
//       return;
//     }

//     const newQuantities = { ...quantities, [ticketId]: newQuantity };
//     setQuantities(newQuantities);
//     onSelectionChange(newQuantities);
//   };

//   const getCategoryColor = category => {
//     switch (category?.toLowerCase()) {
//       case 'vip':
//         return '#d97706';
//       case 'regular':
//         return '#0284c7';
//       case 'earlybird':
//         return '#16a34a';
//       case 'student':
//         return '#9333ea';
//       default:
//         return '#667eea';
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#667eea" />
//         <Text style={styles.loadingText}>Carregando ingressos...</Text>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.errorContainer}>
//         <Text style={styles.errorText}>{error}</Text>
//         <TouchableOpacity style={styles.retryButton} onPress={loadTickets}>
//           <Text style={styles.retryButtonText}>Tentar novamente</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   if (tickets.length === 0 && !loading) {
//     return (
//       <View style={styles.errorContainer}>
//         <Text style={styles.errorText}>
//           Nenhum ingresso disponível para este evento
//         </Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Selecione seus ingressos</Text>
//       {tickets.map(ticket => (
//         <View
//           key={ticket.id}
//           style={[
//             styles.ticketItem,
//             !ticket.isAvailable && styles.disabledItem,
//           ]}
//         >
//           <View style={styles.ticketInfo}>
//             <View style={styles.ticketHeader}>
//               <Text style={styles.ticketName}>{ticket.ticketName}</Text>
//               {ticket.category && (
//                 <View
//                   style={[
//                     styles.categoryBadge,
//                     { backgroundColor: getCategoryColor(ticket.category) },
//                   ]}
//                 >
//                   <Text style={styles.categoryText}>{ticket.category}</Text>
//                 </View>
//               )}
//             </View>
//             <Text style={styles.ticketPrice}>
//               {typeof ticket.price === 'number'
//                 ? ticket.price.toFixed(2)
//                 : ticket.price}{' '}
//               MT
//             </Text>
//             {ticket.description && (
//               <Text style={styles.ticketDescription}>{ticket.description}</Text>
//             )}
//             {ticket.benefits && ticket.benefits.length > 0 && (
//               <View style={styles.benefitsContainer}>
//                 <Text style={styles.benefitsText}>
//                   Benefícios: {ticket.benefits.join(', ')}
//                 </Text>
//               </View>
//             )}
//             <View style={styles.ticketStats}>
//               <Text style={styles.statsText}>
//                 Disponíveis: {ticket.availableQuantity}
//               </Text>
//               {ticket.maxTicketsPerUser && (
//                 <Text style={styles.statsText}>
//                   Máx por pessoa: {ticket.maxTicketsPerUser}
//                 </Text>
//               )}
//             </View>
//           </View>

//           <View style={styles.ticketQuantity}>
//             <Text style={styles.quantityLabel}>Quantidade:</Text>
//             <TextInput
//               style={styles.quantityInput}
//               keyboardType="numeric"
//               value={String(quantities[ticket.id] || 0)}
//               onChangeText={value => handleQuantityChange(ticket.id, value)}
//               editable={
//                 !disabled && ticket.isAvailable && ticket.availableQuantity > 0
//               }
//             />
//           </View>
//         </View>
//       ))}
//     </ScrollView>
//   );
// };
