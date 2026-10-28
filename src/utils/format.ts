import type { OrderStatus } from '@/api/types';

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const money = (value: number) => BRL.format(value || 0);

// Aceita "32,90", "32.90", "R$ 32,90" e "1.234,50"; devolve NaN se não for preço
export const parsePrice = (text: string) => {
  const clean = text.replace(/[^\d.,]/g, '');
  if (!clean) return NaN;
  const normalized = clean.includes(',') ? clean.replace(/\./g, '').replace(',', '.') : clean;
  return Number(normalized);
};

export const priceText = (value: number) => value.toFixed(2).replace('.', ',');

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Novo',
  CONFIRMED: 'Confirmado',
  PREPARING: 'Em preparo',
  READY: 'Pronto',
  COMPLETED: 'Entregue',
  CANCELLED: 'Cancelado',
};

export const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: '#C2410C',
  CONFIRMED: '#1D4ED8',
  PREPARING: '#7C3AED',
  READY: '#047857',
  COMPLETED: '#57534E',
  CANCELLED: '#B91C1C',
};

// Ações do restaurante em cada etapa; seguem as transições aceitas pela API
export const STATUS_ACTIONS: Record<OrderStatus, { to: OrderStatus; label: string }[]> = {
  PENDING: [
    { to: 'CONFIRMED', label: 'Aceitar' },
    { to: 'CANCELLED', label: 'Recusar' },
  ],
  CONFIRMED: [
    { to: 'PREPARING', label: 'Começar preparo' },
    { to: 'CANCELLED', label: 'Cancelar' },
  ],
  PREPARING: [{ to: 'READY', label: 'Pronto para retirada' }],
  READY: [{ to: 'COMPLETED', label: 'Entregue' }],
  COMPLETED: [],
  CANCELLED: [],
};

export const isOpenOrder = (status: OrderStatus) =>
  status !== 'COMPLETED' && status !== 'CANCELLED';

export const timeAgo = (iso: string, now = Date.now()) => {
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'ontem' : `há ${days} dias`;
};

export const paidLabel = (n: number) => (n === 1 ? '1 pedido pago' : `${n} pedidos pagos`);
