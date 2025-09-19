LocalMenu B2B (Expo + TypeScript)

Objetivo

- Base funcional para comerciantes (B2B) com: login, dashboard, gestão do negócio, CRUD de produtos, fluxo OCR (upload, extração, revisão e publicação), pedidos e relatórios.

Stack

- Expo + TypeScript, React Navigation, Zustand, React Query, Axios, React Native Paper, react-hook-form + zod.
- Testes: Jest + Testing Library; Cypress E2E em Expo Web.
- Qualidade: ESLint/Prettier/Husky.
- Infra local: Docker (web), Jenkinsfile (CI).

Configuração

- Copie .env.example para .env e ajuste se necessário:
  - EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
  - EXPO_PUBLIC_OCR_URL=http://localhost:8000

Scripts

- npm start: inicia o Expo (dev)
- npm run web: Expo Web
- npm run build:web: exporta bundle web para dist/
- npm test: unit tests (Jest)
- npm run e2e: Cypress (necessita Expo Web rodando)

Endpoints esperados

- Backend (NestJS):
  - POST /auth/login
  - GET/PUT /businesses/me
  - CRUD /products
  - GET /orders?business_id=:id; PUT /orders/:id/status
  - POST /reports/generate
- OCR (FastAPI):
  - POST /ocr/extract (multipart: file) -> { items: [{ name, price, description, confidence, bbox? }] }

Arquitetura

- src/
  - api/: Axios clients (backend, ocr)
  - features/: auth, dashboard, business, products, ocr, orders, reports
  - store/: Zustand (auth)
  - utils/: validators (zod)

Fluxo OCR

1. Tela Importar Cardápio: seleciona imagem/pdf (expo-image-picker no mobile; input file no web).
2. Envia multipart para http://localhost:8000/ocr/extract.
3. Pré-visualiza itens (nome, preço, descrição, confiança).
4. Edição inline (zod valida), confirmar e publicar: cria produtos no backend.

Payloads exemplo

- OCR resposta:
  {
  "items": [
  { "name": "Pizza", "price": 29.9, "description": "Calabresa", "confidence": 0.9 }
  ]
  }
- Criação de produto:
  { "name": "Pizza", "price": 29.9, "description": "Calabresa", "businessId": "<id>", "image": { uri, name, type } }

Testes

- Unit: src/**tests**/ocr-parse.test.ts
- E2E: cypress/e2e/ocr-flow.cy.ts (usa intercepts para simular login, OCR e publicação)

Docker (web)

- docker-compose up --build
- Acessar http://localhost:8080

Jenkins

- Jenkinsfile com stages: install, lint, test, build web, docker build.

Troubleshooting

- OCR lento: serviço local pode demorar até 60s. Verifique timeout e logs do microserviço (porta 8000).
- Expo Web porta: por padrão 8081 em dev; ajuste baseUrl do Cypress se necessário.

# localmenu_frontendB2B
