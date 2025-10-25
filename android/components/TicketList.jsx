import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { getTickets } from "../api/ticketApi";

export default function TicketList() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    getTickets()
      .then((res) => setTickets(res.data))
      .catch((err) => console.error("Erro ao buscar tickets:", err));
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.name}>{item.name}</Text>
      <Text>{item.status} — {item.basePrice} MT</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎟️ Lista de Tickets</Text>
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, marginBottom: 12 },
  item: { padding: 8, borderBottomWidth: 1, borderColor: "#ccc" },
  name: { fontWeight: "bold" }
});
