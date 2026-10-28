import React, { useState } from 'react';
import { View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  HelperText,
  Snackbar,
  Text,
  TextInput,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createRestaurant, errorMessage, updateRestaurant } from '@/api/client';
import { useRestaurant } from '@/hooks/data';
import { Panel, Screen } from '@/components/ui';
import PhotoPicker from '@/components/PhotoPicker';
import { restaurantSchema, type RestaurantForm } from '@/utils/validators';
import { colors } from '@/theme';

// Sem geocodificação nesta fase: restaurantes novos ficam no centro de São Paulo
const DEFAULT_LOCATION = { latitude: -23.5505, longitude: -46.6333 };

const FIELDS: { name: keyof RestaurantForm; label: string; multiline?: boolean }[] = [
  { name: 'name', label: 'Nome do restaurante' },
  { name: 'description', label: 'Descrição', multiline: true },
  { name: 'phone', label: 'Telefone' },
  { name: 'address', label: 'Endereço' },
];

export default function RestaurantScreen() {
  const nav = useNavigation<any>();
  const qc = useQueryClient();
  const { restaurant, isLoading } = useRestaurant();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<RestaurantForm>({
    resolver: zodResolver(restaurantSchema),
    values: {
      name: restaurant?.name ?? '',
      description: restaurant?.description ?? '',
      phone: restaurant?.phone ?? '',
      address: restaurant?.address ?? '',
    },
  });

  const save = useMutation({
    mutationFn: (v: RestaurantForm) =>
      restaurant
        ? updateRestaurant(restaurant.id, v)
        : createRestaurant({
            ...v,
            phone: v.phone ?? '',
            address: v.address ?? '',
            ...DEFAULT_LOCATION,
          }),
    onSuccess: async () => {
      setError(null);
      await qc.invalidateQueries({ queryKey: ['restaurants'] });
      if (restaurant) setMessage('Dados salvos');
      else nav.goBack();
    },
    onError: (e) => setError(errorMessage(e)),
  });

  // capa e logo salvam assim que a foto sobe (não dependem do botão Salvar)
  const savePhoto = useMutation({
    mutationFn: (p: { coverUrl?: string | null; logoUrl?: string | null }) =>
      updateRestaurant(restaurant!.id, p),
    onSuccess: async () => {
      setError(null);
      await qc.invalidateQueries({ queryKey: ['restaurants'] });
      setMessage('Foto salva');
    },
    onError: (e) => setError(errorMessage(e)),
  });

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <Screen
      footer={
        <Snackbar visible={!!message} onDismiss={() => setMessage(null)} duration={2000}>
          {message}
        </Snackbar>
      }
    >
      {restaurant ? (
        <Panel style={{ backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }}>
          <Text variant="bodySmall" style={{ color: colors.muted }}>
            Endereço do cardápio para os clientes
          </Text>
          <Text variant="titleSmall" style={{ color: colors.brandDark, fontWeight: '700' }}>
            /r/{restaurant.slug}
          </Text>
        </Panel>
      ) : null}
      {restaurant ? (
        <Panel style={{ gap: 16 }}>
          <PhotoPicker
            label="Capa"
            aspectRatio={16 / 7}
            value={restaurant.coverUrl}
            onChange={(coverUrl) => savePhoto.mutate({ coverUrl })}
          />
          <View style={{ width: 140 }}>
            <PhotoPicker
              label="Logo"
              aspectRatio={1}
              value={restaurant.logoUrl}
              onChange={(logoUrl) => savePhoto.mutate({ logoUrl })}
            />
          </View>
        </Panel>
      ) : null}
      <Panel style={{ gap: 4 }}>
        {FIELDS.map((f) => (
          <View key={f.name}>
            <Controller
              control={control}
              name={f.name}
              render={({ field: { value, onChange } }) => (
                <TextInput
                  mode="outlined"
                  label={f.label}
                  value={value ?? ''}
                  onChangeText={onChange}
                  multiline={f.multiline}
                  error={!!errors[f.name]}
                />
              )}
            />
            <HelperText type="error" visible={!!errors[f.name]}>
              {errors[f.name]?.message}
            </HelperText>
          </View>
        ))}
      </Panel>
      {error ? (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      ) : null}
      <Button
        mode="contained"
        style={{ alignSelf: 'flex-end' }}
        loading={save.isPending}
        disabled={save.isPending || (!!restaurant && !isDirty)}
        onPress={handleSubmit((v) => save.mutate(v))}
      >
        {restaurant ? 'Salvar alterações' : 'Cadastrar restaurante'}
      </Button>
    </Screen>
  );
}
