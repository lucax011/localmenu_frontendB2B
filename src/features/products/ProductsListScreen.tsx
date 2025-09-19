import React from 'react';
import { FlatList, View } from 'react-native';
import { Button, FAB, List } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteProduct, getProducts } from '@/api/client';
import { useAuthStore } from '@/store/authStore';

export default function ProductsListScreen() {
  const nav = useNavigation<any>();
  const businessId = useAuthStore((s) => s.businessId)!;
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['products', businessId],
    queryFn: () => getProducts(businessId),
  });
  const mutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products', businessId] }),
  });

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data || []}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <List.Item
            title={`${item.name} - R$ ${item.price.toFixed(2)}`}
            description={item.description}
            onPress={() => nav.navigate('ProductForm', { id: item.id })}
            right={() => <Button onPress={() => mutation.mutate(item.id)}>Excluir</Button>}
          />
        )}
      />
      <FAB
        icon="plus"
        style={{ position: 'absolute', right: 16, bottom: 16 }}
        onPress={() => nav.navigate('ProductForm')}
      />
    </View>
  );
}
