describe('OCR flow', () => {
  it('login, import, review, publish, see products', () => {
    // These selectors assume testing ids added (skipping actual UI selectors for brevity)
    cy.intercept('POST', 'http://localhost:3000/auth/login', { token: 't', businessId: 'b1' }).as(
      'login'
    );
    cy.intercept('GET', 'http://localhost:3000/products*', { body: [] }).as('getProducts');
    cy.intercept('POST', 'http://localhost:8000/ocr/extract', {
      items: [{ name: 'Pizza', price: 29.9, description: 'Calabresa', confidence: 0.9 }],
    }).as('ocr');
    cy.intercept('POST', 'http://localhost:3000/products', {
      statusCode: 201,
      body: { id: 'p1' },
    }).as('createProduct');

    // Visit Expo web dev server
    cy.visit('/');

    // Login
    cy.contains('Entrar');
    // Assuming inputs exist; in real app add testID
    cy.get('input').first().type('a@a.com');
    cy.get('input').eq(1).type('1234');
    cy.contains('Entrar').click();
    cy.wait('@login');

    // Navigate to OCR Import
    cy.contains('Importar Cardápio').click();

    // Trigger OCR
    cy.contains('Selecionar e Extrair').click();
    cy.wait('@ocr');

    // Review and publish
    cy.contains('Publicar no cardápio').click();
    cy.wait('@createProduct');
  });
});
