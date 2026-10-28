// Formatos devolvidos pela API do LocalMenu (localmenu_backend).
// Ids são UUID (string) e valores em dinheiro já chegam como número.

export type UserType = 'CUSTOMER' | 'OWNER' | 'ADMIN';

export type User = {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  userType: UserType;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  isActive: boolean;
};

export type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  price: number;
  isAvailable: boolean;
  order: number;
  confidence?: number | null;
};

export type MenuCategory = {
  id: string;
  menuId: string;
  name: string;
  order: number;
  items: MenuItem[];
};

export type Menu = {
  id: string;
  restaurantId: string;
  name: string;
  categories: MenuCategory[];
};

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED';

export type OrderItem = {
  id: string;
  menuItemId: string;
  nameSnapshot: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  notes?: string | null;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  customerNotes?: string | null;
  createdAt: string;
  items: OrderItem[];
  payment?: { status: string; method: string; paidAt?: string | null } | null;
  customer: { id: string; name: string; phone?: string | null };
};

export type OcrItem = {
  name: string;
  price: number;
  description?: string;
  category?: string;
  confidence?: number;
};

export type OcrUploadResult = {
  uploadId: string;
  menuId: string;
  imageUrl: string;
  items: OcrItem[];
};

export type Report = {
  days: number;
  since: string;
  orders: number;
  paidOrders: number;
  revenue: number;
  averageTicket: number;
  byStatus: Partial<Record<OrderStatus, number>>;
  topItems: { name: string; quantity: number; revenue: number }[];
};
