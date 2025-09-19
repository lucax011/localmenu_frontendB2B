import React, { useEffect, useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { Button, TextInput, Title } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductForm } from '@/utils/validators';
import { createProduct, getProducts, updateProduct } from '@/api/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRoute } from '@react-navigation/native';
import { useAuthStore } from '@/store/authStore';

export default function ProductFormScreen() {
  const route = useRoute<any>();
  const id: string | undefined = route.params?.id;
  const businessId = useAuthStore((s) => s.businessId)!;
  const qc = useQueryClient();
  const { data: products } = useQuery({
    queryKey: ['products', businessId],
    queryFn: () => getProducts(businessId),
  });
  const editing = (products || []).find((p: any) => p.id === id);
  const { control, handleSubmit, reset, watch } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: editing || { name: '', price: 0, description: '', imageUrl: '' },
  });
  useEffect(() => {
    if (editing) reset(editing);
  }, [id]);
  const [image, setImage] = useState<{ uri: string; name: string; type: string } | null>(null);

  const createMut = useMutation({
    mutationFn: (vals: any) => createProduct({ ...vals, businessId, image }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products', businessId] }),
  });
  const updateMut = useMutation({
    mutationFn: (vals: any) => updateProduct(id!, { ...vals, businessId, image }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products', businessId] }),
  });

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
    });
    if (!res.canceled) {
      const asset = res.assets[0];
      setImage({
        uri: asset.uri,
        name: asset.fileName || 'image.jpg',
        type: asset.mimeType || 'image/jpeg',
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Title style={{ marginBottom: 12 }}>{id ? 'Editar Produto' : 'Novo Produto'}</Title>
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
        name="price"
        render={({ field: { value, onChange } }) => (
          <TextInput
            label="Preço"
            value={String(value)}
            onChangeText={(t) => onChange(Number(t))}
            keyboardType="decimal-pad"
            style={{ marginBottom: 8 }}
          />
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field: { value, onChange } }) => (
          <TextInput
            label="Descrição"
            value={value}
            onChangeText={onChange}
            multiline
            style={{ marginBottom: 8 }}
          />
        )}
      />
      {image?.uri ? (
        <Image
          source={{ uri: image.uri }}
          style={{ width: '100%', height: 200, marginBottom: 12 }}
        />
      ) : null}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button mode="outlined" onPress={pickImage}>
          Selecionar Imagem
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit((vals) => (id ? updateMut.mutate(vals) : createMut.mutate(vals)))}
        >
          {id ? 'Salvar' : 'Criar'}
        </Button>
      </View>
    </ScrollView>
  );
}
