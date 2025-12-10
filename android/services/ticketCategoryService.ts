import { api } from './../services/api';

// 🔹 Lista todos os eventos

export default async function findAllTicketCategory() {
    const response = await api.get('/ticket-categories');

    console.log('Tickets', response)
    return response.data; // deve retornar um array de objetos [{ id, name }, ...]

}


