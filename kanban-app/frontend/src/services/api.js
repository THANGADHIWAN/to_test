import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const fetchCards = async () => {
  const response = await axios.get(`${API_URL}/cards`);
  return response.data;
};

export const createCard = async (card) => {
  const response = await axios.post(`${API_URL}/cards`, card);
  return response.data;
};

export const updateCard = async (cardId, card) => {
  const response = await axios.put(`${API_URL}/cards/${cardId}`, card);
  return response.data;
};

export const deleteCard = async (cardId) => {
  const response = await axios.delete(`${API_URL}/cards/${cardId}`);
  return response.data;
};
