import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  FAB,
  IconButton,
  Snackbar,
  Switch,
  Text,
  TextInput,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createCategory,
  deleteCategory,
  errorMessage,
  imageSrc,
  updateCategory,
  updateItem,
} from '@/api/client';
import type { MenuCategory, MenuItem } from '@/api/types';
import { useMenu, useRestaurant } from '@/hooks/data';
import { ConfirmDialog, Empty, Panel, Screen } from '@/components/ui';
import { money } from '@/utils/format';
import { colors } from '@/theme';

export default function MenuScreen() {
  const nav = useNavigation<any>();
  const qc = useQueryClient();
  const { restaurant } = useRestaurant();
  const { menu, isLoading, isRefetching, refetch } = useMenu(restaurant?.id);
  const [newCategory, setNewCategory] = useState('');
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const [removing, setRemoving] = useState<MenuCategory | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ['menus', restaurant?.id] });
  const onError = (e: unknown) => setMessage(errorMessage(e));

  const toggle = useMutation({
    mutationFn: (item: MenuItem) => updateItem(item.id, { isAvailable: !item.isAvailable }),
    onSuccess: refresh,
    onError,
  });
  const addCategory = useMutation({
    mutationFn: () => createCategory(menu!.id, newCategory.trim()),
    onSuccess: () => {
      setNewCategory('');
      refresh();
    },
    onError,
  });
  const rename = useMutation({
    mutationFn: () => updateCategory(renaming!.id, { name: renaming!.name.trim() }),
    onSuccess: () => {
      setRenaming(null);
      refresh();
    },
    onError,
  });
  const remove = useMutation({
    mutationFn: () => deleteCategory(removing!.id),
    onSuccess: () => {
      setMessage(`Categoria "${removing!.name}" removida`);
      setRemoving(null);
      refresh();
    },
    onError: (e) => {
      setRemoving(null);
      onError(e);
    },
  });

  if (isLoading || !menu) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <Screen
      refreshing={isRefetching}
      onRefresh={refetch}
      footer={
        <>
          {menu.categories.length ? (
            <FAB
              icon="plus"
              label="Novo item"
              style={styles.fab}
              color="#fff"
              onPress={() => nav.navigate('ItemForm', {})}
            />
          ) : null}
          <Snackbar visible={!!message} onDismiss={() => setMessage(null)} duration={3000}>
            {message}
          </Snackbar>
          <ConfirmDialog
            visible={!!removing}
            title="Remover categoria?"
            text={`"${removing?.name}" e os ${removing?.items.length ?? 0} itens dela saem do cardápio.`}
            confirmLabel="Remover"
            danger
            loading={remove.isPending}
            onConfirm={() => remove.mutate()}
            onDismiss={() => setRemoving(null)}
          />
        </>
      }
    >
      <Panel style={styles.importBanner}>
        <View style={{ flex: 1 }}>
          <Text variant="titleSmall" style={{ fontWeight: '700' }}>
            Tem o cardápio impresso?
          </Text>
          <Text variant="bodySmall" style={{ color: colors.muted }}>
            Tire uma foto e o OCR monta os itens para você revisar.
          </Text>
        </View>
        <Button mode="contained-tonal" icon="camera" onPress={() => nav.navigate('OCRImport')}>
          Importar foto
        </Button>
      </Panel>

      {!menu.categories.length ? (
        <Empty
          title="Cardápio vazio"
          text="Crie uma categoria (ex.: Lanches) ou importe uma foto do cardápio."
        />
      ) : null}

      {menu.categories.map((cat) => (
        <Panel key={cat.id} style={{ paddingVertical: 8 }}>
          <View style={styles.catHead}>
            {renaming?.id === cat.id ? (
              <TextInput
                dense
                mode="outlined"
                autoFocus
                value={renaming.name}
                onChangeText={(name) => setRenaming({ id: cat.id, name })}
                onSubmitEditing={() => rename.mutate()}
                style={{ flex: 1 }}
              />
            ) : (
              <Text variant="titleMedium" style={styles.catName}>
                {cat.name}
              </Text>
            )}
            {renaming?.id === cat.id ? (
              <IconButton icon="check" onPress={() => rename.mutate()} />
            ) : (
              <IconButton
                icon="pencil-outline"
                size={20}
                onPress={() => setRenaming({ id: cat.id, name: cat.name })}
              />
            )}
            <IconButton icon="trash-can-outline" size={20} onPress={() => setRemoving(cat)} />
          </View>
          {!cat.items.length ? (
            <Text variant="bodySmall" style={styles.noItems}>
              Nenhum item nesta categoria.
            </Text>
          ) : null}
          {cat.items.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => nav.navigate('ItemForm', { itemId: item.id })}
              style={styles.item}
            >
              {item.imageUrl ? (
                <Image
                  source={{ uri: imageSrc(item.imageUrl) }}
                  style={[styles.thumb, { opacity: item.isAvailable ? 1 : 0.5 }]}
                />
              ) : null}
              <View style={{ flex: 1, opacity: item.isAvailable ? 1 : 0.5 }}>
                <Text variant="bodyLarge" style={{ fontWeight: '600' }}>
                  {item.name}
                </Text>
                {item.description ? (
                  <Text variant="bodySmall" style={{ color: colors.muted }} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
                <Text variant="bodyMedium" style={styles.price}>
                  {money(item.price)}
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Switch value={item.isAvailable} onValueChange={() => toggle.mutate(item)} />
                <Text variant="labelSmall" style={{ color: colors.muted }}>
                  {item.isAvailable ? 'À venda' : 'Esgotado'}
                </Text>
              </View>
            </Pressable>
          ))}
          <Button
            icon="plus"
            compact
            style={{ alignSelf: 'flex-start', marginTop: 4 }}
            onPress={() => nav.navigate('ItemForm', { categoryId: cat.id })}
          >
            Item em {cat.name}
          </Button>
        </Panel>
      ))}

      <Panel style={styles.newCat}>
        <TextInput
          dense
          mode="outlined"
          label="Nova categoria"
          placeholder="ex.: Sobremesas"
          value={newCategory}
          onChangeText={setNewCategory}
          onSubmitEditing={() => newCategory.trim().length >= 2 && addCategory.mutate()}
          style={{ flex: 1 }}
        />
        <Button
          mode="contained"
          disabled={newCategory.trim().length < 2}
          loading={addCategory.isPending}
          onPress={() => addCategory.mutate()}
        >
          Criar
        </Button>
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  catHead: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  catName: { flex: 1, fontWeight: '700' },
  fab: { backgroundColor: colors.brand, bottom: 16, position: 'absolute', right: 16 },
  importBanner: {
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
    flexDirection: 'row',
    gap: 12,
  },
  item: {
    alignItems: 'center',
    borderColor: colors.line,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
  },
  newCat: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  noItems: { color: colors.muted, paddingVertical: 8 },
  price: { color: colors.brandDark, fontWeight: '700', marginTop: 2 },
  thumb: { borderRadius: 10, height: 56, width: 56 },
});
