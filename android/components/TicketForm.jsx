import { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { createTicket } from "../api/ticketApi";

export default function TicketForm() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    basePrice: "",
  });

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      await createTicket(form);
      Alert.alert("Sucesso", "Ticket criado com sucesso!");
      setForm({ name: "", description: "", basePrice: "" });
    } catch (err) {
      console.error("Erro ao criar ticket:", err);
      Alert.alert("Erro", "Não foi possível criar o ticket.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Novo Ticket</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={form.name}
        onChangeText={(text) => handleChange("name", text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Descrição"
        value={form.description}
        onChangeText={(text) => handleChange("description", text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Preço base"
        value={form.basePrice}
        onChangeText={(text) => handleChange("basePrice", text)}
        keyboardType="numeric"
      />

      <Button title="Salvar" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 12,
    borderRadius: 4
  }
});
