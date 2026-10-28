import { API, comToken, entrarNoPainel, tokenDe } from '../support/e2e';

// Usa o Sushi Kaze e itens com "Teste OCR" no nome; tudo é apagado no fim
const DONO = 'kaze@localmenu.dev';

const limparItensDeTeste = () =>
  tokenDe(DONO).then((token) => {
    const headers = comToken(token);
    cy.request({ url: `${API}/restaurants/me`, headers }).then(({ body: [restaurante] }) => {
      cy.request({ url: `${API}/menus/${restaurante.id}`, headers }).then(({ body: menus }) => {
        for (const menu of menus) {
          for (const categoria of menu.categories) {
            const deTeste = categoria.items.filter((i: { name: string }) =>
              i.name.includes('Teste OCR')
            );
            for (const item of deTeste) {
              cy.request({ method: 'DELETE', url: `${API}/menus/item/${item.id}`, headers });
            }
            if (deTeste.length && deTeste.length === categoria.items.length) {
              cy.request({
                method: 'DELETE',
                url: `${API}/menus/category/${categoria.id}`,
                headers,
              });
            }
          }
        }
      });
    });
  });

describe('Importar cardápio por foto', () => {
  before(limparItensDeTeste);
  after(limparItensDeTeste);

  it('o OCR lê a foto, o dono revisa e os itens entram no cardápio', () => {
    entrarNoPainel(DONO);
    cy.contains('Importar por foto').click();
    // no navegador o seletor de imagem cria um <input type=file>; o teste entrega a foto nele
    cy.contains('[role=button]', 'Escolher foto').click();
    cy.get('input[type=file]').selectFile('cypress/fixtures/cardapio.png', { force: true });
    cy.contains('[role=button]', 'Ler cardápio').click();

    cy.contains('2 itens encontrados', { timeout: 90000 });
    cy.get('input').should(($inputs) => {
      const valores = [...$inputs].map((i) => (i as HTMLInputElement).value).join(' | ');
      expect(valores).to.contain('Mochi Teste OCR');
      expect(valores).to.contain('14,90');
      expect(valores).to.contain('Dorayaki Teste OCR');
      expect(valores).to.contain('12,50');
    });
    cy.get('[role=button]:contains("ao cardápio")').last().click();
    cy.contains('Mochi Teste OCR', { timeout: 20000 });
    cy.contains('Dorayaki Teste OCR');
  });
});
