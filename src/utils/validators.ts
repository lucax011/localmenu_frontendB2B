import { z } from 'zod';
import { parsePrice } from './format';

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
});

export const restaurantSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome'),
  description: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Preço digitado como texto ("32,90"); o formulário guarda texto e converte ao salvar
export const priceField = z
  .string()
  .refine((t) => Number.isFinite(parsePrice(t)) && parsePrice(t) >= 0, 'Preço inválido');

export const itemSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome'),
  price: priceField,
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Escolha a categoria'),
  isAvailable: z.boolean(),
});

export const ocrItemSchema = z.object({
  name: z.string().trim().min(2, 'Nome curto demais'),
  price: priceField,
  description: z.string().optional(),
  category: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RestaurantForm = z.infer<typeof restaurantSchema>;
export type ItemForm = z.infer<typeof itemSchema>;
export type OcrItemForm = z.infer<typeof ocrItemSchema>;
