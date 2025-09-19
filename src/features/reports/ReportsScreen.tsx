import React from 'react';
import { ScrollView } from 'react-native';
import { Button, Card, Paragraph, Title } from 'react-native-paper';
import { useMutation } from '@tanstack/react-query';
import { generateReport } from '@/api/client';

export default function ReportsScreen() {
  const mutation = useMutation({ mutationFn: generateReport });
  const data = mutation.data || { sales: 0, avgTicket: 0, bestSellers: [] };
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Title style={{ marginBottom: 12 }}>Relatórios</Title>
      <Button
        mode="contained"
        onPress={() => mutation.mutate()}
        loading={mutation.isPending}
        style={{ marginBottom: 12 }}
      >
        Gerar
      </Button>
      <Card style={{ marginBottom: 12 }}>
        <Card.Content>
          <Title>Vendas</Title>
          <Paragraph>R$ {data.sales}</Paragraph>
        </Card.Content>
      </Card>
      <Card style={{ marginBottom: 12 }}>
        <Card.Content>
          <Title>Ticket médio</Title>
          <Paragraph>R$ {data.avgTicket}</Paragraph>
        </Card.Content>
      </Card>
      <Card>
        <Card.Content>
          <Title>Mais vendidos</Title>
          <Paragraph>{(data.bestSellers || []).join(', ')}</Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
