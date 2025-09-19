import { ocrItemSchema } from '@/utils/validators';

describe('ocrItemSchema', () => {
  it('validates basic item', () => {
    const parsed = ocrItemSchema.parse({ name: 'Pizza', price: 29.9, description: 'Calabresa' });
    expect(parsed.name).toBe('Pizza');
  });
  it('fails when missing name', () => {
    expect(() => ocrItemSchema.parse({ price: 10 })).toThrow();
  });
});
