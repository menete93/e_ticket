// import { useState } from 'react';
// import { createCategory } from '../api/categoryApi';

// export default function CategoryForm({ onCategoryCreated }) {
//   const [name, setName] = useState('');
//   const [description, setDescription] = useState('');

//   const handleSubmit = async e => {
//     e.preventDefault();
//     if (!name) return alert('O nome da categoria é obrigatório');

//     try {
//       await createCategory({ name, description });
//       alert('Categoria criada com sucesso!');
//       setName('');
//       setDescription('');
//       onCategoryCreated(); // notifica o pai para atualizar a lista
//     } catch (err) {
//       console.error(err);
//       alert('Erro ao criar categoria');
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <h2>Cadastrar Categoria</h2>
//       <input
//         type="text"
//         placeholder="Nome da categoria"
//         value={name}
//         onChange={e => setName(e.target.value)}
//       />
//       <textarea
//         placeholder="Descrição (opcional)"
//         value={description}
//         onChange={e => setDescription(e.target.value)}
//       />
//       <button type="submit">Salvar</button>
//     </form>
//   );
// }
// // src/components/CategoryForm.js
// import React, { useState } from "react";
// import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
// import axios from "axios";

// const CategoryForm = () => {
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");

//   const handleSubmit = async () => {
//     if (!name) {
//       Alert.alert("Erro", "O nome da categoria é obrigatório");
//       return;
//     }

//     try {
//       await axios.post("http://localhost:8080/api/categories", { name, description });
//       Alert.alert("Sucesso", "Categoria criada!");
//       setName("");
//       setDescription("");
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Erro", "Não foi possível criar a categoria");
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Cadastrar Categoria</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Nome da categoria"
//         value={name}
//         onChangeText={setName}
//       />
//       <TextInput
//         style={[styles.input, styles.textArea]}
//         placeholder="Descrição (opcional)"
//         value={description}
//         onChangeText={setDescription}
//         multiline
//       />
//       <Button title="Salvar" onPress={handleSubmit} />
//     </View>
//   );
// };
