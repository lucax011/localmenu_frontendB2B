import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IconButton, PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from './src/store/authStore';
import { colors, theme } from './src/theme';
import type { OcrUploadResult } from './src/api/types';
import LoginScreen from './src/features/auth/LoginScreen';
import DashboardScreen from './src/features/dashboard/DashboardScreen';
import RestaurantScreen from './src/features/restaurant/RestaurantScreen';
import MenuScreen from './src/features/menu/MenuScreen';
import ItemFormScreen from './src/features/menu/ItemFormScreen';
import OCRImportScreen from './src/features/ocr/OCRImportScreen';
import OCRReviewScreen from './src/features/ocr/OCRReviewScreen';
import OrdersScreen from './src/features/orders/OrdersScreen';
import ReportsScreen from './src/features/reports/ReportsScreen';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Restaurant: undefined;
  Menu: undefined;
  ItemForm: { itemId?: string; categoryId?: string };
  OCRImport: undefined;
  OCRReview: OcrUploadResult;
  Orders: undefined;
  Reports: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 20 },
  },
});

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.cream, primary: colors.brand },
};

function RootNavigator() {
  const token = useAuthStore((s) => s.accessToken);
  const logout = useAuthStore((s) => s.logout);
  return (
    <NavigationContainer theme={navTheme} documentTitle={{ formatter: () => 'LocalMenu B2B' }}>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: colors.ink,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.cream },
        }}
      >
        {!token ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{
                title: 'LocalMenu',
                headerRight: () => (
                  <IconButton
                    icon="logout"
                    accessibilityLabel="Sair"
                    onPress={() => {
                      queryClient.clear();
                      logout();
                    }}
                  />
                ),
              }}
            />
            <Stack.Screen
              name="Restaurant"
              component={RestaurantScreen}
              options={{ title: 'Meu restaurante' }}
            />
            <Stack.Screen name="Menu" component={MenuScreen} options={{ title: 'Cardápio' }} />
            <Stack.Screen name="ItemForm" component={ItemFormScreen} options={{ title: 'Item' }} />
            <Stack.Screen
              name="OCRImport"
              component={OCRImportScreen}
              options={{ title: 'Importar por foto' }}
            />
            <Stack.Screen
              name="OCRReview"
              component={OCRReviewScreen}
              options={{ title: 'Revisar itens' }}
            />
            <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'Pedidos' }} />
            <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Vendas' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <RootNavigator />
        <StatusBar style="dark" />
      </PaperProvider>
    </QueryClientProvider>
  );
}
