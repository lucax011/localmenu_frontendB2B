import React from 'react';
import { FlatList, View } from 'react-native';
import { Button, List, Title } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, updateOrderStatus } from '@/api/client';
import { useAuthStore } from '@/store/authStore';

export default function OrdersScreen() {
  const businessId = useAuthStore((s) => s.businessId)!;
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['orders', businessId],
    queryFn: () => getOrders(businessId),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders', businessId] }),
  });
  const cycle = (status: string) =>
    status === 'received' ? 'preparing' : status === 'preparing' ? 'ready' : 'completed';
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Title style={{ marginBottom: 12 }}>Pedidos</Title>
      <FlatList
        data={data || []}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <List.Item
            title={`#${item.id} - ${item.customerName || ''}`}
            description={`Status: ${item.status}`}
            right={() =>
              item.status !== 'completed' ? (
                <Button
                  onPress={() => updateMut.mutate({ id: item.id, status: cycle(item.status) })}
                >
                  Avançar
                </Button>
              ) : null
            }
          />
        )}
      />
    </View>
  );
}
