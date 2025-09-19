import React from 'react';
import { ScrollView } from 'react-native';
import { Button, List, TextInput, Title } from 'react-native-paper';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ocrItemSchema } from '@/utils/validators';
import { useRoute } from '@react-navigation/native';
import { useAuthStore } from '@/store/authStore';
import { createProduct } from '@/api/client';

const schema = ocrItemSchema.array().min(1);

export default function OCRReviewScreen() {
  const route = useRoute<any>();
  const items = (route.params?.items || []).map((i: any) => ({ description: '', ...i }));
  const businessId = useAuthStore((s) => s.businessId)!;
  const { control, handleSubmit } = useForm<{ items: any[] }>({
    resolver: zodResolver(schema.transform((arr) => ({ items: arr }))) as any,
    defaultValues: { items },
  });
  const { fields } = useFieldArray({ control, name: 'items' });

  const onPublish = async (data: { items: any[] }) => {
    await Promise.all(data.items.map((it) => createProduct({ ...it, businessId })));
    // navigate back to products list could be added
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Title style={{ marginBottom: 12 }}>Revisar Itens</Title>
      {fields.map((field, idx) => (
        <List.Section key={field.id}>
          <Controller
            control={control}
            name={`items.${idx}.name` as const}
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
            name={`items.${idx}.price` as const}
            render={({ field: { value, onChange } }) => (
              <TextInput
                label="Preço"
                value={String(value)}
                onChangeText={(t) => onChange(Number(t))}
                style={{ marginBottom: 8 }}
              />
            )}
          />
          <Controller
            control={control}
            name={`items.${idx}.description` as const}
            render={({ field: { value, onChange } }) => (
              <TextInput
                label="Descrição"
                value={value}
                onChangeText={onChange}
                style={{ marginBottom: 8 }}
              />
            )}
          />
          <Controller
            control={control}
            name={`items.${idx}.confidence` as const}
            render={({ field: { value } }) => (
              <TextInput
                label="Confiança"
                disabled
                value={value ? String(value) : ''}
                style={{ marginBottom: 16 }}
              />
            )}
          />
        </List.Section>
      ))}
      <Button mode="contained" onPress={handleSubmit((vals: any) => onPublish(vals))}>
        Publicar no cardápio
      </Button>
    </ScrollView>
  );
}
