import React from 'react';
import { ScrollView } from 'react-native';
import { Button, TextInput, Title } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMe, updateMe } from '@/api/client';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { businessSchema, type BusinessForm } from '@/utils/validators';

export default function BusinessScreen() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['me'], queryFn: getMe });
  const { control, handleSubmit } = useForm<BusinessForm>({
    resolver: zodResolver(businessSchema),
    values: data || { name: '', address: '', phone: '' },
  });
  const mutation = useMutation({
    mutationFn: updateMe,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Title style={{ marginBottom: 12 }}>Meu Negócio</Title>
      <Controller
        control={control}
        name="name"
        render={({ field: { value, onChange } }) => (
          <TextInput
            label="Nome"
            value={value}
            onChangeText={onChange}
            style={{ marginBottom: 8 }}
          />
        )}
      />
      <Controller
        control={control}
        name="address"
        render={({ field: { value, onChange } }) => (
          <TextInput
            label="Endereço"
            value={value}
            onChangeText={onChange}
            style={{ marginBottom: 8 }}
          />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field: { value, onChange } }) => (
          <TextInput
            label="Telefone"
            value={value}
            onChangeText={onChange}
            style={{ marginBottom: 16 }}
          />
        )}
      />
      <Button mode="contained" onPress={handleSubmit((vals) => mutation.mutate(vals))}>
        Salvar
      </Button>
    </ScrollView>
  );
}
