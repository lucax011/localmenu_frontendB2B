import { MD3LightTheme } from 'react-native-paper';

// Paleta "brasa": laranja queimado sobre creme, para combinar com cardápio e cozinha
export const colors = {
  brand: '#C2410C',
  brandDark: '#7C2D12',
  cream: '#FBF7F2',
  card: '#FFFFFF',
  ink: '#1C1917',
  muted: '#78716C',
  line: '#E7E0D8',
  ok: '#047857',
  warn: '#B45309',
  danger: '#B91C1C',
};

export const theme = {
  ...MD3LightTheme,
  roundness: 3,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.brand,
    onPrimary: '#FFFFFF',
    primaryContainer: '#FFEDD5',
    onPrimaryContainer: colors.brandDark,
    secondary: '#57534E',
    secondaryContainer: '#F5EDE4',
    onSecondaryContainer: colors.ink,
    background: colors.cream,
    surface: colors.card,
    surfaceVariant: '#F5EDE4',
    outline: '#D6CCC2',
    outlineVariant: colors.line,
    error: colors.danger,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level1: '#FFFFFF',
      level2: '#FFFBF7',
    },
  },
};
