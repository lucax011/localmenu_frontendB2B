// Os testes rodam contra a API local de verdade (docker compose do localmenu_backend).
export const API: string = Cypress.env('API') || 'http://localhost:3000';
export const SENHA = 'localmenu123';

// Token de uma conta, direto pela API (para preparar dados e limpar depois)
export const tokenDe = (email: string, password = SENHA) =>
  cy
    .request('POST', `${API}/auth/login`, { email, password })
    .then((res) => res.body.accessToken as string);

export const comToken = (token: string) => ({ Authorization: `Bearer ${token}` });

// Entra no painel pela tela de login
export const entrarNoPainel = (email: string) => {
  cy.visit('/');
  cy.get('input').eq(0).type(email);
  cy.get('input').eq(1).type(SENHA);
  cy.contains('[role=button]', 'Entrar').click();
};
