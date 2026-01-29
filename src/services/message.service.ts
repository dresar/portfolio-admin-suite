import api from '../lib/api';
import { Message, Subscriber } from '../types';

// Messages
export const getMessages = async () => {
  const response = await api.get<Message[]>('/messages/');
  return response.data;
};

export const getMessage = async (id: number) => {
  const response = await api.get<Message>(`/messages/${id}/`);
  return response.data;
};

export const markMessageAsRead = async (id: number) => {
  const response = await api.patch<Message>(`/messages/${id}/`, { isRead: true });
  return response.data;
};

export const deleteMessage = async (id: number) => {
  await api.delete(`/messages/${id}/`);
};

// Subscribers
export const getSubscribers = async () => {
  const response = await api.get<Subscriber[]>('/subscribers/');
  return response.data;
};

export const deleteSubscriber = async (id: number) => {
  await api.delete(`/subscribers/${id}/`);
};
