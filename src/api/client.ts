import axios from 'axios';
import Constants from 'expo-constants';
import { useAuthStore } from '@/store/authStore';

const API_BASE = (Constants?.expoConfig?.extra as any)?.apiBaseUrl || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type LoginResponse = { token: string; businessId: string };

export const login = async (email: string, password: string) => {
  const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
  return data;
};

export const getMe = async () => {
  const { data } = await api.get('/businesses/me');
  return data;
};

export const updateMe = async (payload: any) => {
  const { data } = await api.put('/businesses/me', payload);
  return data;
};

export const getProducts = async (businessId: string) => {
  const { data } = await api.get('/products', { params: { business_id: businessId } });
  return data as any[];
};

export const createProduct = async (payload: any) => {
  const { data } = await api.post('/products', payload);
  return data;
};

export const updateProduct = async (id: string, payload: any) => {
  const { data } = await api.put(`/products/${id}`, payload);
  return data;
};

export const deleteProduct = async (id: string) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};

export const getOrders = async (businessId: string) => {
  const { data } = await api.get('/orders', { params: { business_id: businessId } });
  return data as any[];
};

export const updateOrderStatus = async (id: string, status: string) => {
  const { data } = await api.put(`/orders/${id}/status`, { status });
  return data;
};

export const generateReport = async () => {
  const { data } = await api.post('/reports/generate');
  return data;
};
