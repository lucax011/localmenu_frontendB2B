import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Chip,
  HelperText,
  Switch,
  Text,
  TextInput,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createItem, deleteItem, errorMessage, updateItem } from '@/api/client';
import { useMenu, useRestaurant } from '@/hooks/data';
import { ConfirmDialog, Panel, Screen } from '@/components/ui';
import PhotoPicker from '@/components/PhotoPicker';
import { itemSchema, type ItemForm } from '@/utils/validators';
import { parsePrice, priceText } from '@/utils/format';
import { colors } from '@/theme';

export default function ItemFormScreen() {
  const nav = useNavigation<any>();
  const { params } = useRoute<any>();
  const itemId: string | undefined = params?.itemId;
  const qc = useQueryClient();
  const { restaurant } = useRestaurant();
  const { menu } = useMenu(restaurant?.id);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const editing = menu?.categories.flatMap((c) => c.items).find((i) => i.id === itemId);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemForm>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      price: '',
      description: '',
      categoryId: params?.categoryId ?? menu?.categories[0]?.id ?? '',
      isAvailable: true,
    },
  });

  useEffect(() => {
    nav.setOptions({ title: itemId ? 'Editar item' : 'Novo item' });
    if (editing) {
      reset({
        name: editing.name,
        price: priceText(editing.price),
        description: editing.description ?? '',
        categoryId: editing.categoryId,
        isAvailable: editing.isAvailable,
      });
      setImageUrl(editing.imageUrl ?? null);
    }
  }, [editing, itemId, nav, reset]);

  const done = () => {
    qc.invalidateQueries({ queryKey: ['menus', restaurant?.id] });
    nav.goBack();
  };
  const save = useMutation({
    mutationFn: (v: ItemForm) => {
      const payload = { ...v, name: v.name.trim(), price: parsePrice(v.price), imageUrl };
      return itemId ? updateItem(itemId, payload) : createItem(payload);
    },
    onSuccess: done,
    onError: (e) => setError(errorMessage(e)),
  });
  const remove = useMutation({
    mutationFn: () => deleteItem(itemId!),
    onSuccess: done,
    onError: (e) => {
      setConfirmDelete(false);
      setError(errorMessage(e));
    },
  });

  if (!menu || (itemId && !editing)) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <Screen
      footer={
        <ConfirmDialog
          visible={confirmDelete}
          title="Excluir item?"
          text="Se o item já tem pedidos, marque como esgotado em vez de excluir."
          confirmLabel="Excluir"
          danger
          loading={remove.isPending}
          onConfirm={() => remove.mutate()}
          onDismiss={() => setConfirmDelete(false)}
        />
      }
    >
      <Panel>
        <PhotoPicker label="Foto do prato" value={imageUrl} onChange={setImageUrl} />
      </Panel>
      <Panel style={{ gap: 4 }}>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange } }) => (
            <TextInput
              mode="outlined"
              label="Nome"
              value={value}
              onChangeText={onChange}
              error={!!errors.name}
            />
          )}
        />
        <HelperText type="error" visible={!!errors.name}>
          {errors.name?.message}
        </HelperText>
        <Controller
          control={control}
          name="price"
          render={({ field: { value, onChange } }) => (
            <TextInput
              mode="outlined"
              label="Preço"
              left={<TextInput.Affix text="R$" />}
              value={value}
              onChangeText={onChange}
              keyboardType="decimal-pad"
              placeholder="0,00"
              error={!!errors.price}
            />
          )}
        />
        <HelperText type="error" visible={!!errors.price}>
          {errors.price?.message}
        </HelperText>
        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange } }) => (
            <TextInput
              mode="outlined"
              label="Descrição (opcional)"
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={3}
            />
          )}
        />

        <Text variant="labelLarge" style={styles.label}>
          Categoria
        </Text>
        <Controller
          control={control}
          name="categoryId"
          render={({ field: { value, onChange } }) => (
            <View style={styles.chips}>
              {menu.categories.map((c) => (
                <Chip
                  key={c.id}
                  selected={value === c.id}
                  style={value === c.id ? styles.chipOn : undefined}
                  onPress={() => onChange(c.id)}
                >
                  {c.name}
                </Chip>
              ))}
            </View>
          )}
        />
        <HelperText type="error" visible={!!errors.categoryId}>
          {errors.categoryId?.message}
        </HelperText>

        <Controller
          control={control}
          name="isAvailable"
          render={({ field: { value, onChange } }) => (
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyLarge">Disponível para venda</Text>
                <Text variant="bodySmall" style={{ color: colors.muted }}>
                  Desligue quando o item acabar.
                </Text>
              </View>
              <Switch value={value} onValueChange={onChange} />
            </View>
          )}
        />
      </Panel>

      {error ? (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      ) : null}

      <View style={styles.buttons}>
        {itemId ? (
          <Button textColor={colors.danger} onPress={() => setConfirmDelete(true)}>
            Excluir
          </Button>
        ) : (
          <View />
        )}
        <Button
          mode="contained"
          loading={save.isPending}
          disabled={save.isPending}
          onPress={handleSubmit((v) => save.mutate(v))}
          contentStyle={{ paddingHorizontal: 12 }}
        >
          {itemId ? 'Salvar' : 'Adicionar ao cardápio'}
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  buttons: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  chipOn: { backgroundColor: '#FFEDD5' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  label: { color: colors.ink, marginBottom: 8, marginTop: 12 },
  switchRow: { alignItems: 'center', flexDirection: 'row', gap: 12, marginTop: 4 },
});
