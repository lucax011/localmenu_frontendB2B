import { API, comToken, entrarNoPainel } from '../support/e2e';

// Clica num botão do cartão do pedido (cada pedido tem os seus botões)
const acaoNoPedido = (numero: string, botao: string) =>
  cy
    .contains(`#${numero}`)
    .parentsUntil('body')
    .filter(`:contains("${botao}")`)
    .first()
    .within(() => cy.contains('[role=button]', botao).click());

describe('Pedidos', () => {
  it('um pedido pago pelo cliente chega ao painel e vai até pronto para retirada', () => {
    // Prepara: um cliente novo faz e paga um pedido no Brasa Burger, pela API
    const email = `cliente.e2e.${Date.now()}@localmenu.dev`;
    cy.request('POST', `${API}/auth/register`, {
      name: 'Cliente E2E',
      email,
      password: 'senha123',
      userType: 'CUSTOMER',
    }).then(({ body: auth }) => {
      const headers = comToken(auth.accessToken);
      cy.request(`${API}/public/r/brasa-burger`).then(({ body: { restaurant, menu } }) => {
        const item = menu.categories[0].items.find((i: { isAvailable: boolean }) => i.isAvailable);
        cy.request({
          method: 'POST',
          url: `${API}/orders`,
          headers,
          body: { restaurantId: restaurant.id, items: [{ menuItemId: item.id, quantity: 2 }] },
        }).then(({ body: order }) => {
          cy.request({
            method: 'POST',
            url: `${API}/payments`,
            headers,
            body: { orderId: order.id, method: 'PIX' },
          });

          // No painel do dono
          entrarNoPainel('dono@localmenu.dev');
          cy.contains('Aceite e acompanhe').click();
          cy.contains('Em aberto');
          cy.contains(`#${order.orderNumber}`);
          acaoNoPedido(order.orderNumber, 'Começar preparo');
          cy.contains(`Pedido #${order.orderNumber}: em preparo`);
          acaoNoPedido(order.orderNumber, 'Pronto para retirada');
          cy.contains(`Pedido #${order.orderNumber}: pronto`);

          // O cliente vê o novo status
          cy.request({ url: `${API}/orders/${order.id}`, headers })
            .its('body.status')
            .should('eq', 'READY');
        });
      });
    });
  });
});
