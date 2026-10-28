import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import type {
  AuthResponse,
  Menu,
  MenuCategory,
  MenuItem,
  OcrItem,
  OcrUploadResult,
  Order,
  OrderStatus,
  Report,
  Restaurant,
} from './types';

export const API_BASE =
  (Constants?.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl ||
  'http://localhost:3000';

export const api = axios.create({ baseURL: API_BASE, timeout: 1000 * 30 });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// O access token vale 15 min. Num 401, troca pelo refresh token uma vez e repete o pedido.
let refreshing: Promise<string | null> | null = null;

const refreshAccessToken = async () => {
  const { refreshToken, setTokens, logout } = useAuthStore.getState();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post<AuthResponse>(`${API_BASE}/auth/refresh`, null, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
    setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    logout();
    return null;
  }
};

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
  const isLogin = original?.url?.startsWith('/auth/login');
  if (error.response?.status !== 401 || !original || original._retry || isLogin) throw error;
  original._retry = true;
  refreshing = refreshing ?? refreshAccessToken().finally(() => (refreshing = null));
  const token = await refreshing;
  if (!token) throw error;
  original.headers.Authorization = `Bearer ${token}`;
  return api(original);
});

// Mensagem legível de um erro da API (o Nest manda `message` como texto ou lista)
export const errorMessage = (e: unknown, fallback = 'Algo deu errado. Tente de novo.') => {
  const err = e as AxiosError<{ message?: string | string[] }>;
  const msg = err?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join('\n');
  if (typeof msg === 'string') return msg;
  if (err?.code === 'ERR_NETWORK') return 'Sem conexão com a API.';
  return fallback;
};

// Auth
export const login = async (email: string, password: string) => {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  return data;
};

// Restaurante
export const getMyRestaurants = async () => {
  const { data } = await api.get<Restaurant[]>('/restaurants/me');
  return data;
};

export type RestaurantPayload = {
  name: string;
  description?: string;
  phone?: string;
  address?: string;
};

export const createRestaurant = async (payload: RestaurantPayload) => {
  const { data } = await api.post<Restaurant>('/restaurants', payload);
  return data;
};

export const updateRestaurant = async (id: string, payload: Partial<RestaurantPayload>) => {
  const { data } = await api.patch<Restaurant>(`/restaurants/${id}`, payload);
  return data;
};

// Cardápio
export const getMenus = async (restaurantId: string) => {
  const { data } = await api.get<Menu[]>(`/menus/${restaurantId}`);
  return data;
};

export const createMenu = async (restaurantId: string, name = 'Cardápio Principal') => {
  const { data } = await api.post<Menu>(`/menus/${restaurantId}`, { name });
  return data;
};

export const createCategory = async (menuId: string, name: string) => {
  const { data } = await api.post<MenuCategory>(`/menus/category/${menuId}`, { name });
  return data;
};

export const updateCategory = async (id: string, payload: { name?: string; order?: number }) => {
  const { data } = await api.patch<MenuCategory>(`/menus/category/${id}`, payload);
  return data;
};

export const deleteCategory = async (id: string) => {
  await api.delete(`/menus/category/${id}`);
};

export type ItemPayload = {
  name: string;
  price: number;
  description?: string;
  categoryId: string;
  isAvailable?: boolean;
};

export const createItem = async (payload: ItemPayload) => {
  const { data } = await api.post<MenuItem>('/menus/item', payload);
  return data;
};

export const updateItem = async (id: string, payload: Partial<ItemPayload>) => {
  const { data } = await api.patch<MenuItem>(`/menus/item/${id}`, payload);
  return data;
};

export const deleteItem = async (id: string) => {
  await api.delete(`/menus/item/${id}`);
};

// Importação por foto: a API guarda a foto, chama o OCR e devolve os itens para revisão
export type PickedImage = { uri: string; name: string; type: string };

export const uploadMenuPhoto = async (restaurantId: string, image: PickedImage) => {
  const form = new FormData();
  form.append('restaurantId', restaurantId);
  if (Platform.OS === 'web') {
    // no navegador o seletor devolve uma URL blob/data; o multipart precisa do arquivo
    const blob = await (await fetch(image.uri)).blob();
    form.append('file', blob, image.name);
  } else {
    form.append('file', image as unknown as Blob);
  }
  const { data } = await api.post<OcrUploadResult>('/uploads/ocr', form, {
    timeout: 1000 * 90,
  });
  return data;
};

export const importItems = async (menuId: string, uploadId: string, items: OcrItem[]) => {
  const { data } = await api.post<{ created: number; menu: Menu }>(`/menus/${menuId}/import`, {
    uploadId,
    items,
  });
  return data;
};

// Pedidos
export const getRestaurantOrders = async (restaurantId: string) => {
  const { data } = await api.get<Order[]>(`/orders/restaurant/${restaurantId}`);
  return data;
};

export const updateOrderStatus = async (id: string, status: OrderStatus) => {
  const { data } = await api.patch<Order>(`/orders/${id}/status`, { status });
  return data;
};

// Relatório
export const getReport = async (restaurantId: string, days: number) => {
  const { data } = await api.get<Report>(`/restaurants/${restaurantId}/report`, {
    params: { days },
  });
  return data;
};
