import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from './src/store/authStore';
import LoginScreen from './src/features/auth/LoginScreen';
import DashboardScreen from './src/features/dashboard/DashboardScreen';
import BusinessScreen from './src/features/business/BusinessScreen';
import ProductsListScreen from './src/features/products/ProductsListScreen';
import ProductFormScreen from './src/features/products/ProductFormScreen';
import OCRImportScreen from './src/features/ocr/OCRImportScreen';
import OCRReviewScreen from './src/features/ocr/OCRReviewScreen';
import OrdersScreen from './src/features/orders/OrdersScreen';
import ReportsScreen from './src/features/reports/ReportsScreen';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Business: undefined;
  Products: undefined;
  ProductForm: { id?: string } | undefined;
  OCRImport: undefined;
  OCRReview: { items: any[] };
  Orders: undefined;
  Reports: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 30,
    },
  },
});

function RootNavigator() {
  const token = useAuthStore((s) => s.token);
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!token ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ title: 'LocalMenu B2B' }}
            />
            <Stack.Screen
              name="Business"
              component={BusinessScreen}
              options={{ title: 'Meu Negócio' }}
            />
            <Stack.Screen
              name="Products"
              component={ProductsListScreen}
              options={{ title: 'Produtos' }}
            />
            <Stack.Screen
              name="ProductForm"
              component={ProductFormScreen}
              options={{ title: 'Produto' }}
            />
            <Stack.Screen
              name="OCRImport"
              component={OCRImportScreen}
              options={{ title: 'Importar Cardápio' }}
            />
            <Stack.Screen
              name="OCRReview"
              component={OCRReviewScreen}
              options={{ title: 'Revisar Itens' }}
            />
            <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'Pedidos' }} />
            <Stack.Screen
              name="Reports"
              component={ReportsScreen}
              options={{ title: 'Relatórios' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </PaperProvider>
    </QueryClientProvider>
  );
}
