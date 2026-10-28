import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, IconButton, Text, TextInput } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { errorMessage, importItems } from '@/api/client';
import type { OcrUploadResult } from '@/api/types';
import { useRestaurant } from '@/hooks/data';
import { Panel, Screen } from '@/components/ui';
import { ocrItemSchema, type OcrItemForm } from '@/utils/validators';
import { parsePrice, priceText } from '@/utils/format';
import { colors } from '@/theme';

// Abaixo disso o OCR provavelmente errou alguma letra ou o preço
const LOW_CONFIDENCE = 0.75;

export default function OCRReviewScreen() {
  const nav = useNavigation<any>();
  const qc = useQueryClient();
  const { restaurant } = useRestaurant();
  const { uploadId, menuId, items: found } = useRoute<any>().params as OcrUploadResult;
  const [items, setItems] = useState<OcrItemForm[]>(() =>
    found.map((i) => ({
      name: i.name,
      price: priceText(i.price),
      description: i.description ?? '',
      category: i.category ?? '',
      confidence: i.confidence,
    }))
  );
  const [error, setError] = useState<string | null>(null);

  const invalid = items.map((i) => !ocrItemSchema.safeParse(i).success);
  const edit = (idx: number, patch: Partial<OcrItemForm>) =>
    setItems((list) => list.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const save = useMutation({
    mutationFn: () =>
      importItems(
        menuId,
        uploadId,
        items.map((i) => ({
          name: i.name.trim(),
          price: parsePrice(i.price),
          description: i.description?.trim() || undefined,
          category: i.category?.trim() || undefined,
          confidence: i.confidence,
        }))
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menus', restaurant?.id] });
      nav.reset({ index: 1, routes: [{ name: 'Dashboard' }, { name: 'Menu' }] });
    },
    onError: (e) => setError(errorMessage(e)),
  });

  return (
    <Screen>
      <Panel style={styles.summary}>
        <Text variant="titleMedium" style={{ fontWeight: '700' }}>
          {items.length} itens encontrados
        </Text>
        <Text variant="bodySmall" style={{ color: colors.muted }}>
          Confira nome, preço e categoria. Itens com leitura duvidosa estão marcados em laranja.
          Categorias novas são criadas sozinhas.
        </Text>
      </Panel>

      {items.map((item, idx) => {
        const doubtful = (item.confidence ?? 1) < LOW_CONFIDENCE;
        return (
          <Panel key={idx} style={[styles.item, doubtful && styles.doubtful]}>
            <View style={styles.row}>
              <TextInput
                dense
                mode="outlined"
                label="Nome"
                value={item.name}
                onChangeText={(name) => edit(idx, { name })}
                style={{ flex: 3 }}
              />
              <TextInput
                dense
                mode="outlined"
                label="Preço"
                value={item.price}
                onChangeText={(price) => edit(idx, { price })}
                keyboardType="decimal-pad"
                left={<TextInput.Affix text="R$" />}
                style={{ flex: 1.4, minWidth: 110 }}
              />
              <IconButton
                icon="close"
                size={20}
                accessibilityLabel="Descartar item"
                onPress={() => setItems((list) => list.filter((_, i) => i !== idx))}
              />
            </View>
            <View style={styles.row}>
              <TextInput
                dense
                mode="outlined"
                label="Categoria"
                value={item.category}
                placeholder="Importados"
                onChangeText={(category) => edit(idx, { category })}
                style={{ flex: 1 }}
              />
              <TextInput
                dense
                mode="outlined"
                label="Descrição"
                value={item.description}
                onChangeText={(description) => edit(idx, { description })}
                style={{ flex: 2 }}
              />
            </View>
            {doubtful || invalid[idx] ? (
              <Text
                variant="bodySmall"
                style={{ color: invalid[idx] ? colors.danger : colors.warn }}
              >
                {invalid[idx]
                  ? 'Revise o nome e o preço deste item.'
                  : `Leitura duvidosa (${Math.round((item.confidence ?? 0) * 100)}%)`}
              </Text>
            ) : null}
          </Panel>
        );
      })}

      {error ? (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      ) : null}

      <View style={styles.buttons}>
        <Button onPress={() => nav.goBack()}>Outra foto</Button>
        <Button
          mode="contained"
          icon="check"
          disabled={!items.length || invalid.some(Boolean) || save.isPending}
          loading={save.isPending}
          onPress={() => save.mutate()}
        >
          Adicionar {items.length} ao cardápio
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  buttons: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  doubtful: { borderColor: '#FDBA74', borderWidth: 1.5 },
  item: { gap: 8 },
  row: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  summary: { backgroundColor: '#FFF7ED', borderColor: '#FED7AA', gap: 4 },
});
