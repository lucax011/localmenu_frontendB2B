import { isOpenOrder, money, parsePrice, priceText, STATUS_ACTIONS, timeAgo } from '@/utils/format';
import { itemSchema, ocrItemSchema } from '@/utils/validators';

describe('preços', () => {
  it('entende vírgula, ponto, milhar e prefixo R$', () => {
    expect(parsePrice('32,90')).toBe(32.9);
    expect(parsePrice('32.90')).toBe(32.9);
    expect(parsePrice('R$ 1.234,50')).toBe(1234.5);
    expect(parsePrice('abc')).toBeNaN();
  });

  it('formata em reais e volta para o campo de texto', () => {
    expect(money(32.9).replace(/\s/g, ' ')).toBe('R$ 32,90');
    expect(priceText(19.9)).toBe('19,90');
  });
});

describe('pedidos', () => {
  it('só oferece as transições aceitas pela API', () => {
    expect(STATUS_ACTIONS.PENDING.map((a) => a.to)).toEqual(['CONFIRMED', 'CANCELLED']);
    expect(STATUS_ACTIONS.PREPARING.map((a) => a.to)).toEqual(['READY']);
    expect(STATUS_ACTIONS.COMPLETED).toEqual([]);
  });

  it('separa abertos de finalizados', () => {
    expect(isOpenOrder('READY')).toBe(true);
    expect(isOpenOrder('CANCELLED')).toBe(false);
  });

  it('mostra há quanto tempo o pedido chegou', () => {
    const now = Date.parse('2026-10-27T12:00:00Z');
    expect(timeAgo('2026-10-27T11:50:00Z', now)).toBe('há 10 min');
    expect(timeAgo('2026-10-26T10:00:00Z', now)).toBe('ontem');
  });
});

describe('validação', () => {
  it('aceita item com preço em texto e exige categoria', () => {
    const ok = itemSchema.safeParse({
      name: 'Brasa Bacon',
      price: '38,90',
      categoryId: 'c1',
      isAvailable: true,
    });
    expect(ok.success).toBe(true);
    expect(
      itemSchema.safeParse({ name: 'X-Tudo', price: '10', categoryId: '', isAvailable: true })
        .success
    ).toBe(false);
  });

  it('recusa item do OCR sem preço válido', () => {
    expect(ocrItemSchema.safeParse({ name: 'Brownie', price: '19,90' }).success).toBe(true);
    expect(ocrItemSchema.safeParse({ name: 'Brownie', price: 'grátis' }).success).toBe(false);
  });
});
