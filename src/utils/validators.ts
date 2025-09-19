import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export const businessSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1).optional(),
  phone: z.string().min(8).optional(),
});

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  description: z.string().optional().default(''),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export const ocrItemSchema = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative(),
  description: z.string().optional().default(''),
  confidence: z.number().min(0).max(1).optional(),
  bbox: z.array(z.number()).optional(),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type BusinessForm = z.infer<typeof businessSchema>;
export type ProductForm = z.infer<typeof productSchema>;
export type OCRItemForm = z.infer<typeof ocrItemSchema>;
