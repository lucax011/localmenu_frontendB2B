/* ESLint base para POC: Cypress habilitado, regras RN flexibilizadas para não travar commit */
module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  settings: {
    react: { version: 'detect' },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-native', 'cypress'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-native/all',
    'plugin:prettier/recommended',
  ],
  rules: {
    // Permitir 'any' durante a POC
    '@typescript-eslint/no-explicit-any': 'off',
    // Flexibilizações para POC
    'react-native/no-inline-styles': 'off',
    'react-native/no-color-literals': 'off',
    'react-native/no-raw-text': 'off',

    // Evita quebrar build por variáveis não usadas (ex.: watch, token etc.)
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],

    // RN + TSX
    'react/prop-types': 'off',
  },
  overrides: [
    // Cypress
    {
      files: ['cypress/**/*.{ts,tsx,js,jsx}'],
      env: { browser: true, 'cypress/globals': true },
      plugins: ['cypress'],
      rules: {
        'no-undef': 'off',
      },
    },
  ],
};
