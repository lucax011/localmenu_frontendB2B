import React from 'react';
import { View, ScrollView } from 'react-native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { getOrders, getProducts } from '@/api/client';
import { useAuthStore } from '@/store/authStore';

export default function DashboardScreen() {
  const nav = useNavigation<any>();
  const businessId = useAuthStore((s) => s.businessId)!;
  const { data: products } = useQuery({
    queryKey: ['products', businessId],
    queryFn: () => getProducts(businessId),
  });
  const { data: orders } = useQuery({
    queryKey: ['orders', businessId],
    queryFn: () => getOrders(businessId),
  });

  const pendingOrders = (orders || []).filter((o: any) => o.status !== 'completed');

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Title style={{ marginBottom: 12 }}>Visão Geral</Title>
      <View style={{ gap: 12 }}>
        <Card>
          <Card.Content>
            <Title>Pedidos em aberto</Title>
            <Paragraph>{pendingOrders.length}</Paragraph>
            <Button onPress={() => nav.navigate('Orders')}>Ver pedidos</Button>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content>
            <Title>Produtos</Title>
            <Paragraph>{(products || []).length}</Paragraph>
            <Button onPress={() => nav.navigate('Products')}>Gerir produtos</Button>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content>
            <Title>Importar Cardápio (OCR)</Title>
            <Paragraph>Extraia itens do seu cardápio via OCR</Paragraph>
            <Button onPress={() => nav.navigate('OCRImport')}>Importar agora</Button>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content>
            <Title>Meu Negócio</Title>
            <Paragraph>Atualize os dados do estabelecimento</Paragraph>
            <Button onPress={() => nav.navigate('Business')}>Editar</Button>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content>
            <Title>Relatórios</Title>
            <Paragraph>KPIs básicos via simulação</Paragraph>
            <Button onPress={() => nav.navigate('Reports')}>Abrir</Button>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}
